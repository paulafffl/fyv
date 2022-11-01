import "../Styles.scss";
import { Section } from "./section";
import { contentPosts } from "../Images/Thumbnails/content";

export const Posts = () => {
	return (
		<Section id="posts" title={"posts"} content={contentPosts} />
	);
}