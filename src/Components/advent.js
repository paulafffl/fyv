import "../Styles.scss";
import React, { useState } from "react";
import { contentAdvent } from "../Content/content_advent";
import { Modal } from "./modal";
import { Thumbnail } from "./thumbnail";
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
				<Thumbnail
					onClick={() =>
						isPostReleased ? setSelectedImg(i) : alert(`🎄 Coming soon 🎄`)}
					key={`thumbnail-${item.title}`}
					title={item.title}
					imgList={shownImgs}
					advent={false}
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