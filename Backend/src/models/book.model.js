import mongoose,{Schema} from "mongoose";


const bookSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    total_copies:{
        type:Number,
        required:true,
    },
    available_copies:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    }
})

export const Book = mongoose.Schema("Book",bookSchema)