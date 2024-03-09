const mongoose = require('mongoose');

/*
schema for the todo model 

(restart the server after making changes to this file to avoid unexpected errors)
*/

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        unique: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;