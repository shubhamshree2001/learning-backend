import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    complete: {
        type: Boolean,
        default: false,
    },
    // this is created by so that I know who created the todo and 
    // so we will learn how to link this to the user model
    //mongoose.Schema.Types.ObjectId, this tells we are going to refere some model of moongose

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // the model which I reffereing to 
        required: true,
    },

    subTodos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubTodo',
    }], // this is an array of sub todos
}, {timestamps: true});

export const Todo = mongoose.model('Todo', todoSchema);