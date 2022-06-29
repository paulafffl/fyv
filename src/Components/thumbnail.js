import React, { useState } from "react";
import { Modal } from "./modal";

export const Thumbnail = ({ title, content, imgList }) => {
  const [modal, setModal] = useState(false);

  return (
    <>
      <img
        onClick={() => {
          setModal(true);
        }}
        className="section__img"
        src={require(`../Images/Thumbnails/instagram_post_${imgList[0]}.png`)}
        alt={title}
        data-testid={`section__img-${imgList[0]}`}
      />
      {modal && (
        <Modal
          title={title}
          content={content}
          setModal={setModal}
          imgList={imgList}
        ></Modal>
      )}
    </>
  );
};
