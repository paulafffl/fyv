import "../Styles.scss";
import React, { useState } from "react";
import { contentAdvent } from "../Content/content_advent";
import { Modal } from "./modal";
import moment from "moment";

export const Advent = () => {
	const [selectedImg, setSelectedImg] = useState("");
	const today = moment().format("YYYY-MM-DD");

	const thumbnailsMapped = contentAdvent.map((item, i) => {
		const isPostReleased = item.releaseDate <= today;
		const [, ...lockedPosts] = item.imgList;
		const shownImgs = isPostReleased ? lockedPosts : item.imgList;
		return (
			<>
				<img
					onClick={() =>
						isPostReleased ? setSelectedImg(i) : alert(`🎄 Coming on ${item.releaseDate} 🎄`)}
					key={`thumbnail-${item.title}`}

					className={'section__img section__img--advent'}
					src={require(`../Images/Thumbnails/Advent/${shownImgs[0]}.jpg`)}
					alt={item.title}
					data-testid={`section__img-${shownImgs[0]}`}
				/>
				{selectedImg === i && (
					<Modal
						content={contentAdvent[selectedImg]}
						setSelectedImg={setSelectedImg}
						selectedImg={selectedImg}
						prevAndNext={false}
					/>
				)}
			</>
		);
	});

	return (
		<>
			<h1 className="section__title">{"advent"}</h1>
			<div className="section__container section__advent">{thumbnailsMapped}</div>
		</>
	);
}