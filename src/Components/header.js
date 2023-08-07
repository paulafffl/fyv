import React from "react";
import "../Styles.scss";

export const Header = () => {
    return (
        <div className="header">
            <img
                src={require(`../Images/fyv_hero_front.png`)}
                alt={"bckg-img"}
            />
            <img
                style={{ display: "none" }}
                src={require(`../Images/website_thumbnail.png`)}
                alt={"bckg-img"}
            />
        </div>
    );
};
