import React from "react";

export const Thumbnail = ({ title, imgList, onClick, advent = false }) => {
	return (
		<img
			onClick={onClick}
			className={`section__img ${advent ? 'section__img--advent' : ''}`}
			src={require(`../Images/Thumbnails/instagram_post_${imgList[0]}.png`)}
			alt={title}
			data-testid={`section__img-${imgList[0]}`}
		/>
	);
};
