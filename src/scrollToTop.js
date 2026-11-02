import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function scrollToTop() {
    // Override the site's smooth scrolling for navigation resets.
    try {
        window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
    } catch {
        // Older browsers may only accept the numeric scrollTo signature.
        window.scrollTo(0, 0);
    }
}

export default function ScrollToTop() {
    const { key } = useLocation();

    useLayoutEffect(() => {
        const supportsRestoration = 'scrollRestoration' in window.history;
        const previousRestoration = window.history.scrollRestoration;
        if (supportsRestoration) window.history.scrollRestoration = 'manual';
        // A page restored from the browser's back/forward cache is not remounted.
        const onPageShow = (event) => {
            if (event.persisted) scrollToTop();
        };
        window.addEventListener('pageshow', onPageShow);
        return () => {
            window.removeEventListener('pageshow', onPageShow);
            if (supportsRestoration)
                window.history.scrollRestoration = previousRestoration;
        };
    }, []);

    // History entries have distinct keys even when their pathname is the same.
    useLayoutEffect(scrollToTop, [key]);

    return null;
}
