const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
	const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studynotion";
	mongoose
		.connect(mongoUrl)
		.then(() => console.log("DB Connection Success"))
		.catch((err) => {
			console.error("DB Connection Failed:", err.message);
			if (err.name === "MongooseServerSelectionError") {
				console.error("\n[MongoDB Atlas IP Whitelist Notice]");
				console.error("MongoDB Atlas rejected the connection. Your public IP address is not whitelisted in MongoDB Atlas Network Access.");
				console.error("Please add 0.0.0.0/0 (or your current IP) in MongoDB Atlas -> Security -> Network Access.\n");
			}
		});
};
