import '../Styles.scss';
import { Header } from './header';
import { Manifesto } from './manifesto';
import useHeroImageLoaded from '../Hooks/useHeroImageLoaded';

export const Home = () => {
    const heroImageLoaded = useHeroImageLoaded();
    return (
        <>
            <Header />
            {heroImageLoaded() && <Manifesto />}
        </>
    );
};
