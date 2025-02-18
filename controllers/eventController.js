import prisma from "../config/db.config.js";

// export const eventController = async (req, res) => {
//     try {
//         const { startDate, endDate } = req.body;
//         const events = await prisma.event.findMany({
//             where: {
//                 date: {
//                     gte: startDate ? new Date(startDate) : new Date(),
//                     lte: endDate ? new Date(endDate) : undefined
//                 }
//             },
//             orderBy: {
//                 date: 'asc',
//             }
//         })
//         res.status(200).json({
//             success: true,
//             data: events,
//         })
//     } catch (error) {
//         console.error('something went wrong during retriving all events', error)
//         res.status(500).json({
//             success: false,
//             message: 'something went wrong during retriving all events'
//         })
//     }
// }

//testing success and lookover date formate stored

// export const geteventController = async (req, res) => {
//     try {
//         let { startDate, endDate } = req.body;
//         startDate = startDate ? startDate : new Date().toISOString().split("T")[0];
//         endDate = endDate ? endDate : undefined;
//         const events = await prisma.event.findMany({
//             where: {
//                 date: {
//                     gte: startDate,
//                     lte: endDate
//                 }
//             },
//             orderBy: {
//                 date: 'asc',
//             }
//         })
//         res.status(200).json({
//             success: true,
//             data: events,
//         })
//     } catch (error) {
//         console.error('something went wrong during retriving all events', error)
//         res.status(500).json({
//             success: false,
//             message: 'something went wrong during retriving all events'
//         })
//     }
// }



// export const eventControllerByDate = async (req, res) => {
//     try {
//         const { date } = req.params;
//         console.log('date', date);
//         console.log('date', new Date(date));
//         const events = await prisma.event.findMany({
//             where: {
//                 date: date
//                 //date:new Date(date)

//             },
//             orderBy: {
//                 date: 'asc',
//             },
//         })
//         res.status(200).json({
//             success: true,
//             data: events,
//         })
//     } catch (error) {
//         console.error('something went wrong during retriving all events on given date', error)
//         res.status(500).json({
//             success: false,
//             message: 'something went wrong during retriving all events on given date'
//         })
//     }
// }

export const getEventsController = async (req, res) => {
    try {
        const { title, date, classId } = req.query;

        // Get user details from token
        const userId = req.user.id;
        const userRole = req.user.role ? req.user.role : "student";



        // If student, find their classId
        let studentClassId = null;
        if (userRole === "student") {
            const student = await prisma.student.findUnique({
                where: { id: userId },
                select: { classId: true },
            });

            if (!student) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized! Student record not found.",
                });
            }
            studentClassId = student.classId; // Restrict results to this classId
        }

        // Query conditions
        let filter = {};

        if (title) {
            filter.title = { contains: title, mode: "insensitive" }; // Case-insensitive search
        }
        if (date) {
            filter.date = new Date(date);
        }
        if (classId) {
            filter.classId = Number(classId);
        }
        // if (startdate) {
        //     filter.date = {
        //         gte: new Date(startdate), // Fetch events on or after the given date
        //         lt: new Date(new Date(startdate).setDate(new Date(startdate).getDate() + 1)), // Fetch only events for that specific date
        //     };
        // }

        // Students can only see events for their class
        if (userRole === "student") {
            filter.classId = studentClassId;
        }

        // Fetch events with filters
        const events = await prisma.event.findMany({
            where: filter,
            orderBy: { date: "asc" },
        });

        res.status(200).json({
            success: true,
            message: "Events retrieved successfully",
            events,
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving events",
            error,
        });
    }
};


