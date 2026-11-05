const Razorpay = require("razorpay");

exports.instance = new Razorpay({
	key_id: process.env.RAZORPAY_KEY || "rzp_test_dummy",
	key_secret: process.env.RAZORPAY_SECRET || "dummy_secret",
});
