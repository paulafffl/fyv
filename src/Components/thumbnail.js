import React, { useState } from "react";
import { Modal } from "./modal";

export const Thumbnail = ({ title, content, imgList }) => {
  const [modal, setModal] = useState(false);

  return (
    <div
      className="Thumbnail-container"
      onClick={() => {
        setModal(true);
      }}
    >
      <img
        className="grid-img"
        src={require(`../Thumbnails/instagram_post_${imgList[0]}.png`)}
        alt={title}
        data-testid={`grid-img-${imgList[0]}`}
      />
      {modal && (
        <Modal
          title={title}
          content={content}
          setModal={setModal}
          imgList={imgList}
        ></Modal>
      )}
    </div>
  );
};
