"use client"
import React from "react";
import "../styles/TradeTable.css";
import { useEffect, useState } from 'react';
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
    setLoading(true);
    try {
      const res = await fetch('/api/get-trade', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Hata oluştu');
      } else {
        setTrades(data.trades || []);
        
        if (data.trades[0].asset === "GOLD") {
         setSymbol("PAXG");
        } else {
          setSymbol(data.trades[0].asset);
        }

        setImage(data.trades[0].imageUrl);
      }
    } catch (err) {
      setError('Ağ hatası');
    } finally {
      setLoading(false);
    }
  };

  const crptoPrice = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crypto`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setPrice(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTrades();
    crptoPrice();

    const interval = setInterval(() => {
      crptoPrice();
    }, 60 * 1000); 

    return () => clearInterval(interval); 
  }, []);

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
          <img className="trade-image" src={image} />
         )}
        </div>
          {trades && trades.length > 0 ? (
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
            <p>Veri yükleniyor...</p>
          )}
        <p>{price && price.BTC }</p>
        <h1>TEST</h1>
      </div>
  );
};

export default TradeDetail;
