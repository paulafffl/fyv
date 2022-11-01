import "../Styles.scss";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export const Layout = () => {
	return (
		<>
			<Navbar />
			<Footer id="support" />
		</>
	);
}