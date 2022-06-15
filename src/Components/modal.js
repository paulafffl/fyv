import React, { useState } from "react";

export const Modal = ({ title, content, setModal, imgList }) => {
  const [shownImg, setShownImg] = useState(imgList[0]);
  const carousel = imgList.map((imgNo) => {
    return (
      <button
        className={`modal__carousel ${
          shownImg === imgNo ? "modal__carousel--selected" : ""
        }`}
        key={"carousel" + imgNo}
        data-testid={`carousel-img-${imgNo}`}
        onClick={() => {
          setShownImg(imgNo);
        }}
      ></button>
    );
  });
  return (
    <div className="modal__bckg">
      <div className="modal__box">
        <div className="modal__close">
          <span
            onClick={(e) => {
              e.stopPropagation();
              setModal(false);
            }}
          >
            &times;
          </span>
        </div>
        <div className="modal__content">
          <div className="modal__img">
            <img
              src={require(`../Thumbnails/instagram_post_${shownImg}.png`)}
              data-testid={`modal__img-${shownImg}`}
              alt={title}
            />
            {imgList.length > 1 && <div display="flex">{carousel}</div>}
          </div>
          {content}
        </div>
      </div>
    </div>
  );
};
