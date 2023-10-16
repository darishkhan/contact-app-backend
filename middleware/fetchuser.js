const jwt = require('');
const JWT_SECRET = '';

const fetchuser = (req, res, next) =>{
    //Get the user from the JWT token and then forward it
    const token = req.header('auth-token');
    if(!token)
    {
        res.status(501).send({error: "Please authenticate using a valid JWT token"});
    }
    try {
        const data = jwt.verify(token, JWT_SECRET); 
        req.user=data.user;
        next();
    } catch (error) {
        res.status(501).send({error: "Please authenticate using a valid JWT token"});        
    }
}

module.exports = fetchuser;