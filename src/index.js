import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from './Components/layout';
import { Home } from './Components/home';
import { Manifesto } from './Components/manifesto';
import { Posts } from './Components/posts';
import { About } from './Components/about';
import reportWebVitals from './reportWebVitals';
import ScrollToTop from './scrollToTop';
import './index.css';

function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="manifesto" element={<Manifesto />} />
					<Route path="posts" element={<Posts />} />
					<Route path="about" element={<About />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
