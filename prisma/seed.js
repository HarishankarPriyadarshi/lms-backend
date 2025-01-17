import { PrismaClient, userGender } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    // ADMIN
    await prisma.admin.create({
        data: {
            email: "admin1",
            password: "admin1",
        },
    });
    await prisma.admin.create({
        data: {
            email: "admin2",
            password: "admin2",
        },
    });


    // CLASS
    for (let i = 1; i <= 6; i++) {
        await prisma.class.create({
            data: {
                className: `${i}A`,

            },
        });
    }

    // SUBJECT
    const subjectData = [
        { name: "Mathematics" },
        { name: "Science" },
        { name: "English" },
        { name: "History" },
        { name: "Geography" },
        { name: "Physics" },
        { name: "Chemistry" },
        { name: "Biology" },
        { name: "Computer Science" },
        { name: "Hindi" },
    ];

    for (const subject of subjectData) {
        await prisma.subject.create({ data: subject });
    }
    // TEACHER VERIFICATION DETAILS
    for (let i = 1; i <= 15; i++) {
        await prisma.teacherVerificationDetail.create({
            data: {
                email: `teacher${i}@gmail.com`,
                password: `teacher${i}`,
            },
        })
    }
    // TEACHER
    for (let i = 1; i <= 15; i++) {
        await prisma.teacher.create({
            data: {
                firstName: `TFirst${i}`,
                lastName: `TLast${i}`,
                email: `teacher${i}@gmail.com`,
                phone: `123456789${i % 2}`,
                address: `Address${i}`,
                gender: i % 2 === 0 ? userGender.MALE : userGender.FEMALE,
                subjects: { connect: [{ id: (i % 10) + 1 }] },
                classes: { connect: [{ id: (i % 6) + 1 }] },
                teacherVerificationDetailId: i,
            },
        });
    }
    // STUDENT VERIFICATION DETAILS
    for (let i = 1; i <= 50; i++) {
        await prisma.studentVerificationDetail.create({
            data: {
                email: `student${i}@gmail.com`,
                password: `student${i}`,
            },
        })
    }

    // STUDENT
    for (let i = 1; i <= 50; i++) {
        await prisma.student.create({
            data: {
                firstName: `FName${i}`,
                middleName: `MName${i}`,
                lastName: `LName${i}`,
                enrollmentNo: `${100 + i}`,
                email: `student${i}@gmail.com`,
                fatherName: `Fname${i}`,
                address: `Address${i}`,
                phone: `123456789${i % 2}`,
                gender: i % 2 === 0 ? userGender.MALE : userGender.FEMALE,
                classId: (i % 6) + 1,
                studentVerificationDetailId: i,
            },
        });
    }

    // EXAM
    for (let i = 1; i <= 10; i++) {
        await prisma.exam.create({
            data: {
                title: `Exam ${i}`,
                startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
                endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
                subjectId: (i % 30),
            },
        });
    }

    // ASSIGNMENT
    for (let i = 1; i <= 10; i++) {
        await prisma.assignment.create({
            data: {
                title: `Assignment ${i}`,
                startDate: new Date(new Date().setHours(new Date().getHours() + 1)),
                dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
                subjectId: (i % 30),
            },
        });
    }

    // RESULT
    for (let i = 1; i <= 10; i++) {
        await prisma.result.create({
            data: {
                score: 90,
                studentId: Number(`${i}`),
                ...(i <= 5 ? { examId: i } : { assignmentId: i - 5 }),
            },
        });
    }

    // ATTENDANCE
    for (let i = 1; i <= 10; i++) {
        await prisma.attendance.create({
            data: {
                date: new Date(),
                present: true,
                studentId: (i % 30) + 1,
            },
        });
    }

    // EVENT
    for (let i = 1; i <= 5; i++) {
        await prisma.event.create({
            data: {
                title: `Event ${i}`,
                description: `Description for Event ${i}`,
                startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
                endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
                classId: (i % 5) + 1,
            },
        });
    }

    // Notification
    for (let i = 1; i <= 5; i++) {
        await prisma.notification.create({
            data: {
                title: `Announcement ${i}`,
                description: `Description for Announcement ${i}`,
                date: new Date(),
                classId: (i % 5) + 1,
            },
        });
    }

    console.log("Seeding completed successfully.");
}

(async () => {
    try {
        await main();
    } catch (e) {
        console.error("An error occurred during seeding:", e);
        process.exit(1); // Exit the process with an error code
    } finally {
        await prisma.$disconnect(); // Ensure Prisma disconnects
    }
})();