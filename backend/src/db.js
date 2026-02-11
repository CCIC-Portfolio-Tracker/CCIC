import { createClient } from "@libsql/client";
import dotenv from "dotenv";
dotenv.config();

// Initialize turso database
const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_KEY,
});

export default db;