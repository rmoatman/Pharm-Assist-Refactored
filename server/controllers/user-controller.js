const { User } = require('../models');
const { Medicine } = require('../models');
const { signToken } = require('../utils/auth');
const jwt = require('jsonwebtoken');

// In production the client is served over HTTPS from the same origin, so the
// auth cookie must be Secure + SameSite=None. For local http://localhost dev,
// those flags prevent the browser from storing the cookie, so relax them.
const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
};

module.exports = {
  async getSingleUser({ user = null, params }, res) {
    const foundUser = await User.findOne({
      $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
    });

    if (!foundUser) {
      return res.status(400).json({ message: 'Cannot find a user with this id!' });
    }

    res.json(foundUser);
  },

//register
  async register({ body }, res) {
    const existingUser = await User.findOne({ email: body.email });
    
    if (existingUser)
      return res.status(400).json({
        errorMessage: "There is an existing account associated with this email address."
      });

    const newUser = await User.create(body);

    if (!newUser) {
      return res.status(400).json({ message: 'Something is wrong!' });
    }
    const token = signToken(newUser);
    // res.json({ token, newUser });
    res
      .cookie("token", token, cookieOptions)
      .send();
  },

//login
  async login({ body }, res) {
    const user = await User.findOne({ email: body.email });

    if(!user) {
      return res.status(410).json({ errorMessage: "Incorrect username or password" });
    }
    
    const correctPw = await user.isCorrectPassword(body.password);

    if (!correctPw) {
      return res.status(401).json({ message: "Incorrect username or password" });
    }

    const token = signToken(user);

    res
    .cookie("token", token, cookieOptions)
    .send();
  },
  
//logout
  logout(req, res) {
    res.cookie("token", "", {
      ...cookieOptions,
      expires: new Date(0),
    }).send();
  },

  async loggedin(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) return res.json(false);

    jwt.verify(token, 'mysecretsshhhhh');

    res.send(true);
  } catch (err) {
    res.json(false);
  }
  },

  async saveMed({ user, body }, res) {
    console.log(user);
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { medList: body } },
        { new: true, runValidators: true }
      );
      return res.json(updatedUser);
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }
  },

  async deleteMed({ user, query }, res) {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $pull: { medList: { title: query.title } } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Couldn't find user with this id!" });
    }
    return res.json(updatedUser);
  },
}
