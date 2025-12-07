function MessageBanner({ type = 'info', message, onClose }) {
  if (!message) return null;

  return (
    <div className={`message-banner message-banner-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button className="message-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
}

export default MessageBanner;
