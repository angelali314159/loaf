console.log("✅ Auto-sync script started!");

// --- IMPORT LIBRARIES ---
const { google } = require('googleapis');
const admin = require('firebase-admin');
const cron = require('node-cron');

// --- CONFIGURE FILE PATHS ---
const GOOGLE_APPLICATION_CREDENTIALS_PATH = './sheets-to-firebase-475121-120db5660cce.json';
const FIREBASE_SERVICE_ACCOUNT_PATH = './loaf-840bd-firebase-adminsdk-fbsvc-69ceb4c0e2.json';

// --- CONFIGURE SHEET ---
const SPREADSHEET_ID = '1s5kEn1UWloFB_LQVWJvc9JDb3z5YzP8dK7X5e7CRT_8';
const RANGE = 'Sheet1!A1:Z';
const FIRESTORE_COLLECTION = 'ExercisesDataFromGoogleSheet';
const ID_FIELD = 'name';

// --- AUTH SETUP ---
const credentials = require(GOOGLE_APPLICATION_CREDENTIALS_PATH);
const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth });

admin.initializeApp({
  credential: admin.credential.cert(require(FIREBASE_SERVICE_ACCOUNT_PATH))
});
const db = admin.firestore();

// --- SYNC FUNCTION ---
async function syncSheetToFirebase() {
  try {
    console.log('🔄 Reading Google Sheet...');
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
    const values = res.data.values || [];
    if (!values.length) return console.log('No data found.');

    const headers = values[0].map(h => String(h).trim());
    const rows = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });

    // Clear existing collection
    const colRef = db.collection(FIRESTORE_COLLECTION);
    const oldDocs = await colRef.get();
    const delBatch = db.batch();
    oldDocs.forEach(doc => delBatch.delete(doc.ref));
    await delBatch.commit();

    // Write new rows
    const batch = db.batch();
    rows.forEach(row => {
      const id = row[ID_FIELD]
        ? String(row[ID_FIELD]).replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')
        : undefined;
      const docRef = id ? colRef.doc(id) : colRef.doc();
      batch.set(docRef, row);
    });

    await batch.commit();
    console.log(`✅ Synced ${rows.length} rows to Firestore.`);
  } catch (err) {
    console.error('❌ Sync failed:', err);
  }
}

// --- RUN NOW ---
syncSheetToFirebase();

// --- SCHEDULE (every 30 minutes) ---
cron.schedule('*/10 * * * *', () => {
  console.log('🕒 Running scheduled sync...');
  syncSheetToFirebase();
});
