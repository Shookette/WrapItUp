import {initializeApp} from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyDE6exA6BkM39C3u8AE-VEIsKj0GdHB5pc",
    authDomain: "wrap-it-up-2d42a.firebaseapp.com",
    projectId: "wrap-it-up-2d42a",
    storageBucket: "wrap-it-up-2d42a.firebasestorage.app",
    messagingSenderId: "403789903986",
    appId: "1:403789903986:web:154aa29c98d960ea87eaeb"
};

const initFirebase = () => {
    initializeApp(firebaseConfig);
};

export default initFirebase;