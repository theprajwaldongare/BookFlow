import { Student } from "../models/student.model.js"
import jwt from "jsonwebtoken"

const registerStudent = async (req, res) => {
    try {
        const { name, email, password, rollNo, class: studentClass } = req.body
        if (!name || !email || !password || !rollNo || !studentClass) {
            return res.status(400).json({ error: "Name,roll no and class are required!" })
        }

        const existStudent = await Student.findOne({ email })
        if (existStudent) {
            return res.status(409).json({ error: "Student already exists go to login" })
        }

        const newStudent = await Student.create({
            name: name,
            email: email,
            password: password,
            rollNo: rollNo,
            class: studentClass
        })
        const regStudent = newStudent.toObject()
        delete regStudent.password
        return res.status(201).json({
            message: "Student registered successfully!",
            user: regStudent
        });

    } catch (error) {
        console.log("Error in registerStudent:", error)
        return res.status(500).json({ error: "Something went wrong ..." })
    }



}

const loginStudent = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ error: "Email and Password is Required" })
    }

    const loginExists = await Student.findOne({ email })
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

    const loggedStudent = loginExists.toObject()
    delete loggedStudent.password
    delete loggedStudent.refreshToken
    const options = {
        httpOnly: true,
        secure: true
    }
    //    const {accessToken,refreshToken}=
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({
        message: "Logged in Successfully",
        user: loggedStudent,
        accessToken,
        refreshToken
    })
    // return res.status(200).json(loginExists)


}

const refreshAccessToken = async (req, res) => {
    try {
        const incomeRT = req.cookies?.refreshToken || req.body?.refreshToken
        if (!incomeRT) {
            return res.status(401).json({ error: "No Refresh token present" })
        }

        const decodeT = jwt.verify(incomeRT, process.env.REF_TOKEN_SECRET)
        const studentByToken = await Student.findById(decodeT?._id)
        if (!studentByToken) {
            return res.status(401).json({ error: "Invalid Refresh Token" })
        }
        if (studentByToken.refreshToken != incomeRT) {
            return res.status(401).json({ error: "Invalid Refresh Token" })
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const accTok = studentByToken.genAccToken()
        const refTok = studentByToken.genRefToken()

        studentByToken.refreshToken = refTok
        await studentByToken.save({ validateBeforeSave: false })

        const reACCREFStudent = studentByToken.toObject()
        delete reACCREFStudent.password
        delete reACCREFStudent.refreshToken

        return res.status(200).cookie("accessToken", accTok, options).cookie("refreshToken", refTok, options).json({
            message: "Access and Refresh Token re generated !",
            user: reACCREFStudent,
            accTok,
            refTok
        })
    } catch(error){
        return res.status(401).json({error:"Invalid or Expired Refresh Token"})
    }

}

const logoutStudent = async(req,res)=>{
    await Student.findByIdAndUpdate(
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

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json({"stat":"Student Logout Successfully"})
}
// testing of logout is remaining
export { registerStudent, loginStudent, refreshAccessToken,logoutStudent }