const connectToMongo = require("./db");
const express = require('express')
var cors = require('cors')

connectToMongo();
var app = express()
app.use(cors())  
 
const port = 5000;

app.use(express.json());
//Available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));

 
app.listen(port,  () => {
  console.log(`Example app listening on port ${port}`)
})