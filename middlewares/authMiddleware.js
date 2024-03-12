const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors/customError');

const authenticateUser = (req, res, next) => {
    // get the cookie coming from the request
    const token = req.cookies.token;
    if(!token){
        throw new UnauthenticatedError('You are not authorized')
    }


    try {
        
        const {userId,role} = jwt.verify(token, process.env.JWT_SECRET)
        req.user = {userId,role}
        next()
    } catch (error) {
        throw new UnauthenticatedError('You are not authorized');
    }


    
}



module.exports = authenticateUser