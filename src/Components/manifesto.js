import "../Styles.scss";
import { Section } from "./section";
import { contentManifesto } from "../Images/Thumbnails/content";

export const Manifesto = () => {
	return (
		<Section id="manifesto" title={"manifesto"} content={contentManifesto} />
	);
}