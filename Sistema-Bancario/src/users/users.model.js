'use strict'

import mongoose from "mongoose";
const userSchema = mongoose.Schema({
    //nombre
    fullName: {
        type: String,
        required: [true, 'El nombre completo es requerido'],
        trim: true,
        maxLength: [100, 'El nombre no puede exceder 100 caracteres']
    },

    userName: {
        type: String,
        required: [true, 'El username es requerido'],
        unique: true,
        sparse: true,
        trim: true,
        maxLength: [150, 'El username no puede exceder 150 caracteres']
    },
    //numero de DPI
    dpi: {
        type: String,
        required: [true, 'El DPI es requerido'],
        unique: true,
        sparse: true,
        trim: true,
        maxLength: [15, 'El DPI no puede exceder 15 caracteres']
    },
    //direccion
    address: {
        type: String,
        trim: true,
        maxLength: [200, 'La dirección no puede exceder 200 caracteres']
    },
    //phone
    phone: {
        type: String,
        trim: true,
        maxLength: [50, 'El celular no puede exceder 50 caracteres']
    },
    //email
    email: {
        type: String,
        required: [true, 'El correo es requerido'],
        unique: true,
        //sparse: true,
        sparse: true,
        trim: true,
        lowercase: true,
        maxLength: [100, 'El correo no puede exceder 100 caracteres'],
        match: [/^\S+@\S+\.\S+$/, 'El formato del correo no es válido']
    },
    //contraseña
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minLength: [8, 'La contraseña debe tener al menos 8 caracteres']
    },
    //nombre del trabajo
    jobTitle: {
        type: String,
        trim: true,
        maxLength: [100, 'El nombre del trabajo no puede exceder 100 caracteres']
    },
    //ingresos mensuales
    monthlyIncome: {
        type: Number,
        min: [100.00, 'Los ingresos deben ser al menos 100.00'],
        default: 100.00
    },
    status: {
        type: String,
        enum: {
            values: ['activo', 'inactivo', 'bloqueado'],
            message: 'Estado no válido'
        },
        default: 'activo'
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: { createdAt: 'createdAd', updatedAt: false },
    versionKey: false
});

userSchema.index({ status: 1 });

export default mongoose.model('User', userSchema);

