import { thumbnailUrl } from '../galleryImages';

export const Thumbnail = ({
    title,
    imgList,
    onClick,
    selectedImg = null,
    advent = false,
}) => {
    const imgPath = thumbnailUrl(advent ? selectedImg : imgList[0], advent);
    return (
        <button
            className="button-reset-styles"
            onClick={onClick}
            data-cy={`section__img-${imgList[0]}`}
        >
            <img
                className={`section__img ${
                    advent ? 'section__img--advent' : ''
                }`}
                width={500}
                height={500}
                src={imgPath}
                alt={title}
            />
        </button>
    );
};
