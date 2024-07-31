import React from 'react';
import '../Styles.scss';
import hero_image from '../Images/fyv_hero_front.avif';

export const Header = () => {
    return (
        <header className="header">
            <img src={hero_image} alt="" fetchpriority="high" />
        </header>
    );
};
