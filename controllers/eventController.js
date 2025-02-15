import prisma from "../config/db.config.js";

export const eventController = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const events = await prisma.event.findMany({
            where: {
                date: {
                    gte: startDate ? new Date(startDate) : new Date(),
                    lte: endDate ? new Date(endDate) : undefined
                }
            },
            orderBy: {
                date: 'asc',
            }
        })
        res.status(200).json({
            success: true,
            data: events,
        })
    } catch (error) {
        console.error('something went wrong during retriving all events', error)
        res.status(500).json({
            success: false,
            message: 'something went wrong during retriving all events'
        })
    }
}
//testing success and lookover date formate stored
export const eventControllerByDate = async (req, res) => {
    try {
        const { date } = req.params;
        console.log('date', date);
        console.log('date', new Date(date));
        const events = await prisma.event.findMany({
            where: {
                date: date
                //date:new Date(date)

            },
            orderBy: {
                date: 'asc',
            },
        })
        res.status(200).json({
            success: true,
            data: events,
        })
    } catch (error) {
        console.error('something went wrong during retriving all events on given date', error)
        res.status(500).json({
            success: false,
            message: 'something went wrong during retriving all events on given date'
        })
    }
}