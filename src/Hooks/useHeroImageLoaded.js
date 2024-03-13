import { useState, useEffect } from 'react';

const useHeroImageLoaded = () => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setLoaded(true);
        };
        img.src = require('../Images/fyv_hero_front.png');
    }, []);

    return () => loaded;
};

export default useHeroImageLoaded;
