import express from "express";
const router= express.Router();
import catchAsync from "../utils/catchAsync.js";
import passport from 'passport'
import { Login, Logout, Register, renderLogin, renderRegister } from "../controllers/users.js";

router.route('/register')
    .get(renderRegister)
    .post(catchAsync(Register));

router.route('/login')
    .get(renderLogin)
    .post(passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}),Login)

router.get('/logout', Logout)

export default router