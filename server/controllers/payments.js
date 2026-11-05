const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body
  const userId = req.user.id

  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID" })
  }

  // Check Razorpay credentials configuration
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY
  const keySecret =
    process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET

  if (
    !keyId ||
    !keySecret ||
    keyId === "rzp_test_dummy" ||
    keySecret === "dummy_secret"
  ) {
    return res.status(500).json({
      success: false,
      message:
        "Razorpay Test Mode credentials are not configured in server/.env (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)",
    })
  }

  let total_amount = 0

  for (const course_id of courses) {
    try {
      // Find the course by its ID
      const course = await Course.findById(course_id)

      // If the course is not found, return an error
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Could not find the Course" })
      }

      // Check if the user is already enrolled in the course (string comparison)
      const isAlreadyEnrolled = course.studentsEnroled?.some(
        (id) => id.toString() === userId.toString()
      )
      if (isAlreadyEnrolled) {
        return res
          .status(400)
          .json({ success: false, message: "Student is already Enrolled" })
      }

      // Add the price of the course to the total amount
      total_amount += course.price
    } catch (error) {
      console.error("Error finding course for payment capture:", error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  }

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options)
    console.log("Razorpay order created successfully:", paymentResponse.id)
    return res.status(200).json({
      success: true,
      data: paymentResponse,
      keyId: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY,
    })
  } catch (error) {
    console.error("Razorpay order creation error:", error)
    return res
      .status(500)
      .json({ success: false, message: "Could not initiate order." })
  }
}

// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user.id

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Payment details incomplete" })
  }

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET

  if (!keySecret || keySecret === "dummy_secret") {
    return res.status(500).json({
      success: false,
      message: "Razorpay secret key not configured on server",
    })
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    try {
      await enrollStudents(courses, userId)
      return res
        .status(200)
        .json({ success: true, message: "Payment Verified" })
    } catch (error) {
      console.error("Error during student enrollment:", error)
      return res.status(500).json({
        success: false,
        message: "Payment verified but enrollment failed. Please contact support.",
      })
    }
  }

  return res
    .status(400)
    .json({ success: false, message: "Payment verification failed: Invalid signature" })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body
  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)
    if (!enrolledStudent) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )

    return res
      .status(200)
      .json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("Error in sending payment success email:", error.message)
    return res
      .status(500)
      .json({ success: false, message: "Could not send email" })
  }
}

// Helper: enroll the student in the courses
const enrollStudents = async (courses, userId) => {
  if (!courses || !Array.isArray(courses) || !userId) {
    throw new Error("Please Provide Course ID and User ID")
  }

  for (const courseId of courses) {
    // Find the course and enroll the student in it (prevent duplicate with $addToSet)
    const enrolledCourse = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { studentsEnroled: userId } },
      { new: true }
    )

    if (!enrolledCourse) {
      throw new Error(`Course not found: ${courseId}`)
    }

    // Find or create course progress to prevent duplicate progress documents
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })
    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
    }

    // Add course and courseProgress to student (prevent duplicate with $addToSet)
    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          courses: courseId,
          courseProgress: courseProgress._id,
        },
      },
      { new: true }
    )

    // Send email notification (non-blocking for enrollment)
    try {
      await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )
    } catch (mailErr) {
      console.error(
        "Failed to send course enrollment notification email:",
        mailErr.message
      )
    }
  }
}
