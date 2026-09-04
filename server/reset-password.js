// reset-password.js
//
// Resets a user's password hash directly in MongoDB.
// Run with: node reset-password.js
//
// Requires: mongodb (or mongoose) and bcrypt/bcryptjs already in your
// project's node_modules — this uses whatever your app already uses.

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs"); // change to "bcrypt" if that's what your app uses

// ── EDIT THESE ────────────────────────────────────────────────
const MONGO_URI =
  "mongodb+srv://talpadadev42_db_user:Nitya_2025@cluster0.ldmp8pt.mongodb.net"; // your connection string
const DB_NAME = "pg-hostel-finder";
const COLLECTION_NAME = "users"; // your users collection name
const USER_EMAIL = "talpadadev42@gmail.com"; // the account you're resetting
const NEW_PASSWORD = "Nitya@2025"; // pick a strong new password
// ─────────────────────────────────────────────────────────────

async function resetPassword() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const users = db.collection(COLLECTION_NAME);

    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    const result = await users.updateOne(
      { email: USER_EMAIL },
      { $set: { password: hashedPassword } },
    );

    if (result.matchedCount === 0) {
      console.log(`No user found with email: ${USER_EMAIL}`);
    } else {
      console.log(`Password updated for ${USER_EMAIL}.`);
      console.log(`New password: ${NEW_PASSWORD}`);
    }
  } catch (err) {
    console.error("Error resetting password:", err);
  } finally {
    await client.close();
  }
}

resetPassword();
