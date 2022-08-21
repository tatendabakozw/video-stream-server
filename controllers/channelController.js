const User = require("../models/User");
const Video = require("../models/Video");

exports.getSingleChannelVideos = async (req,res) =>{
    const {id} =req.params
    try {
        let query = [
            {
              $lookup: {
                from: "users",
                let: { store: "user" },
                pipeline: [{ $limit: 1 }],
                as: "creator",
              },
            },
            { $unwind: "$creator" },
          ];
          query.push({
            $match: {
              author: id,
            },
          });

          // handling search queries
    if (req.query.keyword && req.query.keyword != "") {
        query.push({
          //@ts-ignore
          $match: {
            $or: [
              { title: { $regex: req.query.keyword, $options: "i" } },
              { description: { $regex: req.query.keyword, $options: "i" } },
              {
                "creator.username": {
                  $regex: req.query.keyword,
                  $options: "i",
                },
              },
              { category: { $regex: req.query.keyword, $options: "i" } },
            ],
          },
        });
      }
      // category wise filtration // should send slug
    if (req.query.category) {
        query.push({
          //@ts-ignore
          $match: {
            category: req.query.category,
          },
        });
      }
  
      // handling pagination
      let total = await Video.countDocuments(query);
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
  
      // exclude some fields
      query.push({
        //@ts-ignore
        $project: {
          "creator.username": 0,
          "creator.email": 0,
        },
      });
  
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
  
      const channel_info = await User.findOne({_id: id}) 
      let videos = await Video.aggregate(query);
  
      return res.status(200).send({
        message: "Videos fetched sucessfully",
        length: videos.length,
        meta: {
          total: total,
          currentPage: page,
          perPage: perPage,
          totalPages: Math.ceil(total / perPage),
        },
        videos: videos,
        channel_info :{
            username: channel_info.username,
            photoURL: channel_info.photoURL
        }
      });
    } catch (error) {
        return res.status(500).send({message: `${error}`})
    }
}