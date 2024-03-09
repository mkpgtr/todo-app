class CustomAPIError extends Error {
    constructor(message, statusCode) {
      super(message)
      this.statusCode = statusCode
    }
  }
  


  class InvalidInputError extends CustomAPIError {
    constructor(message) {
      super(message, 400)
    }
  }

  

 
  
  module.exports = {CustomAPIError,InvalidInputError }