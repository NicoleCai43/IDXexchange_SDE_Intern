const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const propertiesRouter = require("./routes/properties");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/properties", propertiesRouter);

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
