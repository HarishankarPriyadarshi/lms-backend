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
