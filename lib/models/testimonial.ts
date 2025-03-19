import mongoose from "mongoose"

const TestimonialSchema = new mongoose.Schema(
  {
    
    clientName: {
      type: String,
      
    },
    clientImage: {
        type: String,
        required: [true, "Please provide a client image"],
    },
    clientDesignation: {
        type: String,
      
    },
    companyName: {
        type: String,
        required: [true, "Please provide a company name"],
    },
   companyUrl:{
        type:String,
        required:[true,"Please provide a company url"]
    },
    testimonial: {
        type: String,
        required: [true, "Please provide a testimonial"],
        maxlength: [500, "Testimonial cannot be more than 500 characters"],
    },
    isCompany: {
        type: Boolean,
        default: false,
    },
    starRating: {
        type: Number,
        required: [true, "Please provide a star rating"],

   },},
  { timestamps: true },
)

export default mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema)

