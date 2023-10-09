import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDCecx3LwyZFdjYDhPXxkkWTC2RktndNUo",
    authDomain: "notion-widget-copy-box.firebaseapp.com",
    projectId: "notion-widget-copy-box",
    storageBucket: "notion-widget-copy-box.appspot.com",
    messagingSenderId: "497120890645",
    appId: "1:497120890645:web:c5c7b227185908f10de31c"
};

const app = firebase.initializeApp(firebaseConfig);

export const database = app.database();
export const storage = app.storage();
export default firebase;
