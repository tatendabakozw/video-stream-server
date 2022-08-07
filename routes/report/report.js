const express = require("express");
const router = express.Router();
const { requireUserSignIn } = require("../../middleware/auth");
const Report = require("../../models/Report");

// create a report
// post request
// /api/post/report/create
router.post("/create", requireUserSignIn, async (req, res) => {
  const _user = req.user;
  if (!_user) {
    return res.status(403).send({ message: "Please sign in" });
  }
  try {
    const { user, video, report } = req.body;

    if (!report) {
      return res.status(400).send({ message: "Please send a report" });
    }

    const newReport = new Report({
      user: user,
      video: video,
      report: report,
    });

    const saved_report = await newReport.save();
    return res
      .status(200)
      .send({ message: "Report sent. Thank You", report: saved_report });
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
});

module.exports = router;
