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
        className="Grid-image"
        src={require(`../Thumbnails/instagram_post_${imgList[0]}.png`)}
        alt={title}
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
