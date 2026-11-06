const cloudinary = require("cloudinary").v2; //! Cloudinary is being required

exports.cloudinaryConnect = () => {
	try {
		cloudinary.config({
			//!    ########   Configuring Cloudinary to Upload MEDIA ########
			cloud_name: process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.API_KEY || process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.API_SECRET || process.env.CLOUDINARY_API_SECRET,
		});
		console.log("Cloudinary Connected Successfully");
	} catch (error) {
		console.error("Cloudinary Connection Error:", error.message);
	}
};
