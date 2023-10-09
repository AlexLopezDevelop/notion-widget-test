import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebase from './firebase';
import './App.css';

function App() {
    const [configValues, setConfigValues] = useState([]);

    useEffect(() => {
        const configRef = firebase.database().ref('widgets');

        configRef.on('value', snapshot => {
            const configData = snapshot.val();
            if (configData) {
                const configArray = Object.keys(configData).map(id => ({
                    id,
                    urls: configData[id].urls
                }));
                setConfigValues(configArray);
            } else {
                setConfigValues([]);
            }
        });
    }, []);

    const copyToClipboard = value => {
        const textField = document.createElement('textarea');
        textField.innerText = value;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove();
    };

    const handleCopyToClipboard = (url) => {
        copyToClipboard(url);
        console.log('URL copied to clipboard:', url);
    };

    return (
        <div className="container">
            <div className="url-list">
                {configValues.map(config => (
                    <div key={config.id} className="url-item">
                        <ul>
                            {config.urls.map((url, index) => (
                                <li key={index}>
                                    <Link
                                        to={`/widget/${config.id}`}
                                        className="url-link"
                                        onClick={() => handleCopyToClipboard(url.url)}
                                    >
                                        {config.id}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
