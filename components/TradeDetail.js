"use client"
import React, { useEffect, useState } from "react";
import "../styles/TradeTable.css";
import TradingViewWidget from "./TradingViewWidget";
import Link from "next/link";
import { formatNumber } from "@/utils/format";
import { useRouter } from "next/navigation";

const TradeDetail = ({ id }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [price, setPrice] = useState(null);
  const [symbol, setSymbol] = useState(null);
  const [image, setImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
   const router = useRouter();

  const handleCloseClick = () => {
    setShowConfirm(true); 
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    deleteTrade();
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const deleteTrade = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delete`, {
        method: 'POST',
        credentials: 'include',
        headers: {
        'Content-Type': 'application/json', 
      },
        body: JSON.stringify({ id })
      });
      const data = await res.json();

      console.log(data.success);

      if (data.success) {
        router.push('/');
      }
    } catch (err) {
      setError('Ağ hatası');
      return null;
    }
  };

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

  const init = async () => {
    setLoading(true);
    try {
      const trade = await fetchTrades();

      if (trade) {
        const assetSymbol = trade.asset === "GOLD" ? "PAXG" : trade.asset;
        await fetchCryptoPrice(assetSymbol);
      }
    } catch (err) {
      setError("Yükleme hatası");
    } finally {
      setLoading(false);
    }
  };

  init();

  // Her 1 dakikada bir fiyatı güncelle
  const interval = setInterval(() => {
    if (symbol) {
      fetchCryptoPrice(symbol);
    }
  }, 60 * 1000);

  return () => {
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

            {/* Popup */}
      {showConfirm && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Emin misin?</h3>
            <p>Bu pozisyon kapatılacak.</p>
            <div className="popup-actions">
              <button onClick={handleConfirm} className="confirm-btn">Evet</button>
              <button onClick={handleCancel} className="cancel-btn">İptal</button>
            </div>
          </div>
        </div>
      )}

      <div className="h-box">
            <Link href={"/"}> Back </Link>
            <h1>Trade Detail</h1>       
      </div>

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
          loading && <div className="t-loading-box"></div>
      )}

      <div className="img-cont">
        {symbol && (
          <div className='widget-c'>
            <TradingViewWidget symbol={symbol} />
          </div>
        )}
      </div>

      { !loading && <div onClick={handleCloseClick} className="close-p">Close The Position</div> }
    </div>
  );
};

export default TradeDetail;
