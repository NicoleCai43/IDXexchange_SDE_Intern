const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/api/health", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "not connected",
      message: error.message,
    });
  }
});

app.get("/api/properties", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM rets_property LIMIT 10");

    res.status(200).json({
      status: "ok",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.get("/api/openhouses", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM rets_openhouse LIMIT 10");

    res.status(200).json({
      status: "ok",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});