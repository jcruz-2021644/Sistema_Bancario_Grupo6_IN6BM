import AccountStatement from './accountStatements.model.js';

//agregar
export const createAccountStatement = async (req, res) => {
    try {

        const accountStatementData = req.body;

        /* if(req.file){
             const extension = req.file.path.split('.').pop();
             const filename = req.file.filename;
             const relativePath = filename.substring(filename.indexOf('fields/'));
         
             fieldData.photo = `$(relativePath).$(extension)`;
         }else{
             fieldData.photo = 'fields/kinal_sports_nyvxo5';
         }
 */
        const accountStatement = new AccountStatement(accountStatementData);
        await accountStatement.save();

        res.status(201).json({
            success: true,
            message: 'Estado de cuenta creado exitosamente',
            data: accountStatement
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el estado de cuenta',
            error: error.message
        })
    }
}
export const getAccountStatements = async (req, res) => {
    try {
        const { page = 1, limit = 10, accountId } = req.query;

        const filter = {};

        if (accountId) {
            if (!mongoose.Types.ObjectId.isValid(accountId)) {
                return res.status(400).json({
                    success: false,
                    message: "accountId inválido"
                });
            }

            filter.accountId = new mongoose.Types.ObjectId(accountId);
        }

        const accountStatements = await AccountStatement.find(filter)
            .limit(parseInt(limit))
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await AccountStatement.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: accountStatements,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al mandar los estados de cuenta',
            error: error.message
        });
    }
};
export const updateAccountStatement = async (req, res) => {
    try {
        const { id } = req.params;
        const accountStatementData = req.body;
        const accountStatement = await AccountStatement.findByIdAndUpdate(
            id,
            accountStatementData,
            { new: true, runValidators: true }
        );

        if (!accountStatement) {
            return res.status(404).json({
                success: false,
                message: 'Estado de cuenta no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Estado de cuenta actualizado exitosamente',
            data: accountStatement
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el estado de cuenta',
            error: error.message
        })
    }
}

export const deleteAccountStatement = async (req, res) => {
    try {
        const { id } = req.params;
        const accountStatement = await AccountStatement.findByIdAndDelete(id);

        if (!accountStatement) {
            return res.status(404).json({
                success: false,
                message: 'Estado de cuenta no encontrado'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Estado de cuenta eliminado exitosamente'
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar el estado de cuenta',
            error: error.message
        })
    }
}

export const getAccountStatementById = async (req, res) => {
    try {
        const { id } = req.params;

        const accountStatement = await AccountStatement.findById(id);

        if (!accountStatement) {
            return res.status(404).json({
                success: false,
                message: 'Estado de cuenta no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: accountStatement
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el estado de cuenta',
            error: error.message
        });
    }
};