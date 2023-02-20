import React from "react";

export const Thumbnail = ({
    title,
    imgList,
    onClick,
    selectedImg = null,
    advent = false,
}) => {
    const imgPath = advent
        ? require(`../Images/Thumbnails/Advent/Animated/${selectedImg}.gif`)
        : require(`../Images/Thumbnails/instagram_post_${imgList[0]}.png`);
    return (
        <img
            onClick={onClick}
            className={`section__img ${advent ? "section__img--advent" : ""}`}
            src={imgPath}
            alt={title}
            data-testid={`section__img-${imgList[0]}`}
        />
    );
};
