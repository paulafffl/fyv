import "../Styles.scss";
import { Header } from "./header";
import { Section } from "./section";
import { contentManifesto } from "../Images/Thumbnails/content";

export const Home = () => {
    return (
        <>
            <Header id="header" />
            <Section id="manifesto" title={"manifesto"} content={contentManifesto} />
        </>
    );
}