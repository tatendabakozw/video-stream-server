const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");
const User = require("../models/User");

const generateChannelID = (otherID, myid) => {
  if (myid > otherID) {
    return otherID + myid;
  } else {
    return myid + otherID;
  }
};

exports.sendMessage = async (req, res) => {
  const { body, pictureUrl } = req.body;
  const _user = req.user; // the user sennding the message
  const { id } = req.params; //the user receiveing the message
  options = { upsert: true, new: true, setDefaultsOnInsert: true }; // options to update chatroom if it already exists

  try {
    const newMessage = new Message({
      body: body,
      pictureUrl: pictureUrl,
      sent_by: _user._id,
      sent_to: id,
      room_id: generateChannelID(id, _user._id),
    });

    // find if room already exists
    const room_exists = await ChatRoom.findOne({
      room_id: generateChannelID(id, _user._id),
    });

    // if chatroom doesnt exists add a chatroom to user doc
    if (!room_exists) {
      await User.findOneAndUpdate(
        { _id: _user._id },
        { $push: { chatrooms: generateChannelID(id, _user._id) } }
      );
      await User.findOneAndUpdate(
        { _id: id },
        { $push: { chatrooms: generateChannelID(id, _user._id) } }
      );
    }

    // create chat room if it doesnt exists but edit if it already exists
    await ChatRoom.findOneAndUpdate(
      { room_id: generateChannelID(id, _user._id) },
      {
        last_message: body,
        last_sent_by: id,
        last_sent_to: _user._id,
        createdAt: new Date(),
      },
      options
    );

    // add user to chat room array
    await ChatRoom.findOneAndUpdate(
      { room_id: generateChannelID(id, _user._id) },
      { users: [_user._id, id] }
    );

    // save message
    const message = await newMessage.save();

    // emit socket for real time communication
    global.io.sockets.emit("message", message);
    return res.status(200).json({ message: "Message send", message: message });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// get all chat messages
// get request
// /api/chat/messages
exports.getAllChatMessages = async (req, res) => {
  try {
    // id1 for sender
    // id2 for receiver
    const { id, id2 } = req.params;
    try {
      const messages = await Message.find({
        room_id: generateChannelID(id, id2),
      });
      return res.status(200).send({ messages: messages });
    } catch (error) {
      return res.status(500).send({ message: `${error}` });
    }
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
};

// get all user chatrooms
// get request
// /api/chat/rooms
exports.getAllChatRooms = async (req, res) => {
  const _user = req.user; // current logged in user
  try {
    const user_doc = await User.findOne({ _id: _user._id });
    const all_chats_rooms = await ChatRoom.find({
      room_id: { $in: user_doc.chatrooms },
    });
    const chats = [];
    let user_info;
    let sent_by_you;

    for (let i = 0; i < all_chats_rooms.length; i++) {
      if (all_chats_rooms[i].last_sent_by === _user._id) {
        user_info = await User.findOne({
          _id: all_chats_rooms[i].last_sent_to,
        });
        sent_by_you = true;
        // console.log(user_info)
      } else if (all_chats_rooms[i].last_sent_to === _user._id) {
        user_info = await User.findOne({
          _id: all_chats_rooms[i].last_sent_by,
        });
        sent_by_you = false;
        // console.log(user_info)
      } else {
        var result = all_chats_rooms[i].users.find(function (e) {
          return e != _user._id;
        });
        user_info = await User.findOne({ _id: result });
        sent_by_you = "initial";
        // console.log(user_info)
      }
      const new_chat = {
        last_message: all_chats_rooms[i].last_message,
        createdAt: all_chats_rooms[i].createdAt,
        room_id: all_chats_rooms[i].room_id,
        _id: all_chats_rooms[i]._id,
        message_username: user_info.username,
        user_verified: user_info.verified,
        user_picture: user_info.photoURL,
        user: all_chats_rooms[i].last_sent_by,
        chat_users: all_chats_rooms[i].users,
        user_id: user_info._id,
        sent_by_you: sent_by_you,
      };
      chats.push(new_chat);
    }

    res.status(200).send({ chats: chats });
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
};
