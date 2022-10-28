import React, { useState } from "react";
import { Modal } from "./modal";
import { Thumbnail } from "./thumbnail";

export const Section = ({ content, title, id }) => {
	const [selectedImg, setSelectedImg] = useState("");

	const thumbnailsMapped = content.map((item, i) => {
		return (
			<>
				<Thumbnail
					onClick={() => setSelectedImg(i)}
					key={`thumbnail-${item.title}`}
					title={item.title}
					imgList={item.imgList}
				/>
				{selectedImg === i && (
					<Modal
						content={content[selectedImg]}
						setSelectedImg={setSelectedImg}
						selectedImg={selectedImg}
					/>
				)}
			</>
		);
	});

	return (
		<div id={id}>
			<h1 className="section__title">{title}</h1>
			<div className="section__container">{thumbnailsMapped}</div>
		</div>
	);
};
