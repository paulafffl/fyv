import React from "react";
import { Thumbnail } from "./thumbnail";

const thumbnailsInfo = [
  {
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
        <br></br>
        ✌🏽 1. Praise vulva diversity
        <br></br>
        <br></br>
        By ending shame and insecurity
        <br></br>
        <br></br>
        We want to provoke reflections on where our “normal and beautiful”
        standards came from. Our aesthetic preferences are intrinsically based
        on what we’ve been presented as visually pleasant by society. And in a
        patriarchal and phallic-centred society, the vulva suffers from
        underrepresentation and misrepresentation. Predominantly being reduced
        to “vagina”, even the word vulva still needs to conquer its righteous
        space. We’re surrounded by male genitalia, but we barely see any vulvas,
        and when we do, it’s sadly an inaccurate version of it. We are not
        presented with enough models of the wide diversity of vulval
        possibilities. So unconsciously, we end up perceiving ourselves through
        distorted lenses that don’t serve or empower us. But we have the power
        to break through this distortion and see our beautifully unique true
        selves.
        <br></br>
        <br></br>
        #vulva #vulvadiversity #vulvacasting #vulvaart #femalehealth
        #sexpositive #sexed #sexeducation #sexhealth #bodypositive
        #bodyneutrality #femaleanatomy #sexuality #selflove #femalebody
        #selfknowledge #freeyourvulva #pleasure #womenspleasure #empowerment
      </p>
    ),
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_12.png"),
  },
  {
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_11.png"),
  },
  {
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_10.png"),
  },
  {
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_9.png"),
  },
  {
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_8.png"),
  },
  {
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_7.png"),
  },
  {
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_6.png"),
  },
  {
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_5.png"),
  },
  {
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_4.png"),
  },
  {
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_3.png"),
  },
  {
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgUrl: "https://www.instagram.com/p/CelB-ywtHJP/",
    imgSrc: require("../Thumbnails/instagram_post_2.png"),
  },
  {
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
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
