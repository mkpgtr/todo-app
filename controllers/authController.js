const { InvalidInputError, UnauthenticatedError, InvalidCredentialsError, CustomAPIError } = require("../errors/customError.js");
const asyncWrapper = require("../middlewares/asyncWrapper.js");
const userModel = require("../models/userModel.js");
const { registerType, loginType } = require("../types/authTypes.js");
const { StatusCodes } = require("http-status-codes");
const { createJWT } = require("../utils/jwt.js");
const {authenticator} = require('otplib');
const sendEmail = require("../utils/nodemailerConfig.js");

 const register = asyncWrapper(async(req,res)=>{

    const parsedRegisterPayload = registerType.safeParse(req.body);

    if(!parsedRegisterPayload.success){

        const errorMessage = parsedRegisterPayload.error.errors.map(obj=>obj.message);
        console.log(errorMessage)
        throw new InvalidInputError(errorMessage);
    }

    const verificationToken = authenticator.generate(process.env.OTP_SECRET);
   const newUser = await userModel.create({...parsedRegisterPayload.data,verificationToken});
// to trigger the post save hook
    
await sendEmail(parsedRegisterPayload.data.email,{
    subject : "Email Verification",
    text : `Your verification token is ${verificationToken}`,
    html : `<h1>Your verification token is ${verificationToken}</h1>`

});
    res.status(StatusCodes.OK).json({
        "message": "user created successfully",
    })
    })

 const login = asyncWrapper( async(req,res)=>{
    
    const parsedLoginPayload =   loginType.safeParse(req.body);
    if(!parsedLoginPayload.success){
        const errorMessage = parsedLoginPayload.error.errors.map(obj=>obj.message);
        throw new UnauthenticatedError(errorMessage);
    }
    

    const user = await userModel.findOne({email:parsedLoginPayload.data.email});
    if(!user){
        throw new InvalidCredentialsError("Invalid credentials");
    }

    // check if the password is correct

    const isMatch = await user.comparePassword(parsedLoginPayload.data.password);

    if(!isMatch){
        throw new InvalidCredentialsError("Invalid credentials");
    }

    const jwtToken = createJWT({userId : user._id, role: user.role});

    res.cookie('token', jwtToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === 'production',
    
    })
    res.status(StatusCodes.OK).json({
        message: "user logged in",
    })
            
        })

 const logout = asyncWrapper((req,res) => {
    // Add your code here
    // Implement the logout functionality

    // write code for logout 

    res.clearCookie('token');

    res.json({
        "message": "user logged out successfully",
    })

    
})

const verifyEmail = asyncWrapper(async(req,res)=>{
    // Add your code here
    // Implement the email verification functionality

    const {verificationToken,email} = req.body;

    const user = await userModel.findOne({email,verificationToken});

    


    if(!user){
        throw new InvalidCredentialsError("Invalid credentials");
    }

    if(user.isVerified){
        throw new CustomAPIError("Email already verified",StatusCodes.BAD_REQUEST);
    }

    const now = new Date();

if (user.verificationTokenExpires && now > user.verificationTokenExpires) {
    // Token has expired
    console.log('Verification token has expired.');

    

    
    await user.save()
    
    // Perform necessary actions, such as removing the token or prompting the user to regenerate it
    throw new InvalidCredentialsError("Token has expired")
} else {
    // Token is still valid
    user.verificationDate = now;
    user.isVerified = true;

    await user.save()

    res.status(StatusCodes.OK).json({
        message : "verfication successsful"
    })
    // Proceed with verification process
}


})


const regenerateToken = asyncWrapper(async(req,res)=>{
    // Add your code here
    // Implement the email verification functionality

    const {email} = req.body;

    const user = await userModel.findOne({
        email
    })



    if(!user){
        throw new InvalidCredentialsError("Invalid credentials");
    }

    if(user.isVerified){
        throw new CustomAPIError("Email already verified",StatusCodes.BAD_REQUEST);
    }



   
    

    const now = new Date();
    const expiryTime = new Date(now.getTime() + 1 * 30 * 1000); // 30 seconds in milliseconds

    const newVerificationToken = authenticator.generate(process.env.OTP_SECRET);
    user.verificationToken = newVerificationToken;
    user.verificationTokenExpires = expiryTime;

    console.log(authenticator.generate(process.env.OTP_SECRET))

    await user.save()
    await sendEmail(req.body.email,{
        subject : "Email Verification",
        text : `Your verification token is ${newVerificationToken}`,
        html : `<h1>Your verification token is ${newVerificationToken}</h1>`
    
    });

    res.status(StatusCodes.OK).json({
        message : "verification mail resent successfully"
    })
});

module.exports = {
    register,
    login,
    logout,
    verifyEmail,
    regenerateToken
}