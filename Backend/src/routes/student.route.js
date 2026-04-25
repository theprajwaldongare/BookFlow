import { Router } from "express"
import { registerStudent, loginStudent,refreshAccessToken, logoutStudent } from "../controller/student.controller.js"
import { verifyJWT } from "../middleware/student.middleware.js"

const router = Router()

router.route("/register").post(registerStudent)
router.route("/login").post(loginStudent)
router.route("/regentokens").post(refreshAccessToken)
router.route("/logout").post(verifyJWT,logoutStudent)

export default router