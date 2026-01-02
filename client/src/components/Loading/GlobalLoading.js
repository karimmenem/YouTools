import React from 'react';
import { useLoading } from '../../context/LoadingContext';
import './GlobalLoading.css';
const GlobalLoading = () => {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="global-loading-overlay">
            <img src="/LoadingScreen.png" alt="Loading" className="global-loading-logo" />
        </div>
    );
};

export default GlobalLoading;
