import React from 'react';

function ModelLoader({ onLoadModel, isLoading, error }) {
  return (
    <div className="model-loader">
      <div className="loader-content">
        <h2>Load BitNet Model</h2>
        <p>Click the button below to load the BitNet model for inference.</p>
        {error && <div className="error-message">{error}</div>}
        <button
          onClick={onLoadModel}
          disabled={isLoading}
          className="load-button"
        >
          {isLoading ? 'Loading...' : 'Load Model'}
        </button>
        {isLoading && (
          <div className="loading-animation">
            <div className="spinner"></div>
            <p>Loading model...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModelLoader;