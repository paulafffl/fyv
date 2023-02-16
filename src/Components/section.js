import React, { useState } from "react";
import { Modal } from "./modal";
import { Thumbnail } from "./thumbnail";

export const Section = ({ content, title, advent = false }) => {
    const [selectedImg, setSelectedImg] = useState("");

    const thumbnailsMapped = content.map((item, i) => (
        <Thumbnail
            onClick={() => setSelectedImg(i)}
            key={`thumbnail-${item.title}`}
            title={item.title}
            imgList={item.imgList}
            selectedImg={i + 1}
            advent={advent}
        />
    ));

    return (
        <>
            <h1 className="section__title">{title}</h1>
            {advent && (
                <div className="section__container">
                    <div className="section__description">
                        <p>
                            <span>24 simple yet powerful ways</span>
                            <br></br>to expand your capacity<br></br>of
                            experiencing pleasure<br></br>and self-love.
                        </p>
                    </div>
                    <div className="section__description">
                        <p>
                            <span>Awaken your 5 senses</span>
                            <br></br>to unlock new levels of body<br></br>
                            stimulation, awareness<br></br>and satisfaction
                        </p>
                    </div>
                    <div className="section__description">
                        <p>
                            <span>All you'll need is yourself!</span>
                            <br></br>
                            So follow these delicious<br></br>daily invitations
                            to treat<br></br>your body and soul.
                        </p>
                    </div>
                </div>
            )}
            <div
                className={`section__container ${
                    advent ? "section__container--advent" : ""
                }`}
            >
                {thumbnailsMapped}
            </div>
            {selectedImg !== "" && (
                <Modal
                    content={content[selectedImg]}
                    setSelectedImg={setSelectedImg}
                    selectedImg={selectedImg}
                    range={content.length - 1}
                    advent={advent}
                />
            )}
        </>
    );
};
