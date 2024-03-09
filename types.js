const zod = require('zod');
const mongoose = require('mongoose');
const isValidMongoId = (value) => {
    return mongoose.Types.ObjectId.isValid(value);
};


const createTodo = zod.object({
    title: zod.string(),
    description: zod.string()
});

const updateTodo = zod.object({
    id : zod.string().refine(value =>{
        console.log(value)
        return isValidMongoId(value)
    }, { message: "title must be atleast 8 characters long" }),
    title : zod.string().min(8, { message: "title must be atleast 8 characters long" }).optional(),
    description : zod.string().min(16, { message: "title must be atleast 16 characters long" }).optional(),
}).refine(data => data.title !== undefined || data.description !== undefined, {
    message: "Either 'title' or 'description' must be provided in an update",
});

const markCompleted = zod.object({
    id : zod.string().refine(value =>{
        return isValidMongoId(value)
}, { message: "invalid mongodb id " }),
    completed : zod.boolean()
});

const deleteTodo = zod.object({
    id : zod.string().refine(value =>{
        return isValidMongoId(value)
}, { message: "invalid mongodb id " }),
});



module.exports = {
    createTodo,
    updateTodo,
    markCompleted,
    deleteTodo
}