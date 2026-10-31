"""今日市場：抓台股、美股、國際市場數字，寫成 market.json。

由 GitHub 排程（.github/workflows/market.yml）盤中每 10 分鐘執行，結果推到 data 分支；
網站（news.html 財經日報、index.html 跑馬燈）從 data 分支讀。
用法：python market_snapshot.py 輸出路徑 [上一次的 market.json]
- 只用 Python 標準函式庫，GitHub 上不用另外安裝套件
- 任何一項抓不到就沿用上一次的數字，頁面不會壞掉
- 三大法人、漲跌家數只算上市，和加權指數同一個範圍
"""
import datetime, json, sys, time, urllib.parse, urllib.request

TPE = datetime.timezone(datetime.timedelta(hours=8))
UA = {"User-Agent": "Mozilla/5.0"}

TW_INDEX = ("加權指數", "^TWII")
US_IDX = [("道瓊", "^DJI"), ("S&P 500", "^GSPC"), ("NASDAQ", "^IXIC"), ("費城半導體", "^SOX")]
CROSS = [("台積電 ADR", "TSM"), ("日經 225", "^N225"), ("原油", "CL=F"), ("美元／台幣", "TWD=X"), ("美債 10 年", "^TNX"), ("黃金", "GC=F")]
CHAIN_US = [("NVIDIA", "NVDA"), ("Microsoft", "MSFT"), ("Alphabet", "GOOGL")]
CHAIN_TW = [("台積電", "2330.TW"), ("聯發科", "2454.TW"), ("鴻海", "2317.TW"), ("廣達", "2382.TW")]
# 產業溫度計：證交所類股指數名稱 → 網站顯示名稱
SECTORS = {"半導體": "半導體", "電子零組件": "電子零組件", "電腦及週邊設備": "電腦週邊", "光電": "光電", "通信網路": "通信網路",
           "電子通路": "電子通路", "資訊服務": "資訊服務", "其他電子": "其他電子", "航運": "航運", "金融保險": "金融保險",
           "塑膠": "塑膠", "鋼鐵": "鋼鐵", "生技醫療": "生技醫療", "汽車": "汽車", "建材營造": "建材營造", "食品": "食品",
           "電機機械": "電機機械", "綠能環保": "綠能環保", "貿易百貨": "貿易百貨", "觀光餐旅": "觀光餐旅", "水泥": "水泥",
           "紡織纖維": "紡織纖維", "化學": "化學", "油電燃氣": "油電燃氣"}


def get(url):
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20))


def quote(name, symbol):
    """最新價（盤中就是盤中價）、前一天收盤、漲跌幅、資料日期、是否盤中。"""
    m = get(f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(symbol)}?range=1d&interval=5m")["chart"]["result"][0]["meta"]
    tz = datetime.timezone(datetime.timedelta(seconds=m["gmtoffset"]))
    t = m["regularMarketTime"]
    reg = m["currentTradingPeriod"]["regular"]
    price, prev = m["regularMarketPrice"], m.get("previousClose") or m["chartPreviousClose"]
    return {"name": name, "symbol": symbol, "price": round(price, 2), "prev": round(prev, 2),
            "pct": round((price - prev) / prev * 100, 2), "date": datetime.datetime.fromtimestamp(t, tz).strftime("%m/%d"),
            "live": reg["start"] <= time.time() < reg["end"]}


# 有問題就記下來，最後讓 GitHub 排程標成失敗並寄通知。偶爾一兩檔抓不到下一輪就好了，不算問題
PROBLEMS, MISSED = [], []


def quotes(pairs, old):
    keep = {q["symbol"]: q for q in old or []}
    out = []
    for name, sym in pairs:
        try:
            out.append(quote(name, sym))
        except Exception as e:
            print("抓不到", sym, e)
            MISSED.append(f"{name}（{e}）")
            if sym in keep:
                out.append(keep[sym])
    return out


def num(s):
    return float(s.replace(",", ""))


