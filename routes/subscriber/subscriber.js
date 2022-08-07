const express = require("express");
const {
  toggleSubcribe,
  getAllSubscribers,
} = require("../../controllers/subscribeScontroller");
const { requireUserSignIn } = require("../../middleware/auth");
const router = express.Router();

// subscribe to a channel
// /post request
// /api/subscribe/toggle
router.post("/toggle", requireUserSignIn, toggleSubcribe);

// get all subscribers
// /api/subscribe/all/{videoId}
// get request
router.get("/all/:id", getAllSubscribers);

// get all subscription videos
router.get("/videos", requireUserSignIn, async (req, res) => {
  const _user = req.user;
  try {
    console.log("the users subscribed videos");
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
});

module.exports = router;
