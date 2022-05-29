
import dotenv from 'dotenv'
if (process.env.NODE_ENV !== "production") {
   dotenv.config();
}

import express from "express";
const app= express()
import path from 'path'
import mongoose from "mongoose";
import session from "express-session";
import flash from "connect-flash";
import engine from 'ejs-mate';
const ejsMate= engine
import methodOverride from 'method-override';
import ExpressError from "./utils/ExpressError.js";
import passport from 'passport'
import LocalStrategy from 'passport-local'
import User from "./models/user.js";

import helmet, { contentSecurityPolicy } from 'helmet';
import cors from 'cors'

//ROUTES
import campgrounds from './routes/campgrounds.js'
const campgroundRoutes= campgrounds
import reviews from './routes/reviews.js'
const reviewsRoutes= reviews
import users from './routes/users.js'
const userRoutes= users
const dbUrl= process.env.DB_URL
const dbUrll= 'mongodb://0.0.0.0:27017/yelp-camp'

import connectmongo from 'connect-mongo'
const MongoStore= connectmongo(session)


mongoose.connect(process.env.DB_URL||'mongodb://0.0.0.0:27017/yelp-camp' ,{
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}) 

const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () =>{
    console.log("Database connected")
})

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { allowedNodeEnvironmentFlags, title } from "process";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 

import mongoSanitize from 'express-mongo-sanitize'


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())
app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
  );

const secret = process.env.SECRET || `lol hed empty no thoughts`

const Store = new MongoStore({
    url: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});


Store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    Store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.use(session(sessionConfig))
app.use(flash());

app.use(cors())
app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: false
    })
  );


//----Setting up Helmet Policy-------//
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.css",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];

const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			childSrc: ['blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/do2bzqcet/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				'https://images.unsplash.com',
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/fakeUser', async (req, res) =>{
    const user= new User({email :'colt@mail.com', username: 'colt' })
    const newUser= await User.register(user, 'chicken')
    res.send(newUser)
})

app.use((req, res, next) =>{
    console.log(req.session)
    res.locals.currentUser= req.user;
    res.locals.success= req.flash("success")
    res.locals.error= req.flash('error')
    next()
 })

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/', (req, res)=>{
    res.render("home")
})

app.all('*', (req, res, next) =>{
    next( new ExpressError('Page not found', 404))
});

app.use((err, req, res, next) =>{
    const {statusCode = 500}= err;
    if(!err.message)err.message = 'Oh no, something went wrong'
    res.status(statusCode).render('error', {err})
});

process.setMaxListeners(1);

const port= process.env.PORT || 3070;

app.listen(`${port}`, ()=>{
    console.log(`Serving o port ${port}`)
});
