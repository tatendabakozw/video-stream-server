const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// regular express to verify email format
const emailRegexp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

// register user
// post request
// /api/auth/register
exports.registerUser = async (req, res) => {
  //get filds from request
  const { email, password, agreed, role, username } = req.body;
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

  const user = await User.findOne({email: email})

  if(user){
    return res
    .status(401)
    .send({ message: "User already exists" });
  }

  try {
    const new_password = await bcrypt.hashSync(password, 12);
    //create new user object
    const newUser = new User({
      email: email,
      username: username,
      password: new_password,
      role: role,
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
exports.loginUser = async (req, res) => {
  // fields from request
  const { email, password } = req.body;

  const _user = await User.findOne({ email: email });

  // user not found
  if (!_user) {
    return res.status(404).send({ message: "Account does not exist!" });
  } else {
    if (!_user.emailApproved) {
      return res.status(403).send({ message: "Verify your email in database" });
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
