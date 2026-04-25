import mongoose, { Schema, trusted } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    rollNo: {
        type: Number,
        required: true
    },
    class: {
        type: Number,
        required: true
    },
    refreshToken: {
        type: String
    }
})

studentSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10)
    // next()
})

studentSchema.methods.isPassMatch = async function (password) {
    return await bcrypt.compare(password, this.password)
}

studentSchema.methods.genAccToken = function () {
    return jwt.sign({
        _id: this.id,
        email: this.email,
        name: this.name,
        rollNo: this.rollNo
    },
        process.env.ACC_TOKEN_SECRET,
        {
            expiresIn: process.env.ACC_TOKEN_EXPIRY
        })
}

studentSchema.methods.genRefToken = function () {
    return jwt.sign({
        _id: this.id,
        email: this.email,
        name: this.name,
        rollNo: this.rollNo
    },
        process.env.REF_TOKEN_SECRET,
        {
            expiresIn: process.env.REF_TOKEN_EXPIRY
        })
}

export const Student = mongoose.model("Student", studentSchema)