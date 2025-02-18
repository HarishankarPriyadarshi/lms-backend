import JWT from 'jsonwebtoken';

//protected routes for students
export const requireSignIn = async (req, res, next) => {
    try {
        const decode = JWT.verify(req.headers.authorization, process.env.JWT_SECRET)
        req.user = decode
        next();
    } catch (error) {
        console.log(error)
        res.status(500).json("invalid token")
    }
}

//teacher acceess
export const isTeacher = async (req, res, next) => {
    try {

        if (req.user.role !== "teacher") {
            console.log("Unauthorized: User role is not teacher", req.user.role);
            return res.status(403).json({
                success: false,
                message: "Only teachers can create events.",
            });
        }

        const teacher = await prisma.teacher.findUnique({
            where: { id: req.user.id },
        });

        if (!teacher) {
            console.log(" User not found in teacher table");
            return res.status(403).json({
                success: false,
                message: "Unauthorized acces.",
            });
        }

        console.log("Authorized teacher access");
        next();
    } catch (error) {
        console.error("Error in teacher middleware:", error);
        res.status(500).json({
            success: false,
            message: "Server error in teacher middleware",
        });
    }
};


