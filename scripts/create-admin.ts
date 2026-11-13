/**
 * Creates (or resets the password of) an admin account from environment variables.
 * There is no public admin registration.
 *
 *   ADMIN_INITIAL_EMAIL=you@example.com ADMIN_INITIAL_PASSWORD='a-strong-password' npm run create-admin
 *
 * Remove ADMIN_INITIAL_PASSWORD from your environment after running this.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { AdminSession, AdminUser } from "../src/models/auth";

async function main() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_INITIAL_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!uri) throw new Error("MONGODB_URI is required");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("ADMIN_INITIAL_EMAIL must be a valid email");
  if (!password || password.length < 12) throw new Error("ADMIN_INITIAL_PASSWORD must be at least 12 characters");

  await mongoose.connect(uri);
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await AdminUser.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    await existing.save();
    await AdminSession.deleteMany({ user: existing._id });
    console.log(`Password reset for ${email}. Existing sessions were signed out.`);
  } else {
    const count = await AdminUser.countDocuments();
    await AdminUser.create({ email, passwordHash, name: "Administrator", role: count === 0 ? "owner" : "admin" });
    console.log(`Admin account created for ${email}.`);
  }
  console.log("Now remove ADMIN_INITIAL_PASSWORD from your environment.");
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e.message ?? e);
  await mongoose.disconnect();
  process.exit(1);
});
