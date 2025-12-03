// routes/refundRoutes.js
import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET all refunds (alias DB columns to match frontend)
router.get("/all", (req, res) => {
  const sql = `
   SELECT
  refund_id,
  name,
  telephone,
  mobile,
  email,
  address,
  zip,
  refundAmount AS refund_amount,
  cancelOrder AS cancel_order,
  created_at
  FROM refunds
  ORDER BY id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("GET /refunds/all error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
    return res.json({ success: true, data: results });
  });
});

// Generate 10-digit alpha-numeric Refund ID
function generateRefundId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 10; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ADD a new refund entry (returns refundId)
router.post("/add", (req, res) => {
  const {
    name,
    telephone,
    mobile,
    email,
    address,
    zip,
    refundAmount,
    cancelOrder,
  } = req.body ?? {};

  if (!name || !telephone || !mobile || !email || !address || !zip || !refundAmount) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // Generate initial ID
  let refundId = generateRefundId();

  // Check collision and retry if needed
  const checkSql = `SELECT refund_id FROM refunds WHERE refund_id = ? LIMIT 1`;

  db.query(checkSql, [refundId], (err, rows) => {
    if (err) {
      console.error("ID generation error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    if (rows.length > 0) {
      refundId = generateRefundId(); // regenerate on collision
    }

    const insertSql = `
      INSERT INTO refunds
      (refund_id, name, telephone, mobile, email, address, zip, refundAmount, cancelOrder)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
        refundId,
        name,
        telephone,
        mobile,
        email,
        address,
        zip,
        refundAmount,
        cancelOrder,
      ],
      (err) => {
        if (err) {
          console.error("POST /refunds/add error:", err);
          return res.status(500).json({ success: false, message: err.message });
        }

        // Send the alpha-numeric refund ID to frontend
        return res.json({
          success: true,
          message: "Form submitted successfully",
          refundId: refundId,
        });
      }
    );
  });
});

export default router;
