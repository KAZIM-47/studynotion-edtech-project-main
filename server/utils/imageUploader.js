const cloudinary = require("cloudinary").v2

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  const cloudName = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.API_KEY || process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.API_SECRET || process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary credentials are not fully configured (missing CLOUD_NAME, API_KEY, or API_SECRET). Using placeholder image URL.")
    return {
      secure_url:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
    }
  }

  if (!file || !file.tempFilePath) {
    throw new Error("No file or temporary file path provided for Cloudinary upload")
  }

  const options = { folder: folder || process.env.FOLDER_NAME || "StudyNotion" }
  if (height) {
    options.height = height
  }
  if (quality) {
    options.quality = quality
  }
  options.resource_type = "auto"

  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, options)
    return result
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message)
    throw new Error(`Media upload failed: ${error.message}`)
  }
}
