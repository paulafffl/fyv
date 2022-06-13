import React, { useState } from "react";
import { Modal } from "./modal";

export const Thumbnail = ({ imgSrc, imgUrl, content }) => {
  const [modal, setModal] = useState(false);
  return (
    <div
      className="Thumbnail-container"
      onClick={() => {
        setModal(true);
      }}
    >
      <img className="Grid-image" src={imgSrc} alt={imgSrc} />
      {modal && (
        <Modal content={content} setModal={setModal}>
          <img src={imgSrc} alt={imgSrc} />
        </Modal>
      )}
    </div>
  );
};
