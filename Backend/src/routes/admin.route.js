import { Router } from "express"
import {registerAdmin,loginAdmin,refreshAccessToken,logoutAdmin} from "../controller/admin.controller.js"
import { verifyJWT } from "../middleware/admin.middleware.js"
import { addBook,getPendingTransaction } from "../controller/book.controller.js"
const router = Router()

router.route("/register").post(registerAdmin)
router.route("/login").post(loginAdmin)
router.route("/regentokens").post(refreshAccessToken)
router.route("/logout").post(verifyJWT,logoutAdmin)

router.route("/books/add").post(verifyJWT,addBook)
router.route("/transactions/pending").get(verifyJWT,getPendingTransaction)
export default router