import React from "react";
import "../Styles.scss";

export const Header = ({ id }) => {
	return (
		<div id={id} className="header">
			<img
				src={require(`../Images/fyv_hero_front.png`)}
				alt={"bckg-img"}
			/>
		</div>
	);
};
