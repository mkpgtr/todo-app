## Todo App API built using 

- express & mongodb atlas (mongoose as ODM)
- zod (validation library)


### this app has the following features

- crud ops : 
    - get all todos, 
    - get single todo,
    - mark a todo as completed
    - create a todo update a todo, 
    - delete a todo
    - delete many todos

- error handling middleware
- validation layer built using zod


### Folder structure :

- models : mongoose schema for todoModel
- middlewares 
    - asyncwrapper.js : async wrapper (to avoid repeating try-catch blocks in every endpoint).
    - errorHandler.js : catch errors (general & specific).
- index.js : entry point for the app
- types.js : zod validations
- db 
    - connect.js : connect to mongodb atlas
- .env : environment variables
- errors : class definition for
        - CustomApiError
        - InvalidInputError

### important concepts :

- middleware chaining
- global catch for errors
- validation layer using zod
    - customizing validation with .refine() method (see : ./types.js)
- crud ops on mongodb
- schema creation with mongoose