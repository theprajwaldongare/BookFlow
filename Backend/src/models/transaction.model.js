import mongoose,{Schema} from "mongoose";


const transactionSchema = new mongoose.Schema({
    student_id:{
        type:Schema.Types.ObjectId,
        ref:"Student",
        required:true
    },
    book_id:{
        type:Schema.Types.ObjectId,
        ref:"Book",
        required:true
    },
    issued_by:{
        type:Schema.Types.ObjectId,
        ref:"Admin",
        required:true
    },
    issue_date:{
        type:Date,
        default:Date.now
    },
    collected_by:{
        type:Schema.Types.ObjectId,
        ref:"Admin",
        default:null
    },
    status:{
        type:String,
        enum:['borrowRequested','borrowed','returnRequested', 'returned'],
        default:'borrowRequested'
        // borrowed when admin give access and return when student do return and admin grant return
    }
},{timestamps:true})

export const Transaction = mongoose.Schema("Transaction",transactionSchema)