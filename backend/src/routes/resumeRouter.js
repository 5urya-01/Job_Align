const express = require('express');
const router = express.Router();
const multer = require('multer');
const { addResume, getAtsAnalysis } = require('../controllers/resumeController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/addResume', upload.single('resume'), addResume);
router.post('/getAtsAnalysis', upload.single('resume'), getAtsAnalysis);

module.exports = router;
