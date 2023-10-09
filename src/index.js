import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import WidgetPage from './WidgetPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Config from "./Config";

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/config" element={<Config />} />
                <Route path="/widget/:widgetId" element={<WidgetPage />} />
            </Routes>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);
