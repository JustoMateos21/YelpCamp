import mongoose from "mongoose";
import pkg from 'mongoose'
const {Schema, model}= pkg
import passportLocalMongoose from "passport-local-mongoose"

const UserSchema= new Schema({
    email:{
        type: String,
        required: true,
        unique: true,
    }
})

UserSchema.plugin(passportLocalMongoose);

const User = model("User", UserSchema);

export default User
