import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import connectDB from "./src/db/db.js"
import studentRoute from "./src/routes/student.route.js"
const app = express()

dotenv.config({
    path: './.env'
})
app.use(express.json())
app.use(cors()) 
app.use(cookieParser())

app.use("/student",studentRoute)
// app.get("/",(req,res)=>{
//     res.send("Hello world")
// })

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`)
    })
}).catch((error) => {
    console.log(error)
})