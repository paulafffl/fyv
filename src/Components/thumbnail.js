import React from "react";

export const Thumbnail = ({ imgSrc, imgUrl }) => {
  return (
    <div className="Thumbnail-container">
      <a target="blank" href={imgUrl}>
        <img src={imgSrc} alt={imgSrc} />
      </a>
    </div>
  );
};
