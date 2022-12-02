import React from "react";
import logoInsta from "../Images/instagram_logo.svg";
import iconSupport from "../Images/icon_support.svg";

export const ModalAdvent = ({ content, selectedImg, setSelectedImg, prevAndNext = true, shownImg }) => {
	return (
		<>
			<div className="modal__bckg" onClick={() => setSelectedImg("")}></div>
			{prevAndNext &&
				<svg className="modal__button modal__button--previous"
					onClick={() => { setSelectedImg(selectedImg - 1) }}
					xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M28.05 36 16 23.95 28.05 11.9l2.15 2.15-9.9 9.9 9.9 9.9Z" />
				</svg>
			}
			<div className="modal__boxAdvent">
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
					<div className="modal__imgAdvent">
						<img
							src={require(`../Images/Thumbnails/Advent/Released/${shownImg}.png`)}
							data-testid={`modal__img-${shownImg}`}
							alt={content.title}
						/>
					</div>
					<div className="modal__textAdvent">
						{content.content}
					</div>
				</div>
				<div className="modal__follow">
					<a
						href="https://www.instagram.com/freeyourvulva/"
						target={"blank"}
					>
						<img src={logoInsta} alt="logoInstagram" />
						Follow us 
					</a>
					<a
						href="https://www.buymeacoffee.com/freeyourvulva"
						target={"blank"}
					>
						<img src={iconSupport} alt="iconSupport" />
						Support us 
					</a>
				</div>
			</div>
			{prevAndNext &&
				<svg className="modal__button modal__button--next"
					onClick={() => { setSelectedImg(selectedImg + 1) }}
					xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="m18.75 36-2.15-2.15 9.9-9.9-9.9-9.9 2.15-2.15L30.8 23.95Z" />
				</svg>
			}
		</>
	);
};
