//global helpers
const strIsEmpty = (str, minLength) =>{
    return !str || str.length < minLength;
}

//register firebase
//Web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDhmNH9MiIBIMILNwZ2B5X7qe-6e3vkNkc",
    authDomain: "pwalist-9a56e.firebaseapp.com",
    databaseURL: "https://pwalist-9a56e.firebaseio.com",
    projectId: "pwalist-9a56e",
    storageBucket: "pwalist-9a56e.appspot.com",
    messagingSenderId: "558897726381",
    appId: "1:558897726381:web:cbbe6c9e0e934006851724"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();    

//not all browsers support SWs
//navigator is a 'special' object that represents the browser
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('service worker registered', reg))
        .catch((err) => console.log('service worker failed registration', err));
}