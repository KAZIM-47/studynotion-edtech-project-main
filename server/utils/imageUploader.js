const cloudinary = require("cloudinary").v2

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
    console.warn("Cloudinary credentials are not configured. Using placeholder image URL.")
    return {
      secure_url:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
    }
  }
  const options = { folder }
  if (height) {
    options.height = height
  }
  if (quality) {
    options.quality = quality
  }
  options.resource_type = "auto"
  console.log("OPTIONS", options)
  return await cloudinary.uploader.upload(file.tempFilePath, options)
}
