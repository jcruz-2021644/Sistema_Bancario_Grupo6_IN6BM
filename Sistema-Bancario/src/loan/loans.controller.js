import Loan from './loans.model.js';

//agregar
export const createLoan = async (req, res) => {
    try {

        const loanData = req.body;

        /* if(req.file){
             const extension = req.file.path.split('.').pop();
             const filename = req.file.filename;
             const relativePath = filename.substring(filename.indexOf('fields/'));
         
             fieldData.photo = `$(relativePath).$(extension)`;
         }else{
             fieldData.photo = 'fields/kinal_sports_nyvxo5';
         }
 */
        const loan = new Loan(loanData);
        await loan.save();

        res.status(201).json({
            success: true,
            message: 'Préstamo creado exitosamente',
            data: loan
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el préstamo',
            error: error.message
        })
    }
}

export const getLoans = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'solicitado' } = req.query;
        const filter = { status };
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const loans = await Loan.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);
        const total = await Loan.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: loans,
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
            message: 'Error al obtener el préstamo',    
            error: error.message
        })
    }

}