const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// regular express to verify email format
const emailRegexp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

// register user
// post request
// /api/auth/register
exports.adminRegister = async (req, res) => {
  //get filds from request
  const { email, password, agreed, username } = req.body;
  //validate forms
  if (!agreed) {
    return res
      .status(401)
      .send({ message: "Your have to agree to our terms and conditions" });
  } else if (!emailRegexp.test(email)) {
    return res.status(401).send({ message: "Please enter a valid email" });
  } else if (password.length < 6) {
    return res.status(401).send({ message: "Invalid password" });
  }

  const user = await User.findOne({ email: email });

  if (user.role !== "admin") {
    return res.status(500).send({ message: "Admins Only" });
  }

  if (user) {
    return res.status(401).send({ message: "User already exists" });
  }

  try {
    const new_password = await bcrypt.hashSync(password, 12);
    //create new user object
    const newUser = new User({
      email: email,
      username: username,
      password: new_password,
      role: "admin",
      terms_agreed: agreed,
    });

    //save in database
    await newUser.save();
    return res.status(200).send("Account Created");
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }
};

// login user
// post request
// api/auth/login
exports.adminLogin = async (req, res) => {
  // fields from request
  const { email, password } = req.body;

  const _user = await User.findOne({ email: email.trim() });

  // user not found
  if (!_user) {
    return res.status(404).send({ message: "Account does not exist!" });
  } else {
    if (!_user.role === 'admin') {
      return res.status(403).send({ message: "Only admins allowed" });
    }

    // decrypt password value from database
    const password_correct = await bcrypt.compare(password, _user.password);
    if (password_correct) {
      const token = await jwt.sign(
        {
          name: _user.username,
          email: _user.email,
          _id: _user._id,
          role: _user.role,
          emailVerified: _user.emailApproved,
          photoURL: _user.photoURL,
          //@ts-ignore
        },
        process.env.JWT_SECRET
      );
      if (token) {
        const user = {
          name: _user.username,
          email: _user.email,
          _id: _user._id,
          role: _user.role,
          emailVerified: _user.emailApproved,
          token: token,
          photoURL: _user.photoURL,
        };

        return res.send({ ...user, message: "logged in sucessfully" });
      } else {
        return res
          .status(422)
          .send({ message: "Failed to login, Wrong details!" });
      }
    } else {
      return res.status(400).send({ message: "Wrong login details" });
    }
  }
};

// get all user and channels
// get request
// /api/admin/users/all
exports.getAllUsers = async (req,res) =>{
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
    if (req.query.channel) {
      query.push({
        //@ts-ignore
        $match: {
          category: req.query.category,
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
    let total = await User.countDocuments(query);
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


    let users = await User.aggregate(query);

    return res.status(200).send({
      message: "Users fetched sucessfully",
      length: users.length,
      meta: {
        total: total,
        currentPage: page,
        perPage: perPage,
        totalPages: Math.ceil(total / perPage),
      },
      users: users,
    });
  } catch (error) {
    return res.status(500).send({ message: `${error}` });
  }

}
