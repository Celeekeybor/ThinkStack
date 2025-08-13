import React, { useEffect } from 'react';

const Alert = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      {message}
      <button 
        type="button" 
        className="btn-close" 
        onClick={onClose}
        aria-label="Close"
      ></button>
    </div>
  );
};

export default Alert;