import React from "react";
import "../Styles.scss";

export const Header = () => {
  return (
    <>
      <div className="header">
        <img
          className="header-img"
          src={require(`../Thumbnails/instagram_post_${9}.png`)}
          alt={"header-img"}
        />
        <img
          className="header-img"
          src={require(`../Thumbnails/instagram_post_${8}.png`)}
          alt={"header-img"}
        />
        <img
          className="header-img"
          src={require(`../Thumbnails/instagram_post_${7}.png`)}
          alt={"header-img"}
        />
      </div>
    </>
  );
};
