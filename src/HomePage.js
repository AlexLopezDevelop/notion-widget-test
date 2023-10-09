import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebase from './firebase';

function HomePage() {
    const [widgets, setWidgets] = useState([]);

    useEffect(() => {
        const widgetRef = firebase.database().ref('widgets');

        widgetRef.on('value', snapshot => {
            const fetchedWidgets = [];
            snapshot.forEach(widgetSnapshot => {
                fetchedWidgets.push({
                    id: widgetSnapshot.key,
                    title: widgetSnapshot.val().title || '',
                    urls: widgetSnapshot.val().urls || []
                });
            });
            setWidgets(fetchedWidgets);
        });

        return () => {
            widgetRef.off('value');
        };
    }, []);

    return (
        <div className="container">
            <div className="widget-list">
                {widgets.map(widget => (
                    <div key={widget.id} className="widget-item">
                        <Link to={`/widget/${widget.id}`} className="widget-link">
                            Widget {widget.id}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;
