const express = require('express');
const dotenv = require('dotenv');
const z = require('zod');
const { createTodo, updateTodo, markCompleted, deleteTodo } = require('./types.js');
const asyncWrapper = require('./middlewares/asyncWrapper.js');
const errorHandlerMiddleware = require('./middlewares/errorHandler.js');
const { CustomAPIError, InvalidInputError } = require('./errors/customError');
const {StatusCodes}  = require('http-status-codes');
const connectDB = require('./db/connect.js');
const Todo = require('./models/todoModel.js');
const { default: mongoose } = require('mongoose');
dotenv.config();
const app = express();

app.use(express.json());

app.get('/todos',asyncWrapper(async(req,res)=>{
    const todos = await Todo.find({});
    const totalTodos = todos.length;
    res.json({data : todos, total : totalTodos});
}))

app.post('/todos',
asyncWrapper(async(req,res)=>{
    const parsedTodo= createTodo.safeParse(req.body);
    
    console.log(mongoose.models);
    
    if(!parsedTodo.success){
        const errorMessage = parsedTodo.error.errors[0].message
        console.log(parsedTodo.error);
        throw new InvalidInputError(errorMessage);
      
    }
    const todo = await Todo.create(parsedTodo.data);
    res.json({message:'Todo created successfully',data : todo});
}))

app.put('/completed',asyncWrapper(async(req,res)=>{
    console.log(req.body)
    const parsedMarkCompleted = markCompleted.safeParse(req.body);
    if(!parsedMarkCompleted.success){
        const errorMessage = parsedMarkCompleted.error.errors[0].message;

        throw new InvalidInputError(errorMessage);
    }

    const todo = await Todo.findByIdAndUpdate(parsedMarkCompleted.data.id,{completed:parsedMarkCompleted.data.completed});
    res.json({message:'Todo marked  successfully',data :todo});
}))

app.put('/todos/:id',async(req,res)=>{

    const {id} = req.params;

    const parsedUpdatePayload = updateTodo.safeParse({...req.body,id});
    
    if(!parsedUpdatePayload.success){
        const errorMessage = parsedUpdatePayload.error.errors[0].message;
        throw new InvalidInputError(errorMessage);
    }

    const todo = await Todo.findByIdAndUpdate(id,parsedUpdatePayload.data,{
        new:true,
        runValidators:true
    
    });


    res.json({message:'Todo updated successfully',data : todo});
})

app.delete('/todos/:id',
asyncWrapper(
   async (req,res)=>{
        console.log(req.params.id);
        const parsedDeleteTodoPayload = deleteTodo.safeParse(req.params);
       
        if(!parsedDeleteTodoPayload.success){
            const errorMessage = parsedDeleteTodoPayload.error.errors[0].message;
            throw new InvalidInputError(errorMessage);
        }

        const todo =await Todo.findByIdAndDelete(parsedDeleteTodoPayload.data.id);
        if(!todo){
            throw new CustomAPIError('Todo not found',StatusCodes.NOT_FOUND);
        }

        await Todo.findByIdAndDelete(parsedDeleteTodoPayload.data.id);
        res.json({message:'Data deleted'});
    }
))

app.delete('/deleteAll',asyncWrapper(async(req,res)=>{
    await Todo.deleteMany({});
    res.json({message:'All todos deleted'});
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