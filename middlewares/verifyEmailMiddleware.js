const { InvalidCredentialsError, UnauthenticatedError } = require("../errors/customError");
const userModel = require("../models/userModel");
const asyncWrapper = require("./asyncWrapper");

const  verifyEmailMiddleware = 
asyncWrapper(async(req, res, next) => {
    // Add your code here
    // Implement the email verification functionality

    const user = req.user;

   

    if(!user){
        throw new InvalidCredentialsError("Invalid credentials");
    }

    const isVerified = await userModel.findOne({
        _id : user.userId,
    })

    if(!isVerified.isVerified){
        throw new UnauthenticatedError("Please verify your email first");
    }

    next()
})

module.exports = verifyEmailMiddleware
