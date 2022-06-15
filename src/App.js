import "./Styles.scss";
import { Grid } from "./Components/grid";
import { Header } from "./Components/header";
import { Footer } from "./Components/footer";

function App() {
  return (
    <div>
      <Header />
      <Grid></Grid>
      <Footer />
    </div>
  );
}

export default App;
