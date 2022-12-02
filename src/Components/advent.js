import "../Styles.scss";
import React, { useState } from "react";
import { contentAdvent } from "../Content/content_advent";
import moment from "moment";
import { ModalAdvent } from "./modal_advent";

export const Advent = () => {
	const [selectedImg, setSelectedImg] = useState("");
	const today = moment().format("YYYY-MM-DD");

	const thumbnailsMapped = contentAdvent.map((item, i) => {
		const isPostReleased = item.releaseDate <= today;
		return (
			<>
				<img
					onClick={() =>
						isPostReleased 
						? 
						setSelectedImg(i) 
						: 
						alert(`🎄 Coming on ${moment(item.releaseDate).format('MMMM Do YYYY')} 🎄`)
					}
					key={`thumbnail-${item.title}`}

					className={'section__img section__img--advent'}
					src={require(`../Images/Thumbnails/Advent/Teaser/${i+1}.png`)}
					alt={item.title}
					data-testid={`section__img-${i+1}`}
				/>
				{selectedImg === i && (
					<ModalAdvent
						content={contentAdvent[selectedImg]}
						setSelectedImg={setSelectedImg}
						selectedImg={selectedImg}
						prevAndNext={false}
						shownImg={i+1}
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