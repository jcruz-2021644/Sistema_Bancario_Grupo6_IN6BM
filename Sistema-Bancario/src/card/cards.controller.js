import Card from './cards.model.js';

//agregar
export const createCard = async (req, res) => {
    try {

        const cardData = req.body;
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
export const updateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const cardData = req.body;
        const card = await Card.findByIdAndUpdate(
            id,
            cardData,
            { new: true, runValidators: true }
        );

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Tarjeta actualizada exitosamente',
            data: card
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la tarjeta',
            error: error.message
        });
    }
}

export const deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await Card.findByIdAndDelete(id);

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Tarjeta eliminada exitosamente'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar la tarjeta',
            error: error.message
        });
    }
}

export const getCardById = async (req, res) => {
    try {
        const { id } = req.params;

        const card = await Card.findById(id);

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: card
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar la tarjeta',
            error: error.message
        });
    }
};


export const changeCardStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validar estados permitidos
        const allowedStatus = ['activa', 'bloqueada', 'cancelada'];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no permitido'
            });
        }

        const card = await Card.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: `Tarjeta ${status} correctamente`,
            data: card
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado',
            error: error.message
        });
    }
};