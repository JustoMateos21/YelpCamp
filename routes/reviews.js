import express from "express";
const router = express.Router({mergeParams: true})

import catchAsync from "../utils/catchAsync.js";

import {validateReview, isLoggedIn, reviewAuthor} from '../middleware.js'
import { createReview, deleteReview } from "../controllers/reviews.js";

router.post('/', 
isLoggedIn, 
validateReview, 
catchAsync(createReview)
)

router.delete('/:reviewId', 
isLoggedIn, 
reviewAuthor, 
catchAsync(deleteReview)
)

export default router