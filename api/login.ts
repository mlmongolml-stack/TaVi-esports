import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, nickname } = req.body;

    // Validate inputs
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!nickname || typeof nickname !== "string") {
      return res.status(400).json({ error: "Nickname is required" });
    }

    // Trim and validate
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedNickname = nickname.trim();

    if (trimmedEmail.length < 5 || trimmedEmail.length > 320) {
      return res.status(400).json({ error: "Invalid email length" });
    }
    if (trimmedNickname.length < 1 || trimmedNickname.length > 32) {
      return res.status(400).json({ error: "Nickname must be 1-32 characters" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      // Check if user exists
      const result = await pool.query(
        'SELECT id, role FROM "users" WHERE email = $1',
        [trimmedEmail]
      );

      let userId: number;
      let role: string;

      if (result.rows.length > 0) {
        // User exists
        userId = result.rows[0].id;
        role = result.rows[0].role;
      } else {
        // Create new user
        const isAdmin = trimmedEmail === "ml.mongol.ml@gmail.com";
        const insertResult = await pool.query(
          `INSERT INTO "users" (email, name, role, "openId", "loginMethod", "createdAt", "updatedAt", "lastSignedIn")
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
           RETURNING id, role`,
          [
            trimmedEmail,
            trimmedNickname,
            isAdmin ? "admin" : "user",
            `email_${trimmedEmail}`,
            "email",
          ]
        );
        userId = insertResult.rows[0].id;
        role = insertResult.rows[0].role;
      }

      // Return success
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: userId,
          email: trimmedEmail,
          nickname: trimmedNickname,
          role: role,
        },
      });
    } finally {
      await pool.end();
    }
  } catch (error) {
    console.error("[Login API] Error:", error);
    return res.status(500).json({
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
