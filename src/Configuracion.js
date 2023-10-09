import React, {useState, useEffect} from 'react';
import {FaLink} from 'react-icons/fa';
import firebase from './firebase'; // Asegúrate de tener el archivo firebase.js
import './Configuracion.css';

function Configuracion() {
    const [inputs, setInputs] = useState([]);
    const [newIconFile, setNewIconFile] = useState(null);
    const [newUrl, setNewUrl] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [notification, setNotification] = useState({message: '', color: ''});

    useEffect(() => {
        const configRef = firebase.database().ref('config');

        const handleChildAdded = snapshot => {
            const newInput = {
                id: snapshot.key,
                url: snapshot.val().url,
                title: snapshot.val().title,
                icon: snapshot.val().icon
            };
            setInputs(prevInputs => [...prevInputs, newInput]);
        };

        configRef.on('child_added', handleChildAdded);

        return () => {
            configRef.off('child_added', handleChildAdded);
        };
    }, []);

    const handleAddInput = async () => {
        if (newUrl && newTitle) { // Verificar si se ha proporcionado la URL y el título
            const configRef = firebase.database().ref('config');
            const newInputRef = configRef.push();

            // Lógica para manejar el ícono opcional
            if (newIconFile) {
                const storageRef = firebase.storage().ref();
                const iconFileRef = storageRef.child(`icons/${newIconFile.name}`);
                await iconFileRef.put(newIconFile);
                const iconUrl = await iconFileRef.getDownloadURL();
                newInputRef.set({
                    url: newUrl,
                    title: newTitle,
                    icon: iconUrl
                });
            } else {
                newInputRef.set({
                    url: newUrl,
                    title: newTitle
                });
            }

            setNotification({message: 'Añadido', color: 'green'});
            setNewUrl('');
            setNewTitle('');
            setNewIconFile(null);

            setTimeout(() => {
                setNotification({message: '', color: ''});
            }, 1500);
        }
    };

    const handleUpdateInput = (id, updatedUrl, updatedTitle) => {
        const configRef = firebase.database().ref('config');
        configRef.child(id).update({
            url: updatedUrl,
            title: updatedTitle
        });

        setNotification({message: 'Modificado', color: '#ffc107'});

        setTimeout(() => {
            setNotification({message: '', color: ''});
        }, 1500);
    };

    const handleRemoveInput = id => {
        const configRef = firebase.database().ref('config');
        configRef.child(id).remove();

        setNotification({message: 'Eliminado', color: 'red'});
        setInputs(inputs.filter(input => input.id !== id));

        setTimeout(() => {
            setNotification({message: '', color: ''});
        }, 1500);
    };

    return (
        <div className="container">
            <h2>Configuración de URLs</h2>
            {notification.message && (
                <div className="notification" style={{backgroundColor: notification.color}}>
                    {notification.message}
                </div>
            )}
            <div id="inputContainer">
                {inputs.map((input) => (
                    <div key={input.id} className="input-field">
                        {console.log(input)}
                        <div className="icon-container">
                            {input.icon ? (
                                <img
                                    src={input.icon}
                                    alt="Icono"
                                    height={30}
                                    width={30}
                                    className="icon"
                                />
                            ) : (
                                <FaLink/>
                            )}
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                value={input.url}
                                onChange={(e) => {
                                    const updatedInputs = inputs.map((i) =>
                                        i.id === input.id
                                            ? {...i, url: e.target.value}
                                            : i
                                    );
                                    setInputs(updatedInputs);
                                }}
                                placeholder="URL"
                                className="input"
                            />
                            <input
                                type="text"
                                value={input.title}
                                onChange={(e) => {
                                    const updatedInputs = inputs.map((i) =>
                                        i.id === input.id
                                            ? {...i, title: e.target.value}
                                            : i
                                    );
                                    setInputs(updatedInputs);
                                }}
                                placeholder="Título"
                                className="input"
                            />
                            <button
                                onClick={() =>
                                    handleUpdateInput(
                                        input.id,
                                        input.url,
                                        input.title
                                    )
                                }
                                className="update-button"
                            >
                                Modificar
                            </button>
                            <button
                                onClick={() => handleRemoveInput(input.id)}
                                className="delete-button"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <input
                    type="file"
                    onChange={e => {
                        setNewIconFile(e.target.files[0]);
                    }}
                    accept="image/*"
                    className="file-input"
                />
                <input
                    type="text"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder="Nueva URL"
                    className="input"
                />
                <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Nuevo Título"
                    className="input"
                />
                <button onClick={handleAddInput} className="add-button">
                    Añadir
                </button>
            </div>
        </div>
    );
}

export default Configuracion;
