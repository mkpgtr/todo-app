const asyncWrapper = require("../middlewares/asyncWrapper");

const getCurrentUser = asyncWrapper(
   
    async (req, res) => {
        console.log('tabadtod')
        res.status(200).json({ user: req.user });
    }
  
)

module.exports = {
    getCurrentUser
};