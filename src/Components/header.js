import React, { useEffect, useState } from 'react';
import '../Styles.scss';
import hero_image from '../Images/fyv_hero_front.avif';

export const Header = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setIsLoaded(true);
        };
        img.src = hero_image;
    }, []);

    return (
        <header className="header">
            {!isLoaded ? (
                <div className="header__shimmer loader-container">
                    <div className="loader"></div>
                </div>
            ) : (
                <img src={hero_image} alt="" />
            )}
        </header>
    );
};
