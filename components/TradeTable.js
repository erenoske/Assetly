
"use client"
import React, { useEffect, useState } from "react";
import "../styles/TradeTable.css";
import TradeFormPopup from "./TradeFormPopup";
import { useRouter } from 'next/navigation';
import { formatNumber } from "@/utils/format";
import { TbTriangleFilled } from "react-icons/tb";
import { TbTriangleInvertedFilled } from "react-icons/tb";


const TradeTable = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prices, setPrices] = useState({ BTC: null, ETH: null, GOLD: null });
  const [totalPnl, setTotalPnl] = useState(0);

  const router = useRouter();

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

  const fetchCryptoPrices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crypto`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setPrices({
          BTC: data.BTC,
          ETH: data.ETH,
          GOLD: data.PAXG || data.GOLD
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect( () => {
    if(trades.length > 0 && Object.keys(prices).length > 0) {
      const total = trades.reduce( (sum, trade) => sum + calculatePnL(trade), 0)
      setTotalPnl(total);
    }
  }, [trades, prices])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchTrades(), fetchCryptoPrices()]);
      } catch (err) {
        setError('Yükleme hatası');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const interval = setInterval(() => {
      fetchCryptoPrices();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // PnL ve yüzde hesaplama helper fonksiyonu
  const calculatePnL = (trade) => {
    const { entry, amount, type, asset } = trade;
    const entryNum = Number(entry);
    const amountNum = Number(amount);
    if (!entryNum || !amountNum) return 0;

    let priceNow = null;
    switch (asset.toLowerCase()) {
      case 'btc': priceNow = prices.BTC; break;
      case 'eth': priceNow = prices.ETH; break;
      case 'gold': priceNow = prices.GOLD; break;
      default: return 0;
    }

    if (!priceNow) return 0;

    const diff = type.toLowerCase() === 'long' ? priceNow - entryNum : entryNum - priceNow;
    return (amountNum * diff) / entryNum;
  };

  const calculatePercent = (trade) => {
    const { entry, type, asset } = trade;
    const entryNum = Number(entry);
    if (!entryNum) return null;

    let priceNow = null;
    switch (asset.toLowerCase()) {
      case 'btc': priceNow = prices.BTC; break;
      case 'eth': priceNow = prices.ETH; break;
      case 'gold': priceNow = prices.GOLD; break;
      default: return null;
    }

    if (!priceNow) return null;

    const isLong = type.toLowerCase() === 'long';
    const result = isLong ? ((priceNow - entryNum) / entryNum) * 100 : ((entryNum - priceNow) / entryNum) * 100;
    return result.toFixed(1);
  };

  const handleClick = (id) => router.push(`/trade/${id}`);

  return (
    <div>
      <div className="trade-header">
        <h2>Trade Records</h2>
        <p style={{ color: totalPnl >= 0 ? 'lightgreen' : 'red' }}><strong>Total Profit: </strong>{formatNumber(totalPnl)}</p>
        <TradeFormPopup onTradeAdded={fetchTrades} />
      </div>

      <div className="table-wrapper">
        {loading && <div className="t-loading-box"></div>}
        {!loading && error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
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
                  <td className={trade.type.toLowerCase()}>
                    <div className="flex-v2">
                      <img src={`logo/${trade.asset.toLowerCase()}-logo.png`} alt={trade.asset} />
                      <span>{trade.asset + 'USDT'}</span>
                    </div>
                  </td>
                  <td style={{ color: trade.type == "Long" ? 'lightgreen' : 'red' }}>{trade.type}</td>
                  <td>{formatNumber(trade.entry)}</td>
                  <td>{formatNumber(trade.exit) ?? "-"}</td>
                  <td>{formatNumber(trade.stopLoss)}</td>
                  <td>{formatNumber(trade.takeProfit)}</td>
                  <td>{formatNumber(trade.amount)}</td>
                  <td>
                      <span style={{ color: calculatePercent(trade) >= 0 ? 'lightgreen' : 'red' }} className="pClass">
                        {calculatePercent(trade) >= 0 ? <TbTriangleFilled /> : <TbTriangleInvertedFilled />}
                        {calculatePercent(trade)}%
                      </span>               
                  </td>
                  <td>
                    <span style={{ color: calculatePnL(trade) >= 0 ? 'lightgreen' : 'red' }} className="pClass">
                     {calculatePnL(trade) >= 0 ? <TbTriangleFilled /> : <TbTriangleInvertedFilled />}
                     {formatNumber(calculatePnL(trade))}
                   </span>
                  </td>
                  <td>
                    <span className={`status ${trade.status.toLowerCase()}`}>{trade.status}</span>
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
