import "./Styles.scss";
import { Navbar } from "./Components/navbar";
import { Header } from "./Components/header";
import { Section } from "./Components/section";
import { Footer } from "./Components/footer";
import { contentPosts } from "./Thumbnails/content_posts";
import { contentManifesto } from "./Thumbnails/content_manifesto";

function App() {
  return (
    <div>
      <Navbar />
      <Header />
      <br></br>
      <Section content={contentManifesto} title={"manifesto"}></Section>
      <Section content={contentPosts} title={"posts"}></Section>
      <Footer />
    </div>
  );
}

export default App;
