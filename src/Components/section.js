import React from "react";
import { Thumbnail } from "./thumbnail";

export const Section = ({ content, title, id }) => {
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
    <div id={id}>
      <h1 className="section__title">{title}</h1>
      <div className="section__container">{thumbnailsMapped}</div>
    </div>
  );
};
