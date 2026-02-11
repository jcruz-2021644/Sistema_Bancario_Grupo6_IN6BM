'use strict'

import mongoose from "mongoose";
const transactionSchema = mongoose.Schema({
    //cuenta de origen
    sourceAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },

    //cuenta de destino
    destinationAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    //tipo de transaccion
    transactionType: {
        type: String,
        required: [true, 'El tipo de transaccion es requerido'],
        enum: {
            values: ['deposito', 'retiro', 'transferencia', 'pago_servicio', 'pago_prestamo'],
            message: 'Tipo de transacción no válido'
        }
    },
    //monto
    amount: {
        type: Number,
        required: [true, 'El monto es requerido'],
        min: [0.01, 'El monto debe ser mayor a 0']
    },
    //id de moneda
    currencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Currency',
        required: [true, 'Currency is required']
    },
    //fecha de transaccion
    transactionDate: {
        type: Date,
        default: Date.now
    },
    //descripcion
    description: {
        type: String,
        trim: true,
        maxLength: [200, 'Descripcion no puede exceder 200 caracteres']
    },
    status: {
        type: String,
        enum: {
            values: ['exitosa', 'pendiente', 'rechazada', 'reversada'],
            message: 'Status no válido'
        },
        default: 'exitosa'
    },
    //balance antes de la transaccion
    previousBalance: {
        type: Number,
        default: 0
    },
    //balance despues de la transaccion
    newBalance: {
        type: Number,
        default: 0
    },
    //usuario que ejecuta la transaccion
    executedByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Executing user is required']
    }
}, {
    timestamps: true,
    versionKey: false
});

transactionSchema.index({ sourceAccountId: 1 });
transactionSchema.index({ destinationAccountId: 1 });
transactionSchema.index({ transactionType: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionDate: -1 });

export default mongoose.model('Transaction', transactionSchema);