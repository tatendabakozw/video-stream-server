const express = require('express')
const Report = require('../../models/Report')
const User = require('../../models/User')
const Video = require('../../models/Video')
const router = express.Router()

// get all dashboar info
router.get('/info', async(req,res, next)=>{
    try {
        const users = await User.countDocuments()
        const videos = await Video.countDocuments()
        const reports = await Report.countDocuments()

        return res.status(200).send({message: 'Info sent', data:{
            users: users,
            videos: videos,
            reports: reports
        }})
    } catch (error) {
        next(error)
    }
})

module.exports = router