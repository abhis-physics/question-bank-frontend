const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-key.json'); // Replace with the path to your service account key file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestore database instance
const db = admin.firestore();

// Retrieve data from Firestore collection
const retrieveData = async () => {
  try {
    const snapshot = await db.collection('questions').get();
    const data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    return data;
  } catch (error) {
    console.error('Error retrieving data:', error);
    throw error;
  }
};

// Save data as JSON to a local file
const saveDataAsJson = async (data) => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync('data.json', jsonData);
    console.log('Data saved as JSON successfully.');
  } catch (error) {
    console.error('Error saving data as JSON:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    const data = await retrieveData();
    await saveDataAsJson(data);
    process.exit(0);
  } catch (error) {
    console.error('Script encountered an error:', error);
    process.exit(1);
  }
};

main();
