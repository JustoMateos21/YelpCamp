import mongoose from "mongoose";
import pkg from 'mongoose'
const {Schema, model}= pkg
import User from './user.js'

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
})


const Review = model("Review", reviewSchema);
    
export default Review