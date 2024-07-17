import React from 'react';
import '../Styles.scss';

export const Header = () => {
    return (
        <header className="header">
            <img src={require(`../Images/fyv_hero_front.png`)} alt="" />
        </header>
    );
};
