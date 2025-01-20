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
//testing failed
export const eventControllerByDate = async (req, res) => {
    try {
        const { givendate } = req.params;
        console.log(givendate);

        const events = await prisma.event.findMany({
            where: {
                date: new Date(givendate)
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