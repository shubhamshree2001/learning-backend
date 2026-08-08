import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },

    //Mongodb is a strong database we can keep product image in the database 
    // but it is not a good practice to keep it in the database because 
    // it will take up a lot of space and it will slow down the performance of the database.
    // data base are not made to store buffer kind of data like images or videos or audio.
    // so these are stored on our own server in a folder and the public url of that folder is used
    // cloudinary is a service that provides us with a public url for our images and videos and audio.
    //aws also we can use it for storing images and videos and audio.
    productImage:{
        type: String,
    },

    price :{
        type: Number,
        default: 0,
        required: true,
    },
    stock:{
        type: Number,
        default: 0,
        required: true,
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },

    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    

},{timestamps: true});

export const Product = mongoose.model('Product', productSchema);