const express = require('express');
const router = express.Router();
const {
  scrapeURL, getTokens, updateTokens,
  lockToken, unlockToken, getLockedTokens,
  getVersionHistory, restoreVersion, getRecentSites
} = require('../controllers/tokenController');
const { exportTokens } = require('../controllers/exportController');

router.post('/scrape', scrapeURL);
router.get('/recent', getRecentSites);
router.get('/tokens/:tokenId', getTokens);
router.put('/tokens/:tokenId', updateTokens);
router.post('/tokens/:tokenId/lock', lockToken);
router.delete('/tokens/:tokenId/lock', unlockToken);
router.get('/tokens/:tokenId/locked', getLockedTokens);
router.get('/tokens/:tokenId/history', getVersionHistory);
router.post('/tokens/:tokenId/restore', restoreVersion);
router.get('/tokens/:tokenId/export', exportTokens);

module.exports = router;
