import express, { Request, Response, RequestHandler } from "express";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import pool from "../config/db";

const router = express.Router();

// Define route handler types explicitly using RequestHandler
const verify2FAHandler: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Explicitly define the return type as Promise<void>
  const { userId, token } = req.body;

  if (!userId || !token) {
    res.status(400).json({ message: "Missing userId or token" });
    return; // Ensure nothing is returned here
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const user = result.rows[0];

    if (!user || !user.twofa_secret) {
      res.status(404).json({ message: "User not found or 2FA not set up" });
      return;
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: "base32",
      token,
    });

    if (!isValid) {
      res.status(401).json({ message: "Invalid 2FA token" });
      return;
    }

    req.login(user, (err: Error | null) => {
      if (err) {
        res.status(500).json({ message: "Login failed" });
        return;
      }
      res.status(200).json({ message: "2FA verified and user logged in" });
    });
  } catch (err) {
    console.error("2FA verification error:", err);
    res.status(500).json({ message: "Server error: 2FA verification error" });
  }
};

const setup2FAHandler: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ message: "Missing userId" });
    return;
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const user = result.rows[0];

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate a secret key for 2FA
    const secret = speakeasy.generateSecret({
      name: process.env.LINKED_APP_NAME,
    });

    if (!secret.otpauth_url) {
      res.status(500).json({ message: "Failed to generate OTP Auth URL" });
      return;
    }

    // Save the secret key to the user's record in the database
    await pool.query(
      "UPDATE users SET twofa_secret = $1, twofa_enabled = $2 WHERE id = $3",
      [
        secret.base32,
        true, // Set twofa_enabled to true
        userId,
      ],
    );

    // Generate the QR code URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      message: "2FA setup initiated",
      secret: secret.base32,
      qrCodeUrl,
    });
  } catch (err) {
    console.error("2FA setup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Use the defined route handlers
router.post("/verify-2fa", verify2FAHandler);
router.post("/setup-2fa", setup2FAHandler);

export default router;
