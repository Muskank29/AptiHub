const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // download from Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();
module.exports = db;
