"use client"
import React, { useEffect, useState } from "react";
import "../styles/TradeTable.css";
import TradingViewWidget from "./TradingViewWidget";
import Link from "next/link";

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

  const calculatePnL = ({ entry, amount, type }, priceNow) => {
    const diff = type.toLowerCase() === 'long' ? priceNow - entry : entry - priceNow;
    return (amount * diff) / entry;
  };

  return (
    <div className='trade-table-container'>
      <h1><Link href={"/"}> Back </Link>Trade Detail - ID: {id}</h1>
      <div className="img-cont">
        {symbol && (
          <div className='widget-c'>
            <TradingViewWidget symbol={symbol} />
          </div>
        )}
        {image && (
          <img className="trade-image" src={image} alt={symbol} />
        )}
      </div>
      {trades.length > 0 ? (
        trades.map((trade) => (
          <div className="trade-detail" key={trade.id}>
            <p><strong>Asset:</strong> {trade.asset}</p>
            <p><strong>Type:</strong> {trade.type}</p>
            <p><strong>Entry:</strong> {trade.entry}</p>
            <p><strong>Amount:</strong> {trade.amount}</p>
            <p><strong>Stop Loss:</strong> {trade.stopLoss}</p>
            <p><strong>Take Profit:</strong> {trade.takeProfit}</p>
            <p><strong>Status:</strong> {trade.status}</p>
          </div>
        ))
      ) : (
        <p>{loading ? "Veri yükleniyor..." : error}</p>
      )}
      {price !== null && <p>Current Price: {price}</p>}
      <h1>TEST</h1>
    </div>
  );
};

export default TradeDetail;

