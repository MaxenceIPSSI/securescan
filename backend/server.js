const express = require("express");
const cors = require("cors");
const scanRoutes = require("./routes/scan.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/scan", scanRoutes);

app.get("/", (req, res) => {
  res.send("SecureScan API running");
});

app.listen(5000, () => {
  console.log("SecureScan backend running on port 5000");
});