const express = require('express')
const { editUserInfo, getUserVideos, getUserInfo } = require('../../controllers/userController')
const { requireUserSignIn } = require('../../middleware/auth')
const router = express.Router()

//edit user info
router.put('/edit/:id', requireUserSignIn, editUserInfo)

//get user videos
// get request
// /api/user/videos
// requeres user to be logged in
router.get('/videos', requireUserSignIn,getUserVideos )

// get user information
// get request
// /api/user/info
router.get('/info', getUserInfo)

module.exports = router