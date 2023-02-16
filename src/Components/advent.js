import "../Styles.scss";
import { Section } from "./section";
import { contentAdvent } from "../Content/content_advent";

export const Advent = () => {
    return <Section title={"advent calendar"} content={contentAdvent} advent />;
};
