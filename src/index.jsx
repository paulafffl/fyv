import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './Components/layout';
import { Home } from './Components/home';
import { Advent } from './Components/advent';
import { Posts } from './Components/posts';
import { About } from './Components/about';
import ScrollToTop from './scrollToTop';
import './index.css';
import { Bodywork } from './Components/bodywork';

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="self-work" element={<Advent />} />
                    <Route path="bodywork" element={<Bodywork />} />
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
    </React.StrictMode>,
);
