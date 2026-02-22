'use strict'

import mongoose from "mongoose";

const accountSchema = mongoose.Schema({
    //numero de cuenta
    accountNumber: {
        type: String,
        required: [true, 'El número de cuenta es requerido'],
        unique: true,
        trim: true,
        maxLength: [100, 'El número de cuenta no puede exceder 100 caracteres']
    },
    //tipo de cuenta
    accountType: {
        type: String,
        required: [true, 'El tipo de cuenta es requerido'],
        enum: {
            values: ['ahorro', 'corriente', 'nomina'],
            message: 'Tipo de cuenta no válido'
        }
    },
    //saldo
    balance: {
        type: Number,
        default: 0.00,
        min: [0, 'El saldo no puede ser negativo']
    },
    //fecha de apertura
    openingDate: {
        type: Date,
        required: [true, 'La fecha de apertura es requerida'],
        default: Date.now
    },
    //estado de la cuenta
    status: {
        type: String,
        enum: {
            values: ['activa', 'inactiva', 'bloqueada'],
            message: 'Estado no válido'
        },
        default: 'activa'
    },
    //limite_retiro_diario
    dailyWithdrawalLimit: {
        type: Number,
        min: [0, 'El límite debe ser positivo']
    },
    //interes_anual
    annualInterestRate: {
        type: Number,
        min: [0, 'El interés debe ser positivo'],
        max: [100, 'El interés no puede exceder 100%']
    },
    currencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Currency',
        required: [true, 'La moneda es requerida']
    },
    userId: {
        type: String,
        required: [true, 'El usuario es requerido']
    }
}, {
    timestamps: true,
    versionKey: false
});

accountSchema.index({ userId: 1 });
accountSchema.index({ status: 1 });
accountSchema.index({ accountType: 1 });

export default mongoose.model('Account', accountSchema);