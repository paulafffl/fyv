import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import logoInner from "../Images/fyv_logo_inner.png";
import logoMain from "../Images/fyv_logo_Outline_Pink.png";
import "../Styles.scss";

export const Navbar = () => {
	const [active, setActive] = useState("");
	const [menuOpen, setMenuOpen] = useState(false);
	return (
		<>
			<div className={`navbar ${menuOpen ? "navbar--expanded" : ""}`}>
				{!menuOpen &&
					<Link to="/" onClick={() => setMenuOpen(false)}>
						<img src={logoInner} className="navbar__logo--small" alt="logoOuter" />
						FREE YOUR VULVA
					</Link>
				}
				<div
					onClick={() => setMenuOpen(!menuOpen)}
					className={`navbar__button ${menuOpen ? "navbar__button--expanded" : ""}`}
				>
					{menuOpen
						? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="m12.45 37.65-2.1-2.1L21.9 24 10.35 12.45l2.1-2.1L24 21.9l11.55-11.55 2.1 2.1L26.1 24l11.55 11.55-2.1 2.1L24 26.1Z" /></svg>
						: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M6 36v-3h36v3Zm0-10.5v-3h36v3ZM6 15v-3h36v3Z" /></svg>
					}
				</div>
				{menuOpen &&
					<Link to="/" onClick={() => setMenuOpen(false)}>
						<img src={logoMain} className="navbar__logo--large" alt="logo" />
					</Link>
				}
				<div className={`navbar__routes ${menuOpen ? "navbar__routes--expanded" : ""}`}>
					<Link to="/advent"
						onClick={() => { setMenuOpen(false); setActive("manifesto") }}
						className={`navbar__route ${active === "manifesto" ? "navbar__route--active" : ""}`}>
						🎄ADVENT
					</Link>
					<Link to="/posts"
						onClick={() => { setMenuOpen(false); setActive("posts") }}
						className={`navbar__route ${active === "posts" ? "navbar__route--active" : ""}`}>
						POSTS
					</Link>
					<Link to="/about"
						onClick={() => { setMenuOpen(false); setActive("about") }}
						className={`navbar__route ${active === "about" ? "navbar__route--active" : ""}`}>
						ABOUT
					</Link>
				</div>
			</div >
			<Outlet />
		</>
	);
};
