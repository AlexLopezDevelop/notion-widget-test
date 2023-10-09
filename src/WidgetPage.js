import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {FaCheck, FaClipboard, FaLink} from 'react-icons/fa';
import firebase from './firebase';
import './App.css';
import CopyIcon from "./IconoCopiar";

function WidgetPage() {
    const {widgetId} = useParams();
    const [widgetData, setWidgetData] = useState(null);

    const [copiedButtonId, setCopiedButtonId] = useState(null);

    useEffect(() => {
        const widgetRef = firebase.database().ref(`widgets/${widgetId}`);

        widgetRef.on('value', snapshot => {
            const data = snapshot.val();
            if (data) {
                setWidgetData(data);
            } else {
                setWidgetData(null);
            }
        });

        return () => {
            widgetRef.off('value');
        };
    }, [widgetId]);


    const handleCopyButtonClick = (value, buttonId) => {
        const inputElement = document.createElement('input');
        inputElement.value = value;
        document.body.appendChild(inputElement);
        inputElement.select();
        document.execCommand('copy');
        document.body.removeChild(inputElement);

        setCopiedButtonId(buttonId);
        setTimeout(() => {
            setCopiedButtonId(null);
        }, 1500);
    };


    const handleButtonLinkClick = (url) => {
        const formattedUrl = url.startsWith('http') ? url : `http://${url}`;
        window.open(formattedUrl, '_blank');
    };

    return (
        <div className="container centered-content">
            {widgetData ? (
                <div>
                    <div className="urls">
                        {widgetData.urls && widgetData.urls.map((url, index) => (
                            <div className="link-container">
                                <span className="link-title">{url.title}</span>
                                <div className="link-align">
                                    <div key={url.title} className="input-row">
                                        <FaLink/>
                                        <input
                                            type="text"
                                            value={url.url}
                                            readOnly
                                            className={`styled-input ${url.url ? '' : 'no-value'}`}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleCopyButtonClick(url.url, url.title)}
                                        className={`styled-button styled-button-extra ${copiedButtonId === url.title ? 'copied' : ''}`}
                                    >
                                        {copiedButtonId === url.title ? (
                                            <>
                                                <FaCheck/> Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <CopyIcon/> Copiar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="buttons">
                        {widgetData.buttons && widgetData.buttons.map((button, index) => (
                            <div key={button.title} className="button-row">
                                <button
                                    className={`styled-button social ${button.color2 ? 'gradient-button' : ''}`}
                                    onClick={() => handleButtonLinkClick(button.url)}
                                    style={{
                                        background: button.color2
                                            ? `linear-gradient(to right, ${button.color || '#007bff'}, ${button.color2})`
                                            : button.color || '#007bff',
                                    }}
                                >
                                    {button.icon && (
                                        <img
                                            height={20}
                                            width={20}
                                            src={button.icon}
                                            alt={button.text}
                                            style={{marginRight: '5px', verticalAlign: 'middle'}}
                                        />
                                    )}
                                    <span style={{verticalAlign: 'middle'}}>{button.text}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p></p>
            )}
        </div>
    );
}

export default WidgetPage;
