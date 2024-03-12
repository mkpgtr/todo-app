const zod = require('zod');

const registerType = zod.object({
    email: zod.string().email({
        message: "Invalid email format"
    }),
    password: zod.string().min(8,{
        message: "Password must be atleast 8 characters long"
    
    }),
    name: zod.string().min(6,{
        message: "Name must be atleast 6 characters long"
    
    }),
});

const loginType = zod.object({
    email: zod.string().email(),
    password: zod.string().min(8),
});



module.exports = {
    registerType,
    loginType
}

