const express = require("express");
const Message = require("../../models/Message");
const User = require("../../models/User");
const router = express.Router();

// send a message
// post request
// /api/post/chat/send
router.post("/send", async (req, res) => {
  const { sender, receiver, message } = req.body;
  try {

    const newMessage = new Message({
      message: {
        text: message,
      },
      users: [
        {
          user: sender,
        },
        {
          user: receiver,
        },
      ],
      sender: sender,
    });

    return res.status(200).send({ message: newMessage });
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
});

module.exports = router;