def twse(old):
    """證交所盤後資料（收盤後才有）：漲跌家數、三大法人、類股指數。從今天往前找最近一個交易日。"""
    today = datetime.datetime.now(TPE).date()
    tw = dict(old or {})
    for kind in ("breadth", "inst", "sectors"):
        for back in range(8):
            d = today - datetime.timedelta(days=back)
            md = d.strftime("%m/%d")
            if (tw.get(kind) or {}).get("date") == md:
                break  # 已經是最新的，不用再抓
            ymd = d.strftime("%Y%m%d")
            try:
                if kind == "breadth":
                    j = get(f"https://www.twse.com.tw/exchangeReport/MI_INDEX?response=json&date={ymd}&type=MS")
                    t = next((x for x in j.get("tables", []) if x.get("title") == "漲跌證券數合計"), None)
                    if not t:
                        continue
                    r = {row[0][:2]: row[2] for row in t["data"]}  # 「股票」欄
                    tw[kind] = {"date": md, "up": int(num(r["上漲"].split("(")[0])),
                                "down": int(num(r["下跌"].split("(")[0])), "flat": int(num(r["持平"]))}
                elif kind == "inst":
                    j = get(f"https://www.twse.com.tw/fund/BFI82U?response=json&dayDate={ymd}&type=day")
                    if j.get("stat") != "OK":
                        continue
                    r = {row[0]: num(row[3]) / 1e8 for row in j["data"]}
                    tw[kind] = {"date": md, "foreign": round(r["外資及陸資(不含外資自營商)"], 1), "trust": round(r["投信"], 1),
                                "dealer": round(r["自營商(自行買賣)"] + r["自營商(避險)"], 1), "total": round(r["合計"], 1)}
                else:
                    j = get(f"https://www.twse.com.tw/exchangeReport/MI_INDEX?response=json&date={ymd}&type=IND")
                    rows = [row for t in j.get("tables", []) if t for row in t.get("data", [])]
                    items = [[SECTORS[row[0][:-3]], float(row[4])] for row in rows
                             if row[0].endswith("類指數") and row[0][:-3] in SECTORS]
                    if not items:
                        continue
                    tw[kind] = {"date": md, "items": sorted(items, key=lambda x: -x[1])}
                break
            except Exception as e:
                print("證交所", kind, ymd, e)
                break  # 連不上就沿用上一次，不要一直重試
            finally:
                time.sleep(1.5)  # 證交所有流量限制
    return tw


def main():
    out = sys.argv[1]
    old = {}
    if len(sys.argv) > 2:
        try:
            old = json.load(open(sys.argv[2], encoding="utf-8"))
        except Exception:
            pass
    tw_idx = quotes([TW_INDEX], [old["tw"]["index"]] if old.get("tw", {}).get("index") else [])
    data = {
        "updated": datetime.datetime.now(TPE).strftime("%Y-%m-%dT%H:%M"),
        "tw": {**twse(old.get("tw")), "index": tw_idx[0] if tw_idx else None},
        "us": quotes(US_IDX, old.get("us")),
        "cross": quotes(CROSS, old.get("cross")),
        "chain": {"us": quotes(CHAIN_US, (old.get("chain") or {}).get("us")),
                  "tw": quotes(CHAIN_TW, (old.get("chain") or {}).get("tw"))},
    }
    check(data)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print("寫好", out, data["updated"])
    if PROBLEMS:
        print("\n⚠️ 今日市場更新有問題：\n- " + "\n- ".join(PROBLEMS))
        sys.exit(2)  # 數字照樣寫出去（沿用上一次），但排程標成失敗，GitHub 會寄通知


def check(data):
    """台股今天有開盤（加權指數日期＝今天）時，收盤後的證交所資料也要是今天的；休市日不檢查。"""
    if len(MISSED) >= 5:
        PROBLEMS.append(f"Yahoo 有 {len(MISSED)} 項抓不到：" + "、".join(MISSED))
    now = datetime.datetime.now(TPE)
    today = now.strftime("%m/%d")
    tw = data["tw"]
    if not tw.get("index") or tw["index"]["date"] != today:
        return
    hm = now.strftime("%H:%M")
    for kind, after, label in (("breadth", "14:30", "漲跌家數"), ("sectors", "14:30", "類股指數"), ("inst", "15:15", "三大法人")):
        if hm >= after and (tw.get(kind) or {}).get("date") != today:
            PROBLEMS.append(f"{hm} 了，{label}還是 {(tw.get(kind) or {}).get('date')} 的資料，沒抓到今天（{today}）")


if __name__ == "__main__":
    main()
