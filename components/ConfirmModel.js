import React from "react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>{title || "Emin misin?"}</h3>
        <p>{message || "Bu işlemi onaylıyor musunuz?"}</p>
        <div className="popup-actions">
          <button className="confirm-btn" onClick={onConfirm}>Evet</button>
          <button className="cancel-btn" onClick={onCancel}>İptal</button>
        </div>
      </div>
    </div>
  );
}
