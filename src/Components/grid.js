import React from "react";
import { Thumbnail } from "./thumbnail";

const thumbnailsInfo = [
  {
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_9.png"),
  },
  {
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_8.png"),
  },
  {
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_7.png"),
  },
  {
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_6.png"),
  },
  {
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_5.png"),
  },
  {
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_4.png"),
  },
  {
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_3.png"),
  },
  {
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_2.png"),
  },
  {
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_1.png"),
  },
];

const thumbnailsMapped = thumbnailsInfo.map((item, i) => {
  return (
    <Thumbnail
      key={item + i}
      imgSrc={item.imgSrc}
      imgUrl={item.imgUrl}
    ></Thumbnail>
  );
});

export const Grid = () => {
  return <div className="Grid-container">{thumbnailsMapped}</div>;
};
