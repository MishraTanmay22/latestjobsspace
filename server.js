const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

// Prevent caching for JSON files
app.use((req, res, next) => {
  if (req.url.endsWith(".json")) {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});

app.use(express.static(__dirname)); // Serve static files from current directory

// Admin Password (from your admin.js)
const ADMIN_PASSWORD = "sarkari@2026";

// Login Endpoint (Optional verification)
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid password" });
  }
});

// Generic Save Endpoint
app.post("/api/save/:type", (req, res) => {
  const { type } = req.params;
  const data = req.body;

  let filename;
  if (type === "jobs") filename = "jobs.json";
  else if (type === "blogs") filename = "blogs.json";
  else if (type === "papers") filename = "papers.json";
  else if (type === "resources") filename = "resources.json";
  else return res.status(400).json({ success: false, message: "Invalid type" });

  const filePath = path.join(__dirname, filename);

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error(`Error writing ${filename}:`, err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to write file" });
    }
    console.log(`${filename} updated successfully.`);
    res.json({ success: true, message: `${filename} saved successfully` });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin Panel: http://localhost:${PORT}/admin.html`);
});
