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

  class UnauthenticatedError extends CustomAPIError {
    constructor(message) {
      super(message, 401)
    }
  }

  class InvalidCredentialsError extends CustomAPIError {
    constructor(message) {
      super(message, 401)
    }
  }

  

 
  
  module.exports = {CustomAPIError,InvalidInputError,UnauthenticatedError,InvalidCredentialsError }