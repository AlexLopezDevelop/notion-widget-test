import React, {useState, useEffect} from 'react';
import {FaCheck, FaClipboard, FaLink, FaSave, FaTrash} from 'react-icons/fa';
import {SketchPicker} from 'react-color';
import firebase, {database} from './firebase';
import {getAuth, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import './Config.css';
import Modal from 'react-modal'; // Importa la biblioteca react-modal

Modal.setAppElement('#root'); // Debe apuntar al nodo raíz de tu aplicación


function Config() {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [widgets, setWidgets] = useState([
        {
            id: 1,
            title: '',
            urls: [],     // Asegúrate de inicializar correctamente urls y buttons
            buttons: []   // Asegúrate de inicializar correctamente urls y buttons
        },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedButton, setSelectedButton] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showSecondColorPicker, setShowSecondColorPicker] = useState(false); // Nuevo estado
    const [copiedButtonId, setCopiedButtonId] = useState(null);

    const auth = getAuth();

    useEffect(() => {
        const widgetRef = database.ref('widgets');

        const handleDataChange = (snapshot) => {
            const fetchedWidgets = [];
            snapshot.forEach((widgetSnapshot) => {
                fetchedWidgets.push({
                    id: widgetSnapshot.key,
                    title: widgetSnapshot.val().title || '',
                    urls: widgetSnapshot.val().urls || [],
                    buttons: widgetSnapshot.val().buttons || [],
                });
            });
            setWidgets(fetchedWidgets.reverse());  // Invertir el orden de los widgets antes de establecerlos
        };

        widgetRef.on('value', handleDataChange);

        return () => {
            widgetRef.off('value', handleDataChange);
        };
    }, []);

    const handleAddWidget = () => {
        const newWidgetId = Date.now();
        const newWidget = {id: newWidgetId, title: '', urls: [], buttons: []};
        setWidgets([newWidget, ...widgets]); // Agregar el nuevo widget al principio
    };

    const handleSaveWidget = async (id, title, urls, buttons) => {
        const widgetRef = database.ref(`widgets/${id}`);
        await widgetRef.set({title, urls, buttons});
    };

    const handleDeleteWidget = async (widgetId) => {
        const widgetRef = database.ref(`widgets/${widgetId}`);
        await widgetRef.remove();
    };

    const handleSaveButton = async (widgetId, buttonIndex, button) => {
        const widgetRef = database.ref(`widgets/${widgetId}`);
        const updatedButtons = widgets.find(w => w.id === widgetId).buttons.map((b, index) =>
            index === buttonIndex ? button : b
        );
        await widgetRef.update({buttons: updatedButtons}); // Actualiza solo el array de botones en la base de datos
    };

    const handleRemoveButton = (widgetId, buttonIndex) => {
        const updatedWidgets = widgets.map((widget) =>
            widget.id === widgetId
                ? {
                    ...widget,
                    buttons: widget.buttons
                        ? widget.buttons.filter((_, index) => index !== buttonIndex)
                        : [],
                }
                : widget
        );
        setWidgets(updatedWidgets);
    };

    const handleAddButton = (widgetId) => {
        const updatedWidgets = widgets.map((widget) =>
            widget.id === widgetId
                ? {
                    ...widget,
                    buttons: widget.buttons ? [...widget.buttons, {text: '', url: ''}] : [{text: '', url: ''}]
                }
                : widget
        );
        setWidgets(updatedWidgets);
    };

    const handleAddButtonIcon = async (widgetId, buttonIndex, iconFile) => {
        const storageRef = firebase.storage().ref();
        const iconFileRef = storageRef.child(`icons/${iconFile.name}`);
        await iconFileRef.put(iconFile);
        const iconUrl = await iconFileRef.getDownloadURL();

        const updatedWidgets = widgets.map((widget) =>
            widget.id === widgetId
                ? {
                    ...widget,
                    buttons: widget.buttons.map((button, index) =>
                        index === buttonIndex ? {...button, icon: iconUrl} : button
                    ),
                }
                : widget
        );
        setWidgets(updatedWidgets);
    };

    const handleAddUrl = (widgetId) => {
        const updatedWidgets = widgets.map((widget) =>
            widget.id === widgetId
                ? {
                    ...widget,
                    urls: widget.urls ? [...widget.urls, {url: '', title: ''}] : [{url: '', title: ''}]
                }
                : widget
        );
        setWidgets(updatedWidgets);
    };

    const handleRemoveUrl = (widgetId, urlIndex) => {
        const updatedWidgets = widgets.map((widget) =>
            widget.id === widgetId
                ? {
                    ...widget,
                    urls: widget.urls
                        ? widget.urls.filter((_, index) => index !== urlIndex)
                        : [],
                }
                : widget
        );
        setWidgets(updatedWidgets);
    };

    const handleColorChange = (color) => {
        const updatedWidgets = widgets.map((widget) =>
            widget.id === selectedButton.widgetId
                ? {
                    ...widget,
                    buttons: widget.buttons.map((button, index) =>
                        index === selectedButton.buttonIndex ? {...button, color: color.hex} : button
                    ),
                }
                : widget
        );
        setWidgets(updatedWidgets);
    };

    const handleSecondColorChange = (color) => {
        const updatedWidgets = widgets.map((widget) =>
            widget.id === selectedButton.widgetId
                ? {
                    ...widget,
                    buttons: widget.buttons.map((button, index) =>
                        index === selectedButton.buttonIndex
                            ? {...button, color2: color.hex} // Agregar el color2 al botón
                            : button
                    ),
                }
                : widget
        );
        setWidgets(updatedWidgets);
    };

    const closeColorPicker = () => {
        setSelectedButton(null);
        setShowColorPicker(false);
    };

    const filteredWidgets = widgets.filter((widget) =>
        widget.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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


    // Manejo de inicio de sesión
    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                setUser(user);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    // Manejo de cierre de sesión
    const handleLogout = () => {
        signOut(auth).then(() => {
            setUser(null);
        }).catch((error) => {
            console.error(error);
        });
    }

    const openColorPicker = (widgetId, buttonIndex, isSecondColor = false) => {
        setSelectedButton({widgetId, buttonIndex});
        if (isSecondColor) {
            setShowColorPicker(false);
            setShowSecondColorPicker(true);
        } else {
            setShowSecondColorPicker(false);
            setShowColorPicker(true);
        }
    };


    return (
        <div className="app">
            {/* Formulario de inicio de sesión */}
            {!user ? (
                <div className="login-form">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin}>Iniciar Sesión</button>
                </div>
            ) : (
                <div className="app">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Buscar por título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-button" onClick={() => setSearchTerm('')}>Limpiar</button>
                    </div>
                    <button onClick={handleAddWidget} className="add-widget-button">
                        Agregar Widget
                    </button>
                    <div className="widget-container">
                        {filteredWidgets.map((widget) => (
                            <div key={widget.id} className="widget">
                                <input
                                    type="text"
                                    value={widget.title}
                                    onChange={(e) => {
                                        const updatedWidgets = widgets.map((w) =>
                                            w.id === widget.id
                                                ? {...w, title: e.target.value}
                                                : w
                                        );
                                        setWidgets(updatedWidgets);
                                    }}
                                    placeholder="Título del Widget"
                                />
                                <h3>URLs</h3>
                                <div className="urls">
                                    {widget.urls.map((url, urlIndex) => (
                                        <div className="url-container" key={urlIndex}>
                                            <div className="url-input-container">
                                                {/* URL Input */}
                                                <input
                                                    type="text"
                                                    value={url.url}
                                                    onChange={(e) => {
                                                        const updatedWidgets = widgets.map((w) =>
                                                            w.id === widget.id
                                                                ? {
                                                                    ...w,
                                                                    urls: w.urls.map((u, index) =>
                                                                        index === urlIndex ? {...u, url: e.target.value} : u
                                                                    )
                                                                }
                                                                : w
                                                        );
                                                        setWidgets(updatedWidgets);
                                                    }}
                                                    placeholder="URL del botón"
                                                />
                                                {/* Title Input */}
                                                <input
                                                    type="text"
                                                    value={url.title}
                                                    onChange={(e) => {
                                                        const updatedWidgets = widgets.map((w) =>
                                                            w.id === widget.id
                                                                ? {
                                                                    ...w,
                                                                    urls: w.urls.map((u, index) =>
                                                                        index === urlIndex ? {
                                                                            ...u,
                                                                            title: e.target.value
                                                                        } : u
                                                                    )
                                                                }
                                                                : w
                                                        );
                                                        setWidgets(updatedWidgets);
                                                    }}
                                                    placeholder="Título de la URL"
                                                />
                                                <button
                                                    onClick={() => handleRemoveUrl(widget.id, urlIndex)}
                                                    className="remove-url-button"
                                                >
                                                    <FaTrash/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => handleAddUrl(widget.id)}
                                        className="add-url-button"
                                    >
                                        Agregar Link
                                    </button>
                                </div>
                                <h3>Botones</h3>
                                <div className="buttons-config">
                                    {widget.buttons.map((button, buttonIndex) => (
                                        <div className="url-container" key={buttonIndex}>
                                            <div className="url-input-container">
                                                <div className="icon-container">
                                                    {button.icon ? (
                                                        <img
                                                            src={button.icon}
                                                            height={30}
                                                            width={30}
                                                            alt="icon"
                                                            onClick={(e) => {
                                                                e.target.nextSibling.click();
                                                            }}
                                                            style={{cursor: 'pointer'}}
                                                        />
                                                    ) : (
                                                        <label
                                                            htmlFor={`iconInput-${widget.id}-${buttonIndex}`}
                                                            style={{cursor: 'pointer'}}
                                                        >
                                                            <FaLink size={30}/>
                                                        </label>
                                                    )}
                                                    <input
                                                        type="file"
                                                        id={`iconInput-${widget.id}-${buttonIndex}`}
                                                        onChange={(e) => {
                                                            handleAddButtonIcon(
                                                                widget.id,
                                                                buttonIndex,
                                                                e.target.files[0]
                                                            );
                                                        }}
                                                        style={{display: 'none'}}
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={button.text}
                                                    onChange={(e) => {
                                                        handleSaveButton(
                                                            widget.id,
                                                            buttonIndex,
                                                            {
                                                                ...button,
                                                                text: e.target.value,
                                                            }
                                                        );
                                                    }}
                                                    placeholder="Texto del botón"
                                                />
                                                <input
                                                    type="text"
                                                    value={button.url}
                                                    onChange={(e) => {
                                                        handleSaveButton(
                                                            widget.id,
                                                            buttonIndex,
                                                            {
                                                                ...button,
                                                                url: e.target.value,
                                                            }
                                                        );
                                                    }}
                                                    placeholder="URL del botón"
                                                />
                                                <div className="color-button-container">
                                                    {button.color && (
                                                        <div
                                                            className="color-preview"
                                                            style={{backgroundColor: button.color}}
                                                        ></div>
                                                    )}
                                                    <button
                                                        onClick={() => openColorPicker(widget.id, buttonIndex, false)}
                                                        className="color-button"
                                                    >
                                                        Color
                                                    </button>
                                                    {button.color2 && (
                                                        <div
                                                            className="color-preview"
                                                            style={{backgroundColor: button.color2}}
                                                        ></div>
                                                    )}
                                                    <button
                                                        onClick={() => openColorPicker(widget.id, buttonIndex, true)}
                                                        className="color-button"
                                                    >
                                                        Color 2
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveButton(widget.id, buttonIndex)}
                                                    className="remove-url-button"
                                                >
                                                    <FaTrash/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => handleAddButton(widget.id)}
                                        className="add-url-button"
                                    >
                                        Agregar Botón
                                    </button>
                                </div>
                                <div className="link-align">
                                    <div key={widget.title} className="input-row">
                                        <FaLink/>
                                        <input
                                            type="text"
                                            value={`${window.location.origin}/widget/${widget.id}`}
                                            readOnly
                                            className="styled-input"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleCopyButtonClick(`${window.location.origin}/widget/${widget.id}`, widget.id)}
                                        className={`styled-button styled-button-extra ${copiedButtonId === widget.id ? 'copied' : ''}`}
                                    >
                                        {copiedButtonId === widget.id ? (
                                            <>
                                                <FaCheck/> Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <FaClipboard/> Copiar
                                            </>
                                        )}
                                    </button>
                                </div>
                                <button
                                    onClick={() =>
                                        handleSaveWidget(widget.id, widget.title, widget.urls, widget.buttons)
                                    }
                                    className="save-button"
                                >
                                    <FaSave/> Guardar
                                </button>
                                <button
                                    onClick={() => handleDeleteWidget(widget.id)}
                                    className="delete-button"
                                >
                                    <FaTrash/> Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                    <Modal
                        isOpen={showColorPicker && selectedButton}
                        onRequestClose={closeColorPicker}
                        className="color-modal"
                        overlayClassName="overlay"
                    >
                        <h2>Selecciona un color</h2>
                        <div className="color-picker">
                            <SketchPicker
                                color={selectedButton ? widgets.find(w => w.id === selectedButton.widgetId).buttons[selectedButton.buttonIndex].color : '#ffffff'}
                                onChangeComplete={(color) => handleColorChange(color)}
                            />
                        </div>
                        <button onClick={closeColorPicker} className="close-button">Cerrar</button>
                    </Modal>
                    <Modal
                        isOpen={showSecondColorPicker && selectedButton}
                        onRequestClose={closeColorPicker}
                        className="color-modal"
                        overlayClassName="overlay"
                    >
                        <h2>Selecciona un segundo color</h2>
                        <div className="color-picker">
                            <SketchPicker
                                color={
                                    selectedButton
                                        ? widgets.find(w => w.id === selectedButton.widgetId).buttons[selectedButton.buttonIndex].color2 || '#ffffff'
                                        : '#ffffff'
                                }
                                onChangeComplete={(color) => handleSecondColorChange(color)}
                            />
                        </div>
                        <button onClick={closeColorPicker} className="close-button">Cerrar</button>
                    </Modal>
                </div>
            )}
        </div>
    );
}

export default Config;
