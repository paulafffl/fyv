import React from "react";
import { Thumbnail } from "./thumbnail";

const thumbnailsInfo = [
  {
    content: `We must know the right terms to take full ownership of our body - and use them without constraint to end shame and insecurity around vulvas.`,
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_9.png"),
  },
  {
    content: `We must know the right terms to take full ownership of our body - and use them without constraint to end shame and insecurity around vulvas.`,
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_8.png"),
  },
  {
    content: `We must know the right terms to take full ownership of our body - and use them without constraint to end shame and insecurity around vulvas.`,
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_7.png"),
  },
  {
    content: `We must know the right terms to take full ownership of our body - and use them without constraint to end shame and insecurity around vulvas.`,
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_6.png"),
  },
  {
    content: `We must know the right terms to take full ownership of our body - and use them without constraint to end shame and insecurity around vulvas.`,
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_5.png"),
  },
  {
    content: `We must know the right terms to take full ownership of our body - and use them without constraint to end shame and insecurity around vulvas.`,
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_4.png"),
  },
  {
    content: `We must know the right terms to take full ownership of our body - and use them without constraint to end shame and insecurity around vulvas.`,
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_3.png"),
  },
  {
    content: `We must know the right terms to take full ownership of our body - and use them without constraint to end shame and insecurity around vulvas.`,
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_2.png"),
  },
  {
    content: `We must know the right terms to take full ownership of our body - and use them without constraint to end shame and insecurity around vulvas.`,
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
      content={item.content}
    ></Thumbnail>
  );
});

export const Grid = () => {
  return <div className="Grid-container">{thumbnailsMapped}</div>;
};
