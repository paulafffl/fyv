import React from "react";
import "../Styles.scss";
import logoOuter from "../Images/fyv_logo_outer.png";
import logoInsta from "../Images/instagram_logo.svg";

export const Footer = () => {
	return (
		<div className="footer">
			<a
				href="https://www.instagram.com/freeyourvulva/"
				target={"blank"}
			>
				<img src={logoInsta} className="footer__insta" alt="logoInstagram" />
			</a>
			<div className="footer__contact">
				<h3>share my wisdom with F.Y.V.</h3>
				<a
					href="mailto:freeyourvulva@gmail.com?subject=Mail from Our Site"
					target={"blank"}
				>
					<img src={logoOuter} className="footer__logo" alt="logoOuter" />
				</a>
			</div>
		</div>
	);
};
