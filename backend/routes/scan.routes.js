const express = require("express");
const router = express.Router();
const multer = require("multer");
const scanController = require("../controllers/scan.controller");
const fixController  = require("../controllers/fix.controller");

const upload = multer({ dest: "uploads/" });

router.post("/zip",    upload.single("project"), scanController.scanZip);
router.post("/github", express.json(),           scanController.scanGithub);
router.post("/fix-pr", express.json(),           fixController.createFixPR);

module.exports = router;