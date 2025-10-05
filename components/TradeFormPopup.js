"use client"
import React, { useState, useEffect } from "react";
import "../styles/TradeForm.css";
import "../styles/TradeModal.css";

const TradeFormPopup = ( { onTradeAdded } ) => {

  const [isOpen, setIsOpen] = useState(false);
  
  const initialForm = {
    asset: "BTC",
    type: "Long",
    entry: "",
    stopLoss: "",
    takeProfit: "",
    amount: "",
    imageUrl: "",
  };
  
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('/api/send-trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form), 
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    const result = await response.json();
    console.log('Trade response:', result);
    console.log(form);

    setIsOpen(false);
    setForm(initialForm);
     if (onTradeAdded) onTradeAdded();
  } catch (error) {
    console.error('Submit error:', error);
    alert('Trade gönderilirken hata oluştu!');
  }
};

  // ESC ile kapatma
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
      >
        Add Trade
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsOpen(false)}>
              &times;
            </button>

            <div className="trade-form-container">
              <h2>Add New Trade</h2>
              <form onSubmit={handleSubmit} className="trade-form">
                <label>
                  Asset:
                <select name="asset" value={form.asset} onChange={handleChange} required >
                    <option value="BTC">BTC</option>
                    <option value="GOLD">Gold</option>
                    <option value="ETH">ETH</option>
                </select>
                </label>

                <label>
                  Type:
                  <select name="type" value={form.type} onChange={handleChange} required >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </label>

                <label>
                  Entry Price:
                  <input type="number" name="entry" value={form.entry} onChange={handleChange} required />
                </label>

                <label>
                  Stop Loss:
                  <input type="number" name="stopLoss" value={form.stopLoss} onChange={handleChange} />
                </label>

                <label>
                  Take Profit:
                  <input type="number" name="takeProfit" value={form.takeProfit} onChange={handleChange} />
                </label>

                <label>
                  Amount ($):
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} required />
                </label>

                <label className="grid-c-2">
                  Image URL:
                  <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange} />
                </label>

                <button type="submit" className="grid-c-2">Add Trade</button>
              </form>

              {form.imageUrl && (
                <div className="image-preview">
                  <p>Preview:</p>
                  <img src={form.imageUrl} alt="Trade visual" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TradeFormPopup;
