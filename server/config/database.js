const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
	const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studynotion";
	mongoose
		.connect(mongoUrl)
		.then(() => console.log("DB Connection Success"))
		.catch((err) => {
			console.log("DB Connection Failed");
			console.error(err.message);
		});
};
