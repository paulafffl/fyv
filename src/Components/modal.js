import React, { useEffect, useState } from "react";
import logoInsta from "../Images/instagram_logo.svg";
import iconSupport from "../Images/icon_support.svg";

export const Modal = ({ content, selectedImg, setSelectedImg, range, advent = false }) => {
	const [shownImg, setShownImg] = useState(content?.imgList[0]);
	const imgPath = advent
		? require(`../Images/Thumbnails/Advent/Released/${shownImg}.png`)
		: require(`../Images/Thumbnails/instagram_post_${shownImg}.png`)
	;

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

	useEffect(() => {
		setShownImg(content.imgList[0])
	}, [content, selectedImg])

	return (
		<div className="modal">
			<div className="modal__bckg" onClick={() => setSelectedImg("")}></div>
			{selectedImg > 0 && 
				<svg className="modal__button modal__button--previous"
					onClick={() => { setSelectedImg(selectedImg - 1) }}
					xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M28.05 36 16 23.95 28.05 11.9l2.15 2.15-9.9 9.9 9.9 9.9Z" />
				</svg>
			}
			<div className={`modal__box ${advent ? 'modal__box--advent' : ''}`}>
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
				<div className={`modal__img ${advent ? 'modal__img--advent' : ''}`}>
						<img
							src={imgPath}
							data-testid={`modal__img-${shownImg}`}
							alt={content.title}
						/>

						{content.imgList.length > 1 && <div display="flex">{carousel}</div>}
					</div>
                    <div className={`modal__text ${advent ? 'modal__text--advent' : ''}`}>
						{content.content}
					</div>
				</div>
				<div className="modal__follow">
					<a
						href="https://www.instagram.com/freeyourvulva/"
						target={"blank"}
					>
						<img src={logoInsta} alt="logoInstagram" />
						Follow 
					</a>
					<a
						href="https://www.buymeacoffee.com/freeyourvulva"
						target={"blank"}
					>
						<img src={iconSupport} alt="iconSupport" />
						Support 
					</a>
				</div>
			</div>
			{selectedImg < range && 
				<svg className="modal__button modal__button--next"
					onClick={() => { setSelectedImg(selectedImg + 1) }}
					xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="m18.75 36-2.15-2.15 9.9-9.9-9.9-9.9 2.15-2.15L30.8 23.95Z" />
				</svg>
			}
		</div>
	);
};
