import React from 'react';
import '../Styles.scss';
import logoOuter from '../Images/fyv_logo_outer.avif';
import logoInsta from '../Images/instagram_logo.svg';
import iconSupport from '../Images/icon_support.svg';

export const Footer = () => {
    return (
        <footer className="footer">
            <div>
                <a
                    href="https://www.instagram.com/freeyourvulva/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Follow - Open Instagram page in a new window"
                >
                    <img src={logoInsta} className="footer__icons" alt="" />
                    Follow
                </a>
                <a
                    href="https://www.buymeacoffee.com/freeyourvulva"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Support - Open BuyMeACoffee page in a new window"
                >
                    <img src={iconSupport} className="footer__icons" alt="" />
                    Support
                </a>
            </div>
            <div className="footer__contact">
                <a
                    href="mailto:freeyourvulva@gmail.com?subject=Mail from Our Site"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Share my wisdom - Open mail to page in a new window"
                >
                    share my wisdom with F.Y.V.
                    <img src={logoOuter} className="footer__logo" alt="" />
                </a>
            </div>
        </footer>
    );
};
