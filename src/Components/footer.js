import React from "react";
import "../Styles.scss";
import logoOuter from "../fyv_logo_outer.png";

export const Footer = ({ id }) => {
  return (
    <div id={id} className="footer">
      <h3>share my wisdom with F.Y.V.</h3>
      <a
        href="mailto:freeyourvulva@gmail.com?subject=Mail from Our Site"
        target={"blank"}
      >
        <img src={logoOuter} className="footer-logo" alt="logoOuter" />
      </a>
    </div>
  );
};
