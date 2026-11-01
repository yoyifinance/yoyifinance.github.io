#!/usr/bin/env python3
"""官網流量週報：讀 GA4 + Search Console，輸出本週 vs 上週的數字（JSON）。

金鑰放在雲端環境變數 GA_SA_JSON（服務帳戶 JSON，一行），不要寫進 repo。
需要網路：oauth2.googleapis.com、analyticsdata.googleapis.com、searchconsole.googleapis.com
用法：python3 tools/traffic_report.py [輸出檔.json]
期間：本週＝最近 7 個完整日（到昨天）、上週＝再往前 7 天。Search Console 資料約晚 3 天，往前錯開。
"""
import json, os, sys, datetime as dt, subprocess

try:
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', 'google-auth', 'requests'])
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession

PROPERTY = '561806431'
SITE = 'https://yoyifinance.github.io/'
EVENTS = ['join_line', 'booking_click', 'ig_click', 'form_next', 'calc_use']
TZ = dt.timezone(dt.timedelta(hours=8))

raw = os.environ.get('GA_SA_JSON', '').strip()
if not raw:
    sys.exit('GA_SA_JSON 沒有設定（雲端環境 → 環境變數）')
if raw[:1] in '\'"' and raw[-1:] == raw[:1]:
    raw = raw[1:-1]
info = json.loads(raw)
creds = service_account.Credentials.from_service_account_info(info, scopes=[
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly'])
S = AuthorizedSession(creds)

today = dt.datetime.now(TZ).date()
def rng(end_back, days=7):
    e = today - dt.timedelta(days=end_back); s = e - dt.timedelta(days=days - 1)
    return {'startDate': s.isoformat(), 'endDate': e.isoformat()}
THIS, PREV = rng(1), rng(8)
GTHIS, GPREV = rng(3), rng(10)

def ga(body):
    r = S.post(f'https://analyticsdata.googleapis.com/v1beta/properties/{PROPERTY}:runReport', json=body, timeout=60)
    if r.status_code != 200:
        raise RuntimeError(f'GA {r.status_code}: {r.text[:500]}')
    return r.json()

def ga_rows(dims, mets, extra=None, limit=20):
    out = {}
    for name, period in (('this', THIS), ('prev', PREV)):
        b = {'dateRanges': [period], 'dimensions': [{'name': d} for d in dims],
             'metrics': [{'name': m} for m in mets], 'limit': limit}
        if extra: b.update(extra)
        res = ga(b)
        out[name] = [{**{d: row['dimensionValues'][i]['value'] for i, d in enumerate(dims)},
                      **{m: float(row['metricValues'][i]['value']) for i, m in enumerate(mets)}}
                     for row in res.get('rows', [])]
    return out

TOT = ['activeUsers', 'newUsers', 'sessions', 'screenPageViews', 'averageSessionDuration', 'engagementRate']
report = {'generated': dt.datetime.now(TZ).isoformat(timespec='minutes'), 'period': {'this': THIS, 'prev': PREV}}
report['totals'] = {k: (v[0] if v else {}) for k, v in ga_rows([], TOT).items()}
report['sources'] = ga_rows(['sessionSourceMedium'], ['sessions', 'activeUsers'],
                            {'orderBys': [{'metric': {'metricName': 'sessions'}, 'desc': True}]}, 10)
report['pages'] = ga_rows(['pagePath'], ['screenPageViews', 'activeUsers'],
                          {'orderBys': [{'metric': {'metricName': 'screenPageViews'}, 'desc': True}]}, 15)
report['events'] = ga_rows(['eventName', 'pagePath'], ['eventCount'],
                           {'dimensionFilter': {'filter': {'fieldName': 'eventName', 'inListFilter': {'values': EVENTS}}}}, 100)

def gsc(period, dims=None, limit=10):
    b = {**period, 'rowLimit': limit}
    if dims: b['dimensions'] = dims
    r = S.post('https://searchconsole.googleapis.com/webmasters/v3/sites/' + SITE.replace(':', '%3A').replace('/', '%2F') + '/searchAnalytics/query', json=b, timeout=60)
    if r.status_code != 200:
        raise RuntimeError(f'Search Console {r.status_code}: {r.text[:500]}')
    return r.json().get('rows', [])
try:
    report['search'] = {'period': {'this': GTHIS, 'prev': GPREV},
                        'totals': {'this': gsc(GTHIS), 'prev': gsc(GPREV)},
                        'queries': {'this': gsc(GTHIS, ['query']), 'prev': gsc(GPREV, ['query'])}}
except Exception as e:
    report['search'] = {'error': str(e)}

out = json.dumps(report, ensure_ascii=False, indent=1)
if len(sys.argv) > 1:
    open(sys.argv[1], 'w', encoding='utf8').write(out)
print(out)
