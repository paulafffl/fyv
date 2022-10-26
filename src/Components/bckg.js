import React from "react";
import "../Styles.scss";

export const Bckg = () => {
	return (
		<>
			<div className="bckg">
				<img
					className="bckg-img"
					src={require(`../Images/fyv_hero.jpg`)}
					alt={"bckg-img"}
				/>
			</div>
		</>
	);
};
