import React from "react";
import "../Styles.scss";

export const Header = ({ id }) => {
  return (
    <>
      <div className="header" id={id}>
        <img
          className="header-img"
          src={require(`../Images/fyv_hero.png`)}
          alt={"header-img"}
        />
      </div>
    </>
  );
};
