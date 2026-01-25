import jwt from 'jsonwebtoken';
const auth = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "The token is missing" });
        return;
    }
    try {
        const decoded_message = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded_message.id;
        // console.log("Req.userId:",req.userId);
        next();
    }
    catch (err) {
        console.error("Auth Middleware Error:", err.message);
        res.status(403).json({ error: "invalid token", details: err.message });
    }
}
export default auth;