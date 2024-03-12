const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    verificationDate : {
        type: Date
    
    },
    verificationTokenExpires: { type: Date }
   
},{
    timestamps:true
});



userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

  userSchema.pre('save', function(next) {
    const user = this;

    // Check if verification token and its expiry time are modified
    if (!user.isModified('verificationToken') && !user.isModified('verificationTimeExpires')) return next();

    // Set the expiry time to 5 minutes from the current time
    const now = new Date();
    const expiryTime = new Date(now.getTime() + 5 * 60 * 1000); // 30 seconds in milliseconds

    user.verificationTokenExpires = expiryTime;
    next();
});







userSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password);
    return isMatch;
  };

module.exports = mongoose.model('User', userSchema);