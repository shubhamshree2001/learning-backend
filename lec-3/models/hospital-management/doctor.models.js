import mongoose from 'mongoose';

// tracks which hospital a doctor works at and for how long (from → to)
const hospitalWorkingHoursSchema = new mongoose.Schema({
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true,
    },
    fromTime: {
        type: String, // e.g. "09:00"
        required: true,
    },
    toTime: {
        type: String, // e.g. "17:00"
        required: true,
    },
});

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    salary: {
        type: Number,
        required: true,
    },
    qualification: {
        type: String,
        required: true,
    },
    specialization: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        default: 0,
        required: true,
    },
    // a doc can work in multiple hospitals, each with its own time range
    workingInHospital: {
        type: [hospitalWorkingHoursSchema],
        required: true,
        default: [],
    },
},{timestamps: true});

export const Doctor = mongoose.model('Doctor', doctorSchema);