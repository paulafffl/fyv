import React from 'react';
import '../Styles.scss';
import logoOuter from '../Images/fyv_logo_outer.png';
import logoInsta from '../Images/instagram_logo.svg';
import iconSupport from '../Images/icon_support.svg';

export const Footer = () => {
    return (
        <div className="footer">
            <div>
                <a
                    href="https://www.instagram.com/freeyourvulva/"
                    target={'blank'}
                >
                    <img
                        src={logoInsta}
                        className="footer__icons"
                        alt="logoInstagram"
                    />
                    Follow
                </a>
                <a
                    href="https://www.buymeacoffee.com/freeyourvulva"
                    target={'blank'}
                >
                    <img
                        src={iconSupport}
                        className="footer__icons"
                        alt="iconSupport"
                    />
                    Support
                </a>
            </div>
            <div>
                <h3>share my wisdom with F.Y.V.</h3>
                <a
                    href="mailto:freeyourvulva@gmail.com?subject=Mail from Our Site"
                    target={'blank'}
                >
                    <img
                        src={logoOuter}
                        className="footer__logo"
                        alt="logoOuter"
                    />
                </a>
            </div>
        </div>
    );
};
