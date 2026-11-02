import { useState, useEffect } from 'react';
import { Modal } from './modal';
import { Thumbnail } from './thumbnail';

export const Section = ({
    content,
    title,
    advent = false,
    posts = false,
    initialDisplay = content.length,
}) => {
    const [selectedImg, setSelectedImg] = useState('');
    const [displayLimit, setDisplayLimit] = useState(initialDisplay);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let loadTimeout;
        const handleScroll = () => {
            if (
                !loadTimeout &&
                window.innerHeight + window.scrollY >=
                    document.documentElement.offsetHeight - 400 &&
                displayLimit < content.length
            ) {
                setIsLoading(true);
                loadTimeout = setTimeout(() => {
                    setDisplayLimit((limit) =>
                        Math.min(limit + (initialDisplay || 3), content.length),
                    );
                    setIsLoading(false);
                }, 500);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(loadTimeout);
        };
    }, [content.length, displayLimit, initialDisplay]);

    const thumbnailsMapped = content
        .slice(0, displayLimit)
        .map((item, i) => (
            <Thumbnail
                onClick={() => setSelectedImg(i)}
                key={`thumbnail-${item.imgList[0]}`}
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
                <div className="section__container section__container--header">
                    <div className="section__description">
                        <p>
                            <span>24 simple yet powerful&nbsp;ways</span>
                            <br></br>to expand your capacity<br></br>of
                            experiencing pleasure
                            <br></br>and self-love.
                        </p>
                    </div>
                    <div className="section__description">
                        <p>
                            <span>Awaken your 5&nbsp;senses</span>
                            <br></br>to unlock new levels&nbsp;of&nbsp;body
                            <br></br>
                            stimulation, awareness<br></br>and satisfaction
                        </p>
                    </div>
                    <div className="section__description">
                        <p>
                            <span>All you'll need is&nbsp;yourself!</span>
                            <br></br>
                            So follow these delicious<br></br>daily invitations
                            to&nbsp;treat
                            <br></br>your body and soul.
                        </p>
                    </div>
                </div>
            )}
            <div
                className={`section__container ${
                    advent ? 'section__container--advent' : ''
                }`}
            >
                {thumbnailsMapped}
            </div>
            {isLoading && (
                <div className="loader-container">
                    <div className="loader"></div>
                </div>
            )}
            {posts && (
                <div style={{ textAlign: 'center', paddingBottom: '5vw' }}>
                    <h3>
                        + more posts on{' '}
                        <a
                            href="https://www.instagram.com/freeyourvulva/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Open Instagram page in a new window"
                        >
                            Instagram
                        </a>
                    </h3>
                </div>
            )}
            {selectedImg !== '' && (
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
