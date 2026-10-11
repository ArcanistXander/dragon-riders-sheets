/* Firebase → Project settings → Your apps → Web app. These identify the project and are meant to be public;
   the passcodes in the Firestore rules are what protect the sheets. See firebase/README.md.
   While apiKey still says PASTE, the website saves in each browser only and the party sheet links only
   to sheets opened in the same browser. */
window.FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
