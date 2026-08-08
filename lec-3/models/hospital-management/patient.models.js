import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE', 'OTHER'],
        required: true,
    },
    diagnoseWith: {
       type: String,
       required: true,
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    addmitedIn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true,
    },
},{timestamps: true});

export const Patient = mongoose.model('Patient', patientSchema);