import React, { useEffect, useState } from 'react';
import { getBrands } from '../../services/brandService';
import './BrandRail.css';

const BrandRail = ({ onLoad }) => {
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const res = await getBrands();
            if (mounted && res.success) {
                setBrands(res.data || []);
                if (onLoad) onLoad();
            }
        })();
        return () => { mounted = false; };
    }, [onLoad]);

    if (!brands.length) return null;

    // Duplicate for seamless scroll if needed, 
    // but for a Rail, a simple horizontal scroll is often better UI than infinite marquee.
    // However, user liked "creative" and "better way". A slow marquee that pauses on hover is nice.
    // Let's do a reliable CSS marquee that doesn't use JS for position.

    // Ensure enough items for a smooth loop
    let loop = [...brands];
    while (loop.length < 20) {
        loop = loop.concat(brands);
    }

    return (
        <div className="brand-rail-container">
            <div className="brand-rail-track">
                {loop?.filter(brand => brand.position !== 10)?.map((brand, i) => (
                    <div key={`${brand.slug}-${i}`} className="brand-rail-item">
                        <img src={brand.logo} alt={brand.name} loading="lazy" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BrandRail;
