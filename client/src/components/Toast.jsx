import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const variants = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-yellow-500 text-white',
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  return (
    <div className="animate-slide-up">
      <div className={`${variants[type]} px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
        <span className="text-xl">{icons[type]}</span>
        <p className="font-medium">{message}</p>
        <button 
          onClick={onClose}
          className="ml-auto hover:opacity-80 transition-opacity"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
