import React from "react";

export const Modal = ({ content, setModal }) => {
  return (
    <div id="myModal" className="modal">
      <div className="modal-content">
        <span
          className="close"
          onClick={(e) => {
            e.stopPropagation();
            setModal(false);
          }}
        >
          &times;
        </span>
        <p>{content}</p>
      </div>
    </div>
  );
};
