import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Modal() {
  const { modal, closeModal } = useApp();
  if (!modal) return null;

  return (
    <div
      className="modal-backdrop open"
      id="modal-backdrop"
      onClick={(e) => {
        if (e.target.id === 'modal-backdrop') closeModal();
      }}
    >
      <div className={`modal${modal.danger ? ' danger' : ''}`} id="modal-box">
        {modal.content}
      </div>
    </div>
  );
}
