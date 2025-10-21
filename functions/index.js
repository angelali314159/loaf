const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {google} = require("googleapis");

// Path to your credentials (copy from your main project folder)
const FIREBASE_SERVICE_ACCOUNT = require("../loaf-840bd-firebase-adminsdk-fbsvc-69ceb4c0e2.json");
const GOOGLE_APPLICATION_CREDENTIALS_PATH = "./sheets-to-firebase-475121-120db5660cce.json";

// Config
const SPREADSHEET_ID = "1s5kEn1UWloFB_LQVWJvc9JDb3z5YzP8dK7X5e7CRT_8";
const RANGE = "Sheet1!A1:Z";
const FIRESTORE_COLLECTION = "ExercisesDataFromGoogleSheet";
const ID_FIELD = "name";

// Firebase + Sheets setup
admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_SERVICE_ACCOUNT),
});
const db = admin.firestore();

async function syncSheetToFirebase() {
  const auth = new google.auth.GoogleAuth({
    keyFile: GOOGLE_APPLICATION_CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({version: "v4", auth});

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  const values = res.data.values || [];
  const headers = values[0].map((h) => String(h).trim());
  const rows = values.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });

  console.log(`Refreshing Firestore with ${rows.length} rows...`);
  const colRef = db.collection(FIRESTORE_COLLECTION);
  const oldDocs = await colRef.get();

  // Delete old docs
  const delBatch = db.batch();
  oldDocs.forEach((doc) => delBatch.delete(doc.ref));
  await delBatch.commit();

  // Add new docs
  const batch = db.batch();
  rows.forEach((row) => {
    const id = row[ID_FIELD] ?
      String(row[ID_FIELD]).replace(/[^\w\s]/gi, "").replace(/\s+/g, "_") :
      undefined;
    const docRef = id ? colRef.doc(id) : colRef.doc();
    batch.set(docRef, row);
  });

  await batch.commit();
  console.log("✅ Firestore updated from Google Sheets!");
}

// HTTP endpoint — this is what Google Sheets will call
exports.refreshFromSheet = functions.https.onRequest(async (req, res) => {
  try {
    await syncSheetToFirebase();
    res.status(200).send("Firestore refreshed successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
