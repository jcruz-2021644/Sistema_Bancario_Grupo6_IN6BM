import Transaction from './transaction.model.js';

//agregar
export const createTransaction = async (req, res) => {
    try {

        const transactionData = req.body;

        /* if(req.file){
             const extension = req.file.path.split('.').pop();
             const filename = req.file.filename;
             const relativePath = filename.substring(filename.indexOf('fields/'));
         
             fieldData.photo = `$(relativePath).$(extension)`;
         }else{
             fieldData.photo = 'fields/kinal_sports_nyvxo5';
         }
 */
        const transaction = new Transaction(transactionData);
        await transaction.save();

        res.status(201).json({
            success: true,
            message: 'Transacción creada exitosamente',
            data: transaction
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la transacción',
            error: error.message
        })
    }
}

export const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'exitosa' } = req.query;
        const filter = { status };
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const transactions = await Transaction.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);
        const total = await Transaction.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: transactions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las transacciones',    
            error: error.message
        })
    }

}