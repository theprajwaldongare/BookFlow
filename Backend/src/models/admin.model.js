import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    refreshToken: {
        type: String
    }
})

adminSchema.pre("save", async function () {
    if (!this.isModified("password")) return

    this.password = await bcrypt.hash(this.password, 10)
})

adminSchema.methods.isPassMatch = async function (password) {
    return await bcrypt.compare(password, this.password)
}

adminSchema.methods.genAccToken = function () {
    return jwt.sign({
        _id: this.id,
        name: this.name,
        email: this.email
    }, process.env.ACC_TOKEN_SECRET,
        {
            expiresIn: process.env.ACC_TOKEN_EXPIRY
        }
    )
}

adminSchema.methods.genRefToken = function () {
    return jwt.sign({
        _id: this.id,
        name: this.name,
        email: this.email
    }, process.env.REF_TOKEN_SECRET,
        {
            expiresIn: process.env.REF_TOKEN_EXPIRY
        }
    )
}

export const Admin = mongoose.Schema("Admin", adminSchema)