const { CustomAPIError } = require('../errors/customError.js')
const errorHandlerMiddleware = (err, req, res, next) => {

  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message })
  }

  /*
  this is for handling the error thrown by mongoose when a unique field is duplicated
  */

  if(err.code === 11000){
    return res.status(400).json({msg : 'Duplicate value entered for unique field'})
  }

  

  
/*
catch all for other unhandled errors
*/
  return res.status(500).json({ msg: 'Something really went wrong, please try again' })
}

module.exports = errorHandlerMiddleware