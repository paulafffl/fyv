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
      {/* <a target="blank" href={imgUrl} id="myBtn"> */}
      <img src={imgSrc} alt={imgSrc} />
      {/* </a> */}
      {modal && <Modal content={content} setModal={setModal} />}
    </div>
  );
};
