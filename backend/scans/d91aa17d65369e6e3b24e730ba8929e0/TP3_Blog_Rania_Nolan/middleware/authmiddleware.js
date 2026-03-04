import jwt from "jsonwebtoken";


const authMiddleware= (req, res, next)=>{
    const token = req.cookies.accessToken || null;
    if(!token){
        res.status(401).json({error: "acces denied"});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded;
        next()
    } catch (error) {
        res.status(500).json({error: "Token invalid"});
    };

};


export default authMiddleware;