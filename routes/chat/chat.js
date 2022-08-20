const express = require("express");
const { sendMessage, getAllChatMessages, getAllChatRooms } = require("../../controllers/chatController");
const { requireUserSignIn } = require("../../middleware/auth");
const router = express.Router();

// send a message
// post request
// /api/chat/send/{receiverID}
router.post("/send/:id",requireUserSignIn, sendMessage);

// get all chat messages
// get request
// /api/chat/messages
router.get('/messages/:id/:id2', requireUserSignIn,getAllChatMessages)

// get all chat rooms
// get request
// /api/chat/rooms
router.get('/rooms', requireUserSignIn, getAllChatRooms)

module.exports = router;
