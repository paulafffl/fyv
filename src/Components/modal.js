import React from "react";

export const Modal = ({ content, setModal, children }) => {
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
          {children}
          {content}
        </div>
      </div>
    </div>
  );
};
