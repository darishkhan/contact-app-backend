const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");

//jwt signature
const JWT_SECRET = ""; 

// -------------------------xxxxxxxxxxxxxxxxx----------------------------------------
// Route 1: Create a User using POST "/api/auth/createuser".  NoLOGIN required.
router.post(
  "/createuser",
  [
    //these are all the checks that I have added
    body("name", "Name must have at least 3 characters.").isLength({ min: 3 }),
    body("email", "Enter a valid email.").isEmail(),
    body("password", "Password must be at least 8 characters.").isLength({
      min: 5,
    }),
  ],
  async (req, res) => { 

    let success=false;

    const errors = validationResult(req); 
 
    //if there are errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    //if this is error free
    //currently the unique email feature is working automatically
    //but if you face problem in the  future, use findOne command of mongoDB
    try {
      //we will try to store passwords in a secure hashed way
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      //creating the user and pushing in database
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      //now we will create a jwt toke to passs to the client
      const data = {
        user: {
          id: user.id,
        }, 
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      return res.json({ success, authtoken });
    } catch (error) { 
      console.log(error);
      res.json({ success, message: "Please enter a unique email" });
    }

    //if the email exists.
  }
);

// -----------------------------------xxxxxxxxxxxxxxxxxx--------------------------
// Route 2: Create a User using POST "/api/auth/login". No Login required.
router.post(
  "/login",
  [
    //these are all the checks that I have added
    body("email", "Enter a valid email.").isEmail(),
    body("password", "Password cannot be empty").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    //if there are errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    //if this is error free then
    try {
      let success = false;
      const user = await User.findOne({ email });
      //if the user does not exist in the database.
      if (!user) {
        return res.status(400).json({ success, error: "Incorrect credentials!" });
      }

      const match = await bcrypt.compare(password, user.password);
      //if the password doesn't match
      if (!match) {
        return res.status(400).json({ success, error: "Incorrect credentials!" });
      }

      //other wise if password matches I will return the JWT token.
      const data = {
        user: {
          id: user.id,
        },
      };
      success=true;
      const authtoken = jwt.sign(data, JWT_SECRET);
      return res.json({success, authtoken });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  }
);

// -------------------------------xxxxxxxxxxxxxxxxxxxxxxxx--------------------------
// Route 3 : for getting user from JWT token using POST: '/auth/api/getuser' Login required.
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userid = req.user.id;
    const user = await User.findById(userid).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error!");
  }
});

module.exports = router;
