import { Student } from "../models/student.model.js"
import jwt from "jsonwebtoken"

export const verifyJWT = async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken
        if (!token) {
            return res.status(401).json({error:"Token is not present"})
        }

        const decodeToken = jwt.verify(token,process.env.ACC_TOKEN_SECRET)

        const std = await Student.findById(decodeToken?._id).select("-password -refreshToken")

        if (!std) {
            return res.status(401).json({error:"Student is not present"})
        }

        req.user = std
        next()
    } catch (error) {
        return res.status(401).json({error:"Student is not present"})
    }
}