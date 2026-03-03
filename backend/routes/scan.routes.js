const express = require("express");
const router = express.Router();
const multer = require("multer");
const scanController = require("../controllers/scan.controller");

const upload = multer({ dest: "uploads/" });

router.post("/zip", upload.single("project"), scanController.scanZip);

module.exports = router;