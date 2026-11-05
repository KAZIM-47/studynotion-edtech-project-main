const nodemailer = require("nodemailer")

const mailSender = async (email, title, body) => {
  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      throw new Error("SMTP credentials are missing")
    }

    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 465,
      secure: true,
      auth: {
        user: (process.env.MAIL_USER || "").trim(),
        pass: (process.env.MAIL_PASS || "").replace(/\s+/g, ""),
      },
    })

    let info = await transporter.sendMail({
      from: `"Studynotion | CodeHelp" <${process.env.MAIL_USER}>`, // sender address
      to: `${email}`, // list of receivers
      subject: `${title}`, // Subject line
      html: `${body}`, // html body
    })
    console.log(info.response)
    return info
  } catch (error) {
    console.error("Email delivery failed:", error.message)
    throw error
  }
}

module.exports = mailSender
