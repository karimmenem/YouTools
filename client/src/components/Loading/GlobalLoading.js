import React from 'react';
import { useLoading } from '../../context/LoadingContext';
import './GlobalLoading.css';

const GlobalLoading = () => {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="global-loading-overlay">
            <video
                src="/spinning_logo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="global-loading-video"
            />
        </div>
    );
};

export default GlobalLoading;
