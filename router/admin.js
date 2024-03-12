const express = require("express");
const router = new express.Router();
const { ObjectId } = require("mongodb");
const bodyparser = require("body-parser");
const nodemailer = require("nodemailer");
const validator = require("validator");
const cron = require("node-cron");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const multer = require("multer");
const auth = require("../middleware/auth");
const { profile } = require("console");
const cloudinary = require("cloudinary").v2;


const EmailVarify = require("../model/varifyemail")

const cors = require("cors");
var dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
require("../database/db");
router.use(cors());
router.use(cookieparser());
router.use(bodyparser.urlencoded({ extended: true }));
router.use(express.urlencoded({ extended: false }));
router.use(bodyparser.json());
router.use(express.json());
const mailgun = require("mailgun-js");
const mailGun = process.env.mailGun;
const DOMAIN = mailGun;
const Email_otp_pass = process.env.Email_otp_pass;
const C_cloud_name = process.env.C_cloud_name;
const C_api_key = process.env.C_api_key;
const C_api_secret = process.env.C_api_secret;
const MailGun_api_key = process.env.MailGun_api_key;
cloudinary.config({
  cloud_name: C_cloud_name,
  api_key: C_api_key,
  api_secret: C_api_secret,
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.use("/ProfileImage", express.static("public/upload"));
router.use("/image", express.static("public/upload"));
router.use("/categoryThumbnail", express.static("public/upload"));
function generateOTP()
{
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}
router.get("/", (req, res) =>
{
  res.json({ status: 200, message: "THIS IS HOME PAGE into development server", data: null });
});
router.post("/signup", async (req, res) =>
{
  try {
    const email = req.body.email;
    const code = generateOTP();
    const emailvarifyadd = new EmailVarify({
      email: email,
      code: code
    });
    const registered = await emailvarifyadd.save();
    console.log(registered);
    var transpoter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "wasimxaman13@gmail.com",
        pass: Email_otp_pass,
      },
    });
    var mailoption = {
      from: "wasimxaman13@gmail.com",
      to: email,
      subject: "Varify Email",
      text: `Varify Email OTP ${code}`,
    };
    transpoter.sendMail(mailoption, function (error, info)
    {
      if (error) {
        console.log(error);
        res.status(500).json({
          status: 500,
          message: "Failed to send OTP email",
          data: null,
        });
      } else {
        console.log("Email sent: " + info.response);
        res.status(201).json({
          status: 201,
          success: true,
          message: "please check your email",
          data: null,
        });
      }
    });


  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 400, success: false, message: "not found", data: null });
  }
});
module.exports = router;
