import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
},{timestamps: true});

export const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);