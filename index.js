const express = require('express');
const dotenv = require('dotenv');
const z = require('zod');
const { createTodo, updateTodo, markCompleted, deleteTodo } = require('./types/todoTypes.js');
const asyncWrapper = require('./middlewares/asyncWrapper.js');
const errorHandlerMiddleware = require('./middlewares/errorHandler.js');
const { CustomAPIError, InvalidInputError } = require('./errors/customError');
const {StatusCodes}  = require('http-status-codes');
const connectDB = require('./db/connect.js');
const Todo = require('./models/todoModel.js');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authenticateUser = require('./middlewares/authMiddleware.js');
const verifyEmailMiddleware = require('./middlewares/verifyEmailMiddleware.js');
dotenv.config();
const app = express();





app.use( morgan('tiny'))
app.use(cookieParser());
app.use(express.json());
app.use(express.static('./public'));




app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)


app.get('/api/todos',authenticateUser,asyncWrapper(async(req,res)=>{

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    console.log('limit n page',limit,page)
    const skip = (page - 1) * limit;
    const todos = await Todo.find({createdBy : req.user.userId}).skip(skip).limit(limit);
    const totalTodos = await Todo.countDocuments({});
    console.log(totalTodos)
    const totalPages = Math.ceil(totalTodos/limit); 
    res.status(StatusCodes.OK).json({ data: todos, totalDocuments: totalTodos, totalPages:totalPages, page : page });
}))

app.post('/api/todos',authenticateUser, verifyEmailMiddleware,
asyncWrapper(async(req,res)=>{
    req.body.createdBy = req.user.userId;
    const parsedTodo= createTodo.safeParse(req.body);
    
    
    if(!parsedTodo.success){
        const errorMessage = parsedTodo.error.errors[0].message
        console.log(parsedTodo.error);
        throw new InvalidInputError(errorMessage);
      
    }
    console.log(parsedTodo.data)
    const todo = await Todo.create(parsedTodo.data);
    res.status(StatusCodes.CREATED).json({message:'Todo created successfully',data : todo});
}))

app.put('/api/completed',authenticateUser,asyncWrapper(async(req,res)=>{

    
    console.log(req.body)
    const parsedMarkCompleted = markCompleted.safeParse(req.body);
    if(!parsedMarkCompleted.success){
        const errorMessage = parsedMarkCompleted.error.errors[0].message;

        throw new InvalidInputError(errorMessage);
    }

    const isOwnedBySenderOrAdmin = await Todo.findOne({_id:parsedMarkCompleted.data.id,createdBy:req.user.userId})
    || req.user.role === 'admin';

    if(!isOwnedBySenderOrAdmin){
        throw new CustomAPIError('You are not authorized to mark this todo',StatusCodes.UNAUTHORIZED);
    }

    const todo = await Todo.findByIdAndUpdate(parsedMarkCompleted.data.id,{completed:parsedMarkCompleted.data.completed});
    res.status(StatusCodes.OK).json({message:'Todo marked  successfully',data :todo});
}))

app.put('/api/todos/:id',authenticateUser,
asyncWrapper(async(req,res)=>{

    const {id} = req.params;

    const parsedUpdatePayload = updateTodo.safeParse({...req.body,id});

    const isOwnedBySenderOrAdmin = await Todo.findOne({_id:parsedUpdatePayload.data.id,createdBy:req.user.userId})
    || req.user.role === 'admin';

    if(!isOwnedBySenderOrAdmin){
        throw new CustomAPIError('You are not authorized to mark this todo',StatusCodes.UNAUTHORIZED);
    }

    const todoExists = await Todo.findById(id);

    if(!todoExists){
        throw new CustomAPIError('Todo not found',StatusCodes.NOT_FOUND);
    }
    
    if(!parsedUpdatePayload.success){
        const errorMessage = parsedUpdatePayload.error.errors[0].message;
        throw new InvalidInputError(errorMessage);
    }

    const todo = await Todo.findByIdAndUpdate(id,parsedUpdatePayload.data,{
        new:true,
        runValidators:true
    
    });


    res.status(StatusCodes.OK).json({message:'Todo updated successfully',data : todo});
}))

app.delete('/api/todos/:id',
authenticateUser,
verifyEmailMiddleware,
asyncWrapper(
   async (req,res)=>{
        console.log(req.params.id);
        const parsedDeleteTodoPayload = deleteTodo.safeParse(req.params);
       
        if(!parsedDeleteTodoPayload.success){
            const errorMessage = parsedDeleteTodoPayload.error.errors[0].message;
            throw new InvalidInputError(errorMessage);
        }

        const todoExists = await Todo.findById(parsedDeleteTodoPayload.data.id);

        if(!todoExists){
            throw new CustomAPIError('Invalid Request',StatusCodes.BAD_REQUEST);
        }
        const todo =await Todo.findOneAndDelete({createdBy:req.user.userId});

        // remove the todo using the todo above



        
        res.status(StatusCodes.OK).json({message:'Data deleted'});
    }
))

app.delete('/api/deleteAll',asyncWrapper(async(req,res)=>{
    await Todo.deleteMany({});
    res.status(StatusCodes.OK).json({message:'All todos deleted'});
}))

app.use(errorHandlerMiddleware)

const PORT  = process.env.PORT || 4000;

const start = async () => {
    try {
      await connectDB(process.env.MONGO_URL);
      app.listen(PORT, () =>
        console.log(`Server is listening on port ${PORT}...`)
      );
    } catch (error) {
      console.log(error);
    }
  };
  
  start();