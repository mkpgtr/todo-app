const mongoose = require('mongoose');

/*
schema for the todo model 

(restart the server after making changes to this file to avoid unexpected errors)
*/

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        unique: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    
    }
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;