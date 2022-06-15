import React from "react";
import "../Styles.scss";
import { Thumbnail } from "./thumbnail";

export const Header = () => {
  const thumbnailsInfo = [
    {
      title: "F.Y.V. Manifesto",
      content: (
        <p>
          📜 F.Y.V. Manifesto - Our 3 Pillars
          <br></br>
        </p>
      ),
      imgList: [9],
    },
    {
      title: "F.Y.V. Manifesto",
      content: (
        <p>
          📜 F.Y.V. Manifesto - Our 3 Pillars
          <br></br>
        </p>
      ),
      imgList: [8],
    },
    {
      title: "F.Y.V. Manifesto",
      content: (
        <p>
          📜 F.Y.V. Manifesto - Our 3 Pillars
          <br></br>
        </p>
      ),
      imgList: [7],
    },
  ];

  const thumbnailsMapped = thumbnailsInfo.map((item, i) => {
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
      <navbar className="navbar">
        <div>
          <span>ABOUT</span>
          <span>POSTS</span>
          <span>SUPPORT</span>
        </div>
      </navbar>
      {thumbnailsMapped}
    </>
  );
};
