const express = require('express')
const { getSingleChannelVideos } = require('../../controllers/channelController')
const router = express.Router()

// get single channel videos
// get request
// /api/channel/videos/{channelId}
router.get('/videos/:id', getSingleChannelVideos)

module.exports = router
