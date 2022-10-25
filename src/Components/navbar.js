import React, { useState } from "react";
import logoInner from "../Images/fyv_logo_inner.png";
import "../Styles.scss";

export const Navbar = () => {
	const [active, setActive] = useState("");
	return (
		<div className="navbar">
			<div>
				<a
					onClick={() => setActive("header")}
					className={'navbar__link'}
					href="#header"
				>
					<img src={logoInner} className="navbar__logo" alt="logoOuter" />
					FREE YOUR VULVA
				</a>
			</div>
			<div>
				<a
					className={`navbar__link ${active === "manifesto" ? "navbar__link--active" : ""
						}`}
					onClick={() => {
						setActive("manifesto");
					}}
					href="#manifesto"
				>
					MANIFESTO
				</a>
				<a
					className={`navbar__link ${active === "posts" ? "navbar__link--active" : ""
						}`}
					onClick={() => {
						setActive("posts");
					}}
					href="#posts"
				>
					POSTS
				</a>
				<a
					className={`navbar__link ${active === "about" ? "navbar__link--active" : ""
						}`}
					onClick={() => {
						setActive("about");
					}}
					href="#about"
				>
					ABOUT
				</a>
				<a
					className={`navbar__link ${active === "support" ? "navbar__link--active" : ""
						}`}
					onClick={() => {
						setActive("support");
					}}
					href="#support"
				>
					SUPPORT
				</a>
			</div>
		</div>
	);
};
