const express = require('express')
const { getAllUsers } = require('../../controllers/adminController')
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

router.get('/users', getAllUsers)

router.get('/reports', async(req, res, next)=>{
    try {
        // handling creator schema
        let query = [ ];
    
        // query.push({
        //   $match: {
        //     status: "public",
        //   },
        // });
    
        // handling search queries
        if (req.query.keyword && req.query.keyword != "") {
          query.push({
            //@ts-ignore
            $match: {
              $or: [
                { user: { $regex: req.query.keyword, $options: "i" } },
                { report: { $regex: req.query.keyword, $options: "i" } },
                { video: { $regex: req.query.keyword, $options: "i" } },
              ],
            },
          });
        }

        // handling sort
        if (req.query.sortBy && req.query.sortOrder) {
          var sort = {};
          //@ts-ignore
          sort[req.query.sortBy] = req.query.sortOrder == "asc" ? 1 : -1;
          query.push({
            //@ts-ignore
            $sort: sort,
          });
        } else {
          query.push({
            //@ts-ignore
            $sort: { createdAt: -1 },
          });
        }
    
        // handling pagination
        let total = await Report.countDocuments(query);
        //@ts-ignore
        let page = req.query.page ? parseInt(req.query.page) : 1;
        //@ts-ignore
        let perPage = req.query.perPage ? parseInt(req.query.perPage) : 16;
        let skip = (page - 1) * perPage;
    
        query.push({
          //@ts-ignore
          $skip: skip,
        });
        query.push({
          //@ts-ignore
          $limit: perPage,
        });
    
    
        let reports = await Report.aggregate(query);
    
        return res.status(200).send({
          message: "Reports fetched sucessfully",
          length: reports.length,
          meta: {
            total: total,
            currentPage: page,
            perPage: perPage,
            totalPages: Math.ceil(total / perPage),
          },
          reports: reports,
        });
      } catch (error) {
        next(error)
      }
    
})

module.exports = router