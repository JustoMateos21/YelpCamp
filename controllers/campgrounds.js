import dotenv from 'dotenv'
if (process.env.NODE_ENV !== "production") {
   dotenv.config();
}

import Campground from '../models/campground.js';
import cloudinary from 'cloudinary'
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding.js"
const mapBoxToken= process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const index= async (req, res)=>{
        const campgrounds= await Campground.find({});
        res.render('campgrounds/index', { campgrounds })
    }

const renderNewForm= (req, res) =>{
        res.render('campgrounds/new');
    }

const createCampground= async(req, res, next) =>{
        const geoData= await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send()
        console.log(geoData)
        const campground= new Campground(req.body.campground);
        campground.geometry= geoData.body.features[0].geometry;
        campground.images= req.files.map( f => ({url: f.path, filename: f.filename}))
        campground.author= req.user._id;
        await campground.save();
        req.flash('success', 'Scuccesfully made a new campground!')
        res.redirect(`/campgrounds/${campground._id}`)
    }    

const showCampground= async (req, res,) => {
        const campground = await Campground.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        if (!campground) {
            req.flash('error', 'Cannot find that campground!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show', { campground });
    }    

const renderEditForm= async(req, res) =>{
        const { id } = req.params;
        const campground= await Campground.findById(id);
        if(!campground){
            req.flash('error', 'Cannot find that Campground')
            return res.redirect('/campgrounds')
       }
       res.render('campgrounds/edit', { campground })
    }

const updateCampground= async (req, res) =>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
    }

const deleteCampground= async (req, res) =>{
        const {id} = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted campground')
        res.redirect('/campgrounds')
    }    

export {index, 
        renderNewForm, 
        createCampground, 
        showCampground, 
        renderEditForm,
        updateCampground,
        deleteCampground
}  

