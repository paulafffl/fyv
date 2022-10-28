import React, { useState } from "react";

export const Modal = ({ content, selectedImg, setSelectedImg }) => {
	const [shownImg, setShownImg] = useState(content.imgList[0]);
	const carousel = content.imgList.map((imgNo) => {
		return (
			<button
				className={`modal__carousel ${shownImg === imgNo ? "modal__carousel--selected" : ""}`}
				key={"carousel" + imgNo}
				data-testid={`carousel-img-${imgNo}`}
				onClick={() => setShownImg(imgNo)}
			/>
		);
	});
	return (
		<>
			<div className="modal__bckg" onClick={() => setSelectedImg("")}></div>
			<svg className="modal__button modal__button--previous"
				onClick={() => { setSelectedImg(selectedImg - 1) }}
				xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M28.05 36 16 23.95 28.05 11.9l2.15 2.15-9.9 9.9 9.9 9.9Z" />
			</svg>
			<div className="modal__box">
				<div className="modal__close">
					<span
						onClick={(e) => {
							e.stopPropagation();
							setSelectedImg("");
						}}
					>
						&times;
					</span>
				</div>
				<div className="modal__content">
					<div className="modal__img">
						<img
							src={require(`../Images/Thumbnails/instagram_post_${shownImg}.png`)}
							data-testid={`modal__img-${shownImg}`}
							alt={content.title}
						/>

						{content.imgList.length > 1 && <div display="flex">{carousel}</div>}
					</div>
					<div className="modal__text">
						{content.content}
					</div>
				</div>
			</div>
			<svg className="modal__button modal__button--next"
				onClick={() => { setSelectedImg(selectedImg + 1) }}
				xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="m18.75 36-2.15-2.15 9.9-9.9-9.9-9.9 2.15-2.15L30.8 23.95Z" />
			</svg>
		</>
	);
};
