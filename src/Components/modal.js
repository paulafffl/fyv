import React, { useState } from "react";

export const Modal = ({ title, content, setModal, imgList }) => {
  const [shownImg, setShownImg] = useState(imgList[0]);
  const carousel = imgList.map((imgNo) => {
    return (
      <button
        key={"carousel" + imgNo}
        onClick={() => {
          setShownImg(imgNo);
        }}
      ></button>
    );
  });
  return (
    <div className="modal-bckg">
      <div className="modal-box">
        <div className="modal-close">
          <span
            onClick={(e) => {
              e.stopPropagation();
              setModal(false);
            }}
          >
            &times;
          </span>
        </div>
        <div className="modal-content">
          <div className="modal-img">
            <img
              src={require(`../Thumbnails/instagram_post_${shownImg}.png`)}
              alt={title}
            />
            {imgList.length > 1 && (
              <div className="modal-carousel">{carousel}</div>
            )}
          </div>
          {content}
        </div>
      </div>
    </div>
  );
};
