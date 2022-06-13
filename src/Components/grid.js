import React from "react";
import { Thumbnail } from "./thumbnail";

const thumbnailsInfo = [
  {
    title: "F.Y.V. Manifesto",
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
    imgList: [12, 11, 10],
  },
  {
    title: "F.Y.V. Manifesto",
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgList: [11],
  },
  {
    title: "F.Y.V. Manifesto",
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgList: [10],
  },
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
  {
    title: "F.Y.V. Manifesto",
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgList: [6],
  },
  {
    title: "F.Y.V. Manifesto",
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgList: [5],
  },
  {
    title: "F.Y.V. Manifesto",
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgList: [4],
  },
  {
    title: "F.Y.V. Manifesto",
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgList: [3],
  },
  {
    title: "F.Y.V. Manifesto",
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgList: [2],
  },
  {
    title: "F.Y.V. Manifesto",
    content: (
      <p>
        📜 F.Y.V. Manifesto - Our 3 Pillars
        <br></br>
      </p>
    ),
    imgList: [1],
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

export const Grid = () => {
  return <div className="Grid-container">{thumbnailsMapped}</div>;
};
