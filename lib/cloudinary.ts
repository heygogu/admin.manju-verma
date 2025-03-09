import { v2 as cloudinary } from "cloudinary";

// NEXT_PUBLIC_CLOUDINARY_KEY=215247942342647
// NEXT_PUBLIC_CLOUDINARY_SECRET=ra5FBb_BwJq8mO1OKdu7pd_wfmE
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dmorrbtjy
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_SECRET,
});

export default cloudinary;