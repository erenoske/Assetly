"use client"
import React from "react";
import "../styles/TradeTable.css";
import TradeFormPopup from "./TradeFormPopup";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const TradeTable = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [btcPrice, setBtcPrice] = useState(null);
  const [goldPrice, setGoldPrice] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/get-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Hata oluştu');
      } else {
        setTrades(data.trades || []);
      }
    } catch (err) {
      setError('Ağ hatası');
    }
  };

  const crptoPrice = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crypto`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setBtcPrice(data.BTC);
        setGoldPrice(data.PAXG);
        setEthPrice(data.ETH);
      }
    } catch (err) {
      console.log(err);
    } 
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchTrades(),
          crptoPrice()
        ]);
      } catch (err) {
        setError('Yükleme hatası');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const interval = setInterval(() => {
      crptoPrice();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

const calculatePnL = (trade, btcPrice, ethPrice, goldPrice) => {
  const entry = Number(trade.entry);
  const amount = Number(trade.amount);
  if (!entry || !amount) return 0;

  let priceNow = null;
  switch (trade.asset.toLowerCase()) {
    case 'btc':
      priceNow = Number(btcPrice);
      break;
    case 'eth':
      priceNow = Number(ethPrice);
      break;
    case 'gold':
      priceNow = Number(goldPrice);
      break;
    default:
      return 0;
  }

  if (!priceNow) return 0;

  const diff = trade.type.toLowerCase() === 'long' ? priceNow - entry : entry - priceNow;

  return (amount * diff) / entry;
};

  const router = useRouter();

  const handleClick = (id) => {
    router.push(`/trade/${id}`);
  };

  return (
    <div>
      <div className="trade-header">
        <h2>Trade Records</h2>
        <TradeFormPopup onTradeAdded={fetchTrades} />
      </div>
      <div className="table-wrapper">
        {loading && (
          <div className="t-loading-box"></div>
        )}
        {!loading && (
          <table className="trade-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>SL</th>
                <th>TP</th>
                <th>Amount ($)</th>
                <th>Percent</th>
                <th>Profit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} onClick={() => handleClick(trade.id)} style={{ cursor: 'pointer' }}>
                  <td className={trade.type.toLowerCase()} >
                    <div className="flex-v2">
                      <img src={'logo/' + trade.asset.toLowerCase() + '-logo.png'} />
                      <span>{trade.asset + 'USDT'}</span>
                    </div>
                  </td>
                  <td>{trade.type}</td>
                  <td>{Number(trade.entry).toFixed(2)}</td>
                  <td>{trade.exit ?? "-"}</td>
                  <td>{Number(trade.stopLoss).toFixed(2)}</td>
                  <td>{Number(trade.takeProfit).toFixed(0)}</td>
                  <td>${Number(trade.amount).toFixed(0)}</td>
                 <td>
                   {btcPrice != null && ethPrice != null && goldPrice != null && trade.entry && (() => {
                     const entry = Number(trade.entry);
                 
                     // trade.asset değerine göre fiyat seç
                     let currentPrice = null;
                     switch (trade.asset.toLowerCase()) {
                       case 'btc':
                         currentPrice = Number(btcPrice);
                         break;
                       case 'eth':
                         currentPrice = Number(ethPrice);
                         break;
                       case 'gold':
                         currentPrice = Number(goldPrice);
                         break;
                       default:
                         currentPrice = null;
                     }
                 
                     if (currentPrice === null) return null; // Fiyat yoksa gösterme
                 
                     const isLong = trade.type.toLowerCase() === 'long';
                     const result = isLong
                       ? ((currentPrice - entry) / entry) * 100
                       : ((entry - currentPrice) / entry) * 100;
                 
                     const formatted = result.toFixed(1);
                 
                     return (
                       <span style={{ color: result >= 0 ? 'lightgreen' : 'red' }}>
                         {formatted}%
                       </span>
                     );
                   })()}
                 </td>
                 <td>
                   <span style={{ color: calculatePnL(trade, btcPrice, ethPrice, goldPrice) >= 0 ? 'lightgreen' : 'red' }}>
                     ${calculatePnL(trade, btcPrice, ethPrice, goldPrice).toFixed(2)}
                   </span>
                 </td>
                  <td>
                    <span className={`status ${trade.status.toLowerCase()}`}>
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TradeTable;
