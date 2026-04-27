import { Admin } from "../models/admin.model.js"
import jwt from "jsonwebtoken"

const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name,Email and Password are required" })
        }

        const existAdmin = await Admin.findOne({ email })
        if (existAdmin) {
            return res.status(409).json({ error: "Admin already exists go to login" })
        }

        const newAdmin = await Admin.create({
            name: name,
            email: email,
            password: password
        })

        if (!newAdmin) {
            return res.status(500).json("Something is wrong while creating new admin")
        }

        const regAdmin = newAdmin.toObject()
        delete regAdmin.password

        return res.status(201).json({
            message: "Admin Register Successfully",
            user: regAdmin
        })
    } catch (error) {
        return res.status(500).json("Something is wrong while creating new admin")
    }

}

const loginAdmin = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ error: "Email and Password is Required" })
    }

    const loginExists = await Admin.findOne({ email })
    if (!loginExists) {
        return res.status(402).json({ error: "Login Details not found" })
    }

    const passValid = await loginExists.isPassMatch(password)
    if (!passValid) {
        return res.status(404).json({ error: "Password is wrong" })
    }

    const accessToken = loginExists.genAccToken()
    const refreshToken = loginExists.genRefToken()

    loginExists.refreshToken = refreshToken
    await loginExists.save({ validateBeforeSave: false })

    const loggedAdmin = loginExists.toObject()
    delete loggedAdmin.password
    delete loggedAdmin.refreshToken
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({
        message: "Logged in Successfully",
        user: loggedAdmin,
        accessToken,
        refreshToken
    })
}

const refreshAccessToken = async(req,res)=>{
    try {
        const incomeRT = req.cookies?.refreshToken || req.body?.refreshToken
        if (!incomeRT) {
            return res.status(401).json({ error: "No Refresh token present" })
        }
        const decodeT = jwt.verify(incomeRT,process.env.REF_TOKEN_SECRET)
        const adminByToken = await Admin.findById(decodeT?._id)
        if (!adminByToken) {
            return res.status(401).json({ error: "Invalid Refresh Token" })
        }

        if (adminByToken.refreshToken != incomeRT) {
            return res.status(401).json({ error: "Invalid Refresh Token" })
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const accTok = adminByToken.genAccToken()
        const refTok = adminByToken.genRefToken()

        adminByToken.refreshToken = refTok
        await adminByToken.save({ validateBeforeSave: false })

        const reACCREFAdmin = adminByToken.toObject()
        delete reACCREFAdmin.password
        delete reACCREFAdmin.refreshToken

        return res.status(200).cookie("accessToken", accTok, options).cookie("refreshToken", refTok, options).json({
            message: "Access and Refresh Token re generated !",
            user: reACCREFAdmin,
            accTok,
            refTok
        })
    } catch(error){
        return res.status(401).json({error:"Invalid or Expired Refresh Token"})
    }
}

const logoutAdmin = async(req,res)=>{
    await Admin.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json({"stat":"Admin Logout Successfully"})
}




export { registerAdmin,loginAdmin,refreshAccessToken,logoutAdmin }