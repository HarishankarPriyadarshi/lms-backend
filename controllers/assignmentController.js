
// export const getAssignmentController = async (req, res) => {
//     try {
//         const { subjectId, classId } = req.query;
//         const userRole = req.user.role?req.user.role:"student";
//         const userId = req.user.id;

//         let filters = {};

//         if (userRole === 'student') {
//             const student = await prisma.student.findUnique({
//                 where: { id: userId },
//                 select: { classId: true },
//             });

//             if (!student) return res.status(404).json({ error: 'Student not found' });

//             // Get subjects for student's class
//             const subjects = await prisma.subject.findMany({
//                 where: { classes: { some: { id: student.classId } } },
//                 select: { id: true },
//             });

//             const subjectIds = subjects.map((s) => s.id);
//             filters.subjectId = { in: subjectIds };
//         } else if (userRole === 'TEACHER') {
//             // Get teacher's assigned subjects
//             const subjects = await prisma.subject.findMany({
//                 where: { teachers: { some: { id: userId } } },
//                 select: { id: true },
//             });

//             const subjectIds = subjects.map((s) => s.id);
//             filters.subjectId = { in: subjectIds };
//         } else if (userRole === 'ADMIN') {
//             if (subjectId) filters.subjectId = parseInt(subjectId);
//             if (classId) {
//                 filters.subject = { classes: { some: { id: parseInt(classId) } } };
//             }
//         }

//         // Fetch assignments
//         const assignments = await prisma.assignment.findMany({
//             where: filters,
//             orderBy: { dueDate: 'asc' },
//         });

//         res.json(assignments);
//     } catch (error) {
//         console.error('Error fetching assignments:', error);
//         res.status(500).json({ error: 'Error fetching assignments' });
//     }
// };

// export const getAssignmentsController = async (req, res) => {
//     try {
//         const { classId, startDate, endDate, subjectId } = req.query;
//         const userRole = req.user.role ? req.user.role : "student";
//         const userId = req.user.id;

//         const filter = {};

//         if (startDate) filter.startDate = { gte: new Date(startDate) };
//         if (endDate) filter.dueDate = { lte: new Date(endDate) };

//         // If student, find their classId
//         let studentClassId = null;
//         if (userRole === "student") {
//             const student = await prisma.student.findUnique({
//                 where: { id: userId },
//                 select: { classId: true },
//             });
//             console.log("student", student);

//             if (!student) {
//                 return res.status(403).json({
//                     success: false,
//                     message: "Unauthorized! Student record not found.",
//                 });
//             }
//             studentClassId = student.classId; // Restrict results to this classId
//         }
//         if (userRole === 'teacher') {
//             filter.teacherId = userId; // Ensure the teacher is assigned to the class

//             if (classId) filter.classId = classId;
//             if (subjectId) filter.subjectId = subjectId;

//         } else if (userRole === 'student') {

//             if (classId) filter.classId = studentClassId; // Ensure the student is in the requested class
//             console.log("studentID", studentClassId);

//             if (subjectId) filter.subjectId = subjectId;
//         } else {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Unauthorized access'
//             });
//         }

//         const assignments = await prisma.assignment.findMany({
//             where: filter,
//             include: {
//                 subject: true,
//                 class: true,
//             },
//         });

//         res.status(200).json({
//             success: true,
//             assignments,
//         });
//     } catch (error) {
//         console.error('Error while fetching assignments:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error occurred while fetching assignments'
//         });
//     }
// };

export const getAssignmentsController = async (req, res) => {
    try {
        const { classId, startDate, endDate, subjectId } = req.query;
        const userRole = req.user.role || "student";
        const userId = req.user.id;
        console.log("subjectId :", subjectId);

        const filter = {};

        // Add filters based on query parameters
        if (startDate) filter.startDate = { gte: new Date(startDate) };
        if (endDate) filter.dueDate = { lte: new Date(endDate) };

        // If user is a student, get their classId and filter assignments accordingly
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
            studentClassId = student.classId;
            filter.classId = studentClassId;
            if (subjectId) filter.subjectId = Number(subjectId);
        }

        // if (userRole === 'teacher') {
        //     // if (classId) filter.classId = classId;
        //     if (classId) {
        //         const teacherClassAssignment = await prisma.class.findFirst({
        //             where: {
        //                 id: classId,
        //                 teachers: { some: { id: userId } }, // Teacher must be assigned to this class
        //             },
        //         });

        //         if (!teacherClassAssignment) {
        //             return res.status(403).json({
        //                 success: false,
        //                 message: "You are not assigned to this class.",
        //             });
        //         }

        //         filter.classId = classId;
        //     }

        //     if (subjectId) filter.subjectId = Number(subjectId);
        // }
        if (userRole === "teacher") {
            if (classId) {
                // Check if teacher is assigned to the requested class
                const teacherClassAssignment = await prisma.class.findFirst({
                    where: {
                        id: Number(classId),
                        Teacher: { some: { id: userId } }, // Teacher must be assigned to this class
                    },
                });

                if (!teacherClassAssignment) {
                    return res.status(403).json({
                        success: false,
                        message: "You are not assigned to this class.",
                    });
                }

                filter.classId = Number(classId);
            } else {
                // If no classId is provided, filter assignments based on the teacher's assigned classes
                const teacherAssignedClasses = await prisma.class.findMany({
                    where: {
                        Teacher: { some: { id: userId } },
                    },
                    select: { id: true },
                });

                if (teacherAssignedClasses.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: "You are not assigned to any class.",
                    });
                }

                filter.classId = { in: teacherAssignedClasses.map((cls) => cls.id) };
            }

            // Optionally filter by subjectId
            if (subjectId) filter.subjectId = Number(subjectId);
        }

        console.log("filter:", filter);

        const assignments = await prisma.assignment.findMany({
            where: filter,
            include: {
                subject: true,
                class: true,
            },
        });

        res.status(200).json({
            success: true,
            assignments,
        });
    } catch (error) {
        console.error('Error while fetching assignments:', error);
        res.status(500).json({
            success: false,
            message: 'Error occurred while fetching assignments'
        });
    }
};



