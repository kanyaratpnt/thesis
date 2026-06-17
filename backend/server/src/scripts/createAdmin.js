import "dotenv/config";
import { db } from "../config/db.js";
import { hashPassword } from "../utils/password.js";

async function main() {
  try {
    const user_name = process.env.ADMIN_NAME || "UnieedAdmin";
    const user_email = (process.env.ADMIN_EMAIL || "admin01@unieed.com").trim().toLowerCase();
    const plainPassword = process.env.ADMIN_PASSWORD || "admin1234";

    if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
      throw new Error("กรุณาตั้งค่า ADMIN_PASSWORD ก่อนสร้าง admin บน production");
    }

    const password_hash = await hashPassword(plainPassword);

    const [existing] = await db.execute(
      "SELECT user_id FROM users WHERE user_email = ? LIMIT 1",
      [user_email]
    );

    if (existing.length) {
      await db.execute(
        `UPDATE users
         SET user_name = ?, password_hash = ?, role = 'admin', status = 'active', email_verified = 1
         WHERE user_email = ?`,
        [user_name, password_hash, user_email]
      );
      console.log("✅ Updated admin:", user_email);
    } else {
      await db.execute(
        `INSERT INTO users (user_name, user_email, password_hash, role, status, email_verified)
         VALUES (?, ?, ?, 'admin', 'active', 1)`,
        [user_name, user_email, password_hash]
      );
      console.log("✅ Created admin:", user_email);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

main();
