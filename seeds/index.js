import mongoose from "mongoose";
import cities from './cities.js'
import Campground from '../models/campground.js'
import {places, descriptors} from './seedHelpers.js'

mongoose.connect('mongodb://0.0.0.0:27017/yelp-camp',{
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}) 

const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () =>{
    console.log("Database connected")
})

const sample= (array)=> array[Math.floor(Math.random()* array.length)];

const seedDB = async () => {
   await Campground.deleteMany({});
   for (let i = 0; i < 50; i++) {
   const random1000 = Math.floor(Math.random() * 1000);
   const price = Math.floor(Math.random() *20) + 10
   const camp = new Campground({ 
       //Your user id
   author: '6288ed8be95406ce92e90fa7' ,    
   location: `${cities[random1000].city}, ${cities[random1000].state}`, 
   title: `${sample(descriptors)} ${sample(places)}` ,
   price,
   geometry:{
       type: "Point",
       coordinates: [
           cities[random1000].longitude,
           cities[random1000].latitude,
       ]
   },
   images: [
       {
           url: "https://res.cloudinary.com/do2bzqcet/image/upload/v1653403164/YelpCamp/zvn622bcpv2xef8tlsmy.jpg"
           ,filename: "YelpCamp/zvn622bcpv2xef8tlsmy"
        },
        {
            url:"https://res.cloudinary.com/do2bzqcet/image/upload/v1653403167/YelpCamp/gmk1g76wxbpj3vkoxypl.jpg",
            filename : "YelpCamp/gmk1g76wxbpj3vkoxypl"
        }
   ]
}) 
   await camp.save(); 
   }
}

seedDB().then(() => {
    mongoose.connection.close()
})