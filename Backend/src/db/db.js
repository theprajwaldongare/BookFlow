import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        const connIns = await mongoose.connect('mongodb://localhost:27017/library')
    } catch (error) {
        console.log(error)
    }
}
export default connectDB