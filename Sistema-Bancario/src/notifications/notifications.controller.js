import Notification from './notifications.model.js';

//agregar
export const createNotification = async (req, res) => {
    try {

        const notificationData = req.body;

        /* if(req.file){
             const extension = req.file.path.split('.').pop();
             const filename = req.file.filename;
             const relativePath = filename.substring(filename.indexOf('fields/'));
         
             fieldData.photo = `$(relativePath).$(extension)`;
         }else{
             fieldData.photo = 'fields/kinal_sports_nyvxo5';
         }
 */
        const notification = new Notification(notificationData);
        await notification.save();

        res.status(201).json({
            success: true,
            message: 'Notificación creada exitosamente',
            data: notification
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la notificación',
            error: error.message
        })
    }
}

export const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10, channel = 'email' } = req.query;
        const filter = { channel };
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const notifications = await Notification.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);
        const total = await Notification.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: notifications,
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
            message: 'Error al mandar las notificaciones',    
            error: error.message
        })
    }

}