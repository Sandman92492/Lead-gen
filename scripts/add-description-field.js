/**
 * Script to add empty `description` field to all deals in Firestore
 * Run: node scripts/add-description-field.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addDescriptionField() {
  try {
    console.log('Fetching all deals...');
    const dealsRef = db.collection('deals');
    const snapshot = await dealsRef.get();

    if (snapshot.empty) {
      console.log('No deals found.');
      return;
    }

    console.log(`Found ${snapshot.size} deals. Updating...`);

    let updated = 0;
    let batch = db.batch();
    let batchCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Only update if description field doesn't exist
      if (!data.hasOwnProperty('description')) {
        batch.update(doc.ref, { description: '' });
        batchCount++;
        updated++;

        // Firestore batch limit is 500 operations
        if (batchCount === 500) {
          batch.commit();
          batch = db.batch();
          batchCount = 0;
        }
      }
    });

    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`✓ Updated ${updated} deals with empty description field.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating deals:', error);
    process.exit(1);
  }
}

addDescriptionField();
