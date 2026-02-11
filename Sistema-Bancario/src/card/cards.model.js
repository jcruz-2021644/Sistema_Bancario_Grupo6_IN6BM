'use strict'

import mongoose from "mongoose";

const cardSchema  = mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'La cuenta es requerida']
    },
    cardNumber: {
        type: String,
        required: [true, 'El número de tarjeta es requerido'],
        unique: true,
        trim: true,
        maxLength: [16, 'El número de tarjeta debe tener 16 dígitos']
    },
    cardType: {
        type: String,
        required: [true, 'El tipo de tarjeta es requerido'],
        enum: {
            values: ['debito', 'credito'],
            message: 'Tipo de tarjeta no válido'
        }
    },
    cvv: {
        type: String,
        required: [true, 'El CVV es requerido'],
        maxLength: [4, 'El CVV debe tener máximo 4 dígitos']
    },
    //fecha de emision
    issueDate: {
        type: Date,
        default: Date.now
    },
    //fecha de vencimiento
    expirationDate: {
        type: Date,
        required: [true, 'La fecha de vencimiento es requerida']
    },
    //limite de credito (solo para tarjetas de credito)
    creditLimit: {
        type: Number,
        min: [0, 'El límite debe ser positivo']
    },
    //saldo disponible (solo para tarjetas de credito)
    availableBalance: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: {
            values: ['activa', 'bloqueada', 'vencida', 'cancelada'],
            message: 'Estado no válido'
        },
        default: 'activa'
    },
    pin: {
        type: String,
        required: [true, 'El PIN es requerido']
    }
}, {
    timestamps: true,
    versionKey: false
});

cardSchema.index({ accountId: 1 });
cardSchema.index({ status: 1 });

export default mongoose.model('Card', cardSchema);
