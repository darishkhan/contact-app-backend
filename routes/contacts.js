const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const router = express.Router();
const Contacts = require("../models/Contacts");
const { body, validationResult } = require("express-validator");

// Route 1: fetch all contacts using GET:'/api/contacts/fetchallcontacts'. Login required.
router.get("/fetchallcontacts", fetchuser, async (req, res) => {
  try {
    const contacts = await Contacts.find({ user: req.user.id });
    res.json(contacts);
  } catch (error) { 
    res.status(500).send("Internal server error");
  }   
}); 

// Route 2: Add contacts using POST:'/api/contacts/addcontact'. Login required.
router.post(
  "/addcontact",
  fetchuser,
  [
    //doing checks
    body("phone", "Enter valid phone number")
      .isNumeric()
      .isLength({ min: 10, max: 12 }),
    body("email", "Enter a valid email").isEmail(),
  ],
  async (req, res) => {
    try {
      let success = false;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
      }
      //if all checks passed
      const { name, email, phone } = req.body;
      user = req.user;
      //make new contact\
      const eg = await Contacts.findOne({
        $or: [{ email: email }, { phone: phone }],
        user: user.id,
      });
      if (eg !== null) {
        let message = "Email or Phone number already exists.";
        return res.status(201).json({ success, message });
      }
      const contact = new Contacts({
        name,
        email,
        phone,
        // photo,
        // relation,
        user: req.user.id,
      });
      console.log(contact)
      //saved the contact
      const savedContact = await contact.save();
      success = true;
      return res.status(200).json({ success, savedContact });
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);

// Route 3: Edit contacts using PUT:'/api/contacts/editcontact'. Login required.
// will make this in the future.
router.put(
    "/editcontact",
    fetchuser,
    [
      //doing checks
      body("phone", "Enter valid phone number")
      .isNumeric()
      .isLength({ min: 10, max: 12 }),
      body("email", "Enter a valid email").isEmail(),

    ],
    async (req, res) => {
      try {
        const {_id, name, email, phone, relation, photo} = req.body;
          // load the contact to be edited
          let contact = await Contacts.findById(_id);
      
          //if the contact does not exists
          if (!contact) {
            return res.status(404).send("Not Found!");
          }
      
          //if user is editing someone else's saved contact
          if (req.user.id != contact.user.toString()) {
            return res.status(401).send("Not Allowed!");
          }
      
          // edited successfully
          contact = await Contacts.findByIdAndUpdate(_id, {name, email, phone} );
          return res.status(200).send("Contact has been edited.");
        

      } catch (error) {
        console.log("Not OK");
      }
    }
  );

// Route 4: Delete a contact using DELETE:'/api/contacts/deletecontact'. Login required.
router.delete("/deletecontact/:id", fetchuser, async (req, res) => {
  try {
    // load the contact to be deleted
    let contact = await Contacts.findById(req.params.id);

    //if the contact does not exists
    if (!contact) {
      return res.status(404).send("Not Found!");
    }

    //if user is deleting someone else's saved contact
    if (req.user.id != contact.user.toString()) {
      return res.status(401).send("Not Allowed!");
    }

    // delete successfully
    contact = await Contacts.findByIdAndDelete(req.params.id);
    return res.status(200).send("contact has been deleted.");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error!");
  }
});

module.exports = router;
