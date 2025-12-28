import React from 'react';

const LoadingCentered = ({ text = "YouTools..." }) => {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.9)', // Slight transparency
            zIndex: 9999,
            color: '#d32f2f',
            fontSize: '18px',
            fontWeight: '600'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid rgba(211, 47, 47, 0.2)',
                    borderTop: '4px solid #d32f2f',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
                <div>{text}</div>
            </div>
        </div>
    );
};

export default LoadingCentered;
