import React from "react";
import "../Styles.scss";
import { contentAbout } from "../Thumbnails/content";

export const About = ({ id, title }) => {
  return (
    <div id={id}>
      <h1 className="section-title">{title}</h1>
      <div className="about">{contentAbout}</div>;
    </div>
  );
};
