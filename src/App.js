import "./Styles.scss";
import { About } from "./Components/about";
import { Navbar } from "./Components/navbar";
import { Header } from "./Components/header";
import { Section } from "./Components/section";
import { Footer } from "./Components/footer";
import { contentPosts } from "./Images/Thumbnails/content";
import { contentManifesto } from "./Images/Thumbnails/content";

function App() {
	return (
		<div>
			<Navbar />
			<Header id="header" />
			<Section id="manifesto" title={"manifesto"} content={contentManifesto} />
			<Section id="posts" title={"posts"} content={contentPosts} />
			<About id="about" />
			<Footer id="support" />
		</div >
	);
}

export default App;
