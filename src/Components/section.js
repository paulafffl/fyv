import React from "react";
import { Thumbnail } from "./thumbnail";

export const Section = ({ content, title }) => {
  const thumbnailsMapped = content.map((item, i) => {
    return (
      <Thumbnail
        key={item + i}
        title={item.title}
        content={item.content}
        imgList={item.imgList}
      ></Thumbnail>
    );
  });

  return (
    <>
      <h1 className="section-title">{title}</h1>
      <div className="section-container">{thumbnailsMapped}</div>
    </>
  );
};
