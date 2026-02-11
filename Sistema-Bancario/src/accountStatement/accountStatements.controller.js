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
        const filter = { accountId };
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const accountStatements = await AccountStatement.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);
        const total = await AccountStatement.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: accountStatements,
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
            message: 'Error al mandar los estados de cuenta',    
            error: error.message
        })
    }

}