import React from "react";
import "../Styles.scss";

export const Header = () => {
  return (
    <>
      <div className="header">
        <img
          className="header-img"
          src={require(`../Images/fyv_hero.png`)}
          alt={"header-img"}
        />
      </div>
    </>
  );
};
