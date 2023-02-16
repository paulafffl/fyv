import "../Styles.scss";
import { Section } from "./section";
import { contentManifesto } from "../Content/content_manifesto";

export const Manifesto = () => {
    return <Section title={"manifesto"} content={contentManifesto} />;
};
