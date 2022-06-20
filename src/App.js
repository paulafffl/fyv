import "./Styles.scss";
import { About } from "./Components/about";
import { Navbar } from "./Components/navbar";
import { Header } from "./Components/header";
import { Section } from "./Components/section";
import { Footer } from "./Components/footer";
import { contentPosts } from "./Thumbnails/content";
import { contentManifesto } from "./Thumbnails/content";

function App() {
  return (
    <div>
      <Navbar />
      <Header />
      <Section id="manifesto" title={"manifesto"} content={contentManifesto}></Section>
      <Section id="posts" title={"posts"} content={contentPosts}></Section>
      <About id="about us" title={"about us"} />
      <Footer id="support" />
    </div>
  );
}

export default App;
