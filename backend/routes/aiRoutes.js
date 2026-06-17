const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const { analyzeResume, getJobRecommendations, getCareerRoadmap, getConnectionSuggestions, getSkillTrends, chatbot, getMarketInsights } = require('../controllers/aiController');

// Multer memory storage configuration for document upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public chatbot (no auth required)
router.post('/chatbot', chatbot);

// Protected AI features
router.post('/analyze-resume', protect, upload.single('resume'), analyzeResume);
router.get('/job-recommendations', protect, getJobRecommendations);
router.post('/career-roadmap', protect, getCareerRoadmap);
router.get('/connection-suggestions', protect, getConnectionSuggestions);
router.get('/skill-trends', protect, getSkillTrends);
router.get('/market-insights', protect, getMarketInsights);

module.exports = router;
