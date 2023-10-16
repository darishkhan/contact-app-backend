const { default: mongoose } = require("mongoose");
const {Schema} = mongoose;
const ContactsSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    name:{
        type: String, 
        required: true
    },
    email:{
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required:true,
    },
    date:{
        type:Date,
        default: Date.now
    },
    // relation:{
    //     type: String,
    //     required: true,
    // },
    // photo:{
    //     type:String,
    //     default: "https://www.pngitem.com/middle/TTxxmTm_profile-icon-contacts-hd-png-download/",
    // }
})

module.exports = mongoose.model('contacts', ContactsSchema);