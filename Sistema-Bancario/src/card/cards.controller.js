import Card from './cards.model.js';

//agregar
export const createCard = async (req, res) => {
    try {

        const cardData = req.body;

        /* if(req.file){
             const extension = req.file.path.split('.').pop();
             const filename = req.file.filename;
             const relativePath = filename.substring(filename.indexOf('fields/'));
         
             fieldData.photo = `$(relativePath).$(extension)`;
         }else{
             fieldData.photo = 'fields/kinal_sports_nyvxo5';
         }
 */
        const card = new Card(cardData);
        await card.save();

        res.status(201).json({
            success: true,
            message: 'Tarjeta creada exitosamente',
            data: card
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la tarjeta',
            error: error.message
        })
    }
}

export const getCards = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'activa' } = req.query;
        const filter = { status };
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const cards = await Card.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);
        const total = await Card.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: cards,
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
            message: 'Error al obtener las tarjetas',
            error: error.message
        })
    }

}