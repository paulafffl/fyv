import '../Styles.scss';
import { Navbar } from './navbar';
import { Footer } from './footer';
import useHeroImageLoaded from '../Hooks/useHeroImageLoaded';

export const Layout = () => {
    const heroImageLoaded = useHeroImageLoaded();
    return (
        <>
            <Navbar />
            {heroImageLoaded() && <Footer />}
        </>
    );
};
