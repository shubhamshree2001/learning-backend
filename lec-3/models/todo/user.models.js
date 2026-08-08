import mongoose from 'mongoose';

// now create schema using it 

const userSchema = new mongoose.Schema(
    {
        // username: String,
        // email: String,
        // password: String,
        // isActive: Boolean,
        // the above is also correct but the standard way is to use type of data type 
        // so we will use type of data type 
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: [true, "password is required"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    }, { timestamps: true } // this is for createdAt and updatedAt, mongoose will automatically add these fields to the schema
);

// now we need to to export this schema 
// we will export this schema to mongodb
// first we will connect to mongodb

// but now we are learning  data modelling how to create schema 

//-- to export the schema 

// it takes two argument , 
//which model I need to make  -- name of the model
// and what base I need to make this model on -- model is based upon a schema
export const User = mongoose.model('User', userSchema);

// Standardizationndone by mongoose 
// I created the model name as User but in mongodb it will be appear as users
// because mongodb does it automatically for us and it will be in lowercase and plural form


