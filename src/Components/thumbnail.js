import React from 'react';

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
        <button
            className="button-reset-styles"
            onClick={onClick}
            data-cy={`section__img-${imgList[0]}`}
        >
            <img
                className={`section__img ${
                    advent ? 'section__img--advent' : ''
                }`}
                width={500}
                height={500}
                src={imgPath}
                alt={title}
            />
        </button>
    );
};
