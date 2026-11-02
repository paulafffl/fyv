// Keep the asset set explicit: source artwork and unused formats stay out of builds.
const images = import.meta.glob(
    [
        './Images/Thumbnails/instagram_post_*.avif',
        './Images/Thumbnails/instagram_post_*.png',
        './Images/Thumbnails/Advent/Animated/*.gif',
        './Images/Thumbnails/Advent/Released/*.png',
    ],
    { eager: true, query: '?url', import: 'default' },
);

function imageUrl(path) {
    const url = images[path];
    if (!url) throw new Error(`Missing gallery image: ${path}`);
    return url;
}

export function thumbnailUrl(image, advent) {
    return imageUrl(
        advent
            ? `./Images/Thumbnails/Advent/Animated/${image}.gif`
            : `./Images/Thumbnails/instagram_post_${image}.avif`,
    );
}

export function modalImageUrl(image, advent) {
    return imageUrl(
        advent
            ? `./Images/Thumbnails/Advent/Released/${image}.png`
            : `./Images/Thumbnails/instagram_post_${image}.png`,
    );
}
