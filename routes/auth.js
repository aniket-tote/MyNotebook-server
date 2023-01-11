const express = require("express");
const bcryptjs = require("bcryptjs");
const User = require("../models/User");
const fetchUser = require("../middleware/fetchUser");
var jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const JWT_SECRET = "thisisjwtsecret";

//Route 1:creating the user
router.post(
  "/signup",
  [
    //validate values
    body("name", "Enter a valid name (more than 3 character).").isLength({
      min: 3,
    }),
    body("email", "Enter a valid email.").isEmail(),
    body("password", "password is too short").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    //send bad request and error for invalid values
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      //check whether email already exist in database
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ success, error: "Email already exist" });
      }

      //hashing
      const salt = await bcryptjs.genSalt(10);
      const secPass = await bcryptjs.hash(req.body.password, salt);

      //create user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      //send response
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success, message: "Some error occured: Its not you its us!" });
    }
  }
);

//Route 2:authenticate a user
router.post(
  "/login",
  [
    //validate values
    body("email", "Enter a valid email.").isEmail(),
    body("password", "Password cannot be blank.").exists(),
  ],
  async (req, res) => {
    let success = false;
    //send bad request and error for invalid values
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //extract email and password from request body
    const { email, password } = req.body;

    try {
      //check for email
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success, error: "Email not registered yet!" });
      }
      const passwordCompare = await bcryptjs.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ success, error: "Incorrect Credentials." });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success, message: "Some error occured: Its not you its us!" });
    }
  }
);

//Route 3: Get user data using token authentication
router.get("/getuser", fetchUser, async (req, res) => {
  let success = false;
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    success = true;
    res.send({ success, user });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .send({ success, message: "Some error occured: Its not you its us!" });
  }
});

module.exports = router;
