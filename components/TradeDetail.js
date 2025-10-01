"use client"
import React, { useEffect, useState } from "react";
import "../styles/TradeTable.css";
import TradingViewWidget from "./TradingViewWidget";
import Link from "next/link";
import { formatNumber } from "@/utils/format";

const TradeDetail = ({ id }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [price, setPrice] = useState(null);
  const [symbol, setSymbol] = useState(null);
  const [image, setImage] = useState(null);

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/get-trade', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Hata oluştu');
        return null;
      }

      const trade = data.trades[0];
      if (trade) {
        setTrades(data.trades);
        setSymbol(trade.asset === "GOLD" ? "PAXG" : trade.asset);
        setImage(trade.imageUrl);
      }
      return trade;
    } catch (err) {
      setError('Ağ hatası');
      return null;
    }
  };

  const fetchCryptoPrice = async (currentSymbol) => {
    if (!currentSymbol) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crypto`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        switch (currentSymbol.toLowerCase()) {
          case 'btc':
            setPrice(data.BTC);
            break;
          case 'eth':
            setPrice(data.ETH);
            break;
          case 'gold':
          case 'paxg':
            setPrice(data.PAXG);
            break;
          default:
            setPrice(null);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      const trade = await fetchTrades();
      if (isMounted && trade) {
        await fetchCryptoPrice(trade.asset === "GOLD" ? "PAXG" : trade.asset);
      }
      if (isMounted) setLoading(false);
    };

    init();

    const interval = setInterval(() => {
      if (isMounted) fetchCryptoPrice(symbol);
    }, 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol, id]);

  const calculatePnL = ({ entry, amount, type }) => {
    if (!price) return 0;
    const diff = type.toLowerCase() === 'long' ? price - entry : entry - price;
    return (amount * diff) / entry;
  };

  const calculatePercent = (trade) => {
    const { entry, type } = trade;
    if (!entry || !price) return null;

    const isLong = type.toLowerCase() === 'long';
    const result = isLong ? ((price - entry) / entry) * 100 : ((entry - price) / entry) * 100;
    return result.toFixed(1);
  };

  return (
    <div className='trade-table-container'>
      <h1>
        <Link href={"/"}> Back </Link> Trade Detail - ID: {id}
      </h1>

      {trades.length > 0 ? (
        trades.map((trade) => (
          <div className="trade-detail-row" key={trade.id}>
            <div className="flex-v2">
              <img className="l-clear" src={`../logo/${trade.asset.toLowerCase()}-logo.png`} alt={trade.asset} />
              <span><strong>{trade.asset + 'USDT'}</strong></span>
            </div>
            <p><strong className={"color-" + trade.type.toLowerCase()}>{trade.type}</strong></p>
            <p><strong>Entry:</strong> {formatNumber(trade.entry)}</p>
            <p><strong>Exit:</strong> {trade.exit ? formatNumber(trade.exit) : "-"}</p>
            <p><strong>Stop Loss:</strong> {formatNumber(trade.stopLoss)}</p>
            <p><strong>Take Profit:</strong> {formatNumber(trade.takeProfit)}</p>
            <p><strong>Amount:</strong> {formatNumber(trade.amount)}</p>
            {calculatePercent(trade) !== null && (
              <span style={{ color: calculatePercent(trade) >= 0 ? 'lightgreen' : 'red' }}>
                <strong className="bHeader">Percent: </strong>{calculatePercent(trade)}%
              </span>
            )}
            <span style={{ color: calculatePnL(trade) >= 0 ? 'lightgreen' : 'red' }}>
              <strong className="bHeader">Profit: </strong>{formatNumber(calculatePnL(trade))}
            </span>
            <span className={`status ${trade.status.toLowerCase()}`}>{trade.status}</span>
          </div>
        ))
      ) : (
        <p>{loading ? "Veri yükleniyor..." : error}</p>
      )}

      <div className="img-cont">
        {symbol && (
          <div className='widget-c'>
            <TradingViewWidget symbol={symbol} />
          </div>
        )}
      </div>

      {price !== null && <p>Current Price: {price}</p>}
    </div>
  );
};

export default TradeDetail;
