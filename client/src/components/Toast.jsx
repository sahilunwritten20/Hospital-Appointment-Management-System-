import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Icon from './Icon.jsx';

export default function Toast() {
  const { toast } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className={`toast${visible ? ' show' : ''}`} id="toast">
      {toast && (
        <>
          <Icon name={toast.icon} size={16} />
          <span>{toast.msg}</span>
        </>
      )}
    </div>
  );
}
