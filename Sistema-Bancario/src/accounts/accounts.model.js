'use strict'

import mongoose from 'mongoose';

const accountSchema = mongoose.Schema({
    //numero de cuenta
    accountNumber: {
        type: String,
        required: [true, 'El numero de cuenta es requerido'],
        unique: true,
        trim: true,
        match: [/^[A-Z]{3}-\d{3}-\d{4}$/, 'El numero de cuenta debe tener formato ABC-000-0000']
    },
    //tipo de cuenta
    accountType: {
        type: String,
        required: [true, 'El tipo de cuenta es requerido'],
        enum: {
            values: ['ahorro', 'corriente', 'nomina'],
            message: 'Tipo de cuenta no valido'
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
            message: 'Estado no valido'
        },
        default: 'activa'
    },
    //limite_retiro_diario
    dailyWithdrawalLimit: {
        type: Number,
        min: [0, 'El limite debe ser positivo']
    },
    //interes_anual
    annualInterestRate: {
        type: Number,
        min: [0, 'El interes debe ser positivo'],
        max: [100, 'El interes no puede exceder 100%']
    },
    currencyCode: {
        type: String,
        required: [true, 'El codigo de moneda es requerido'],
        uppercase: true,
        trim: true,
        match: [/^[A-Z]{3}$/, 'El codigo de moneda debe tener formato ABC']
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
