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
const providerRegister = require("../model/providerregister")

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
  res.json({ status: 200, success: true, message: "THIS IS HOME PAGE into development server", data: null });
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
          success: false,
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
router.post("/emailVrifyOtp", async (req, res) =>
{
  try {
    const email = req.body.email;
    const code = req.body.code;
    const mail = await EmailVarify.findOne({ code: code, email: email });
    if (mail) {
      const currentTime = new Date().getTime();
      const Diff = mail.expireIn - currentTime;
      if (Diff < 0) {
        res.status(401).json({
          status: 401,
          message: "otp expire with in 5 mints",
          data: null,
        });
      } else {
        const registerEmp = new providerRegister({

          password: req.body.password,
          email: email,
          fullname: req.body.fullname,
          ProfileImage: null,
          address: null,
          Phone: req.body.phone,
          isVarified: false,
          isNewUser: true,
        });
        await registerEmp.save();
        res.status(200).json({
          status: 200,
          success: true,
          message: "email varification successful",
          data: null,
        });
      }
    } else {
      res.status(400).json({ status: 400, success: false, message: "Invalid Otp", data: null });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 400, success: false, message: "Invalid Otp", data: null });
  }
});
router.post("/Login", async (req, res) =>
{
  try {
    const email = req.body.email;
    const password = req.body.password;
    const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000;
    const expirationTime = new Date().getTime() + oneMonthInMillis;
    const useremail = await providerRegister.findOne({ email: email });
    const ismatch = await bcrypt.compare(password, useremail.password);

    if (!useremail || !password) {
      res.status(400).json({
        status: 400,
        message: "Enter Correct email or password",
        data: null,
      });
    } else if (ismatch) {
      const getmens = await providerRegister.findOneAndUpdate(
        { email: email },
        { $set: { expireIn: expirationTime } },
        { new: true }
      );
      const token = await useremail.generateAuthToken();
      res.cookie("jwt", token, { httpOnly: true });
      res.status(200).json({
        status: 200,
        message: "Login Successfully",
        success: true,
        data: {
          _id: useremail._id,
          isVerified: useremail.isVarified,
          isNewUser: useremail.isNewUser,
          accessToken: token,
        },
      });
    } else {
      res
        .status(404)
        .json({ status: 400, success: false, message: "Invalid Password", data: null });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 400, success: false, message: "invalid email", data: null });
  }
});
router.get("/get-user-detail/:_id", async (req, res) =>
{
  try {
    const _id = req.params._id;
    const data = await providerRegister.findOne({ _id: _id }).select({
      _id: 1,
      email: 1,
      Phone: 1,
      address: 1,
      fullname: 1,
      ProfileImage: 1,
    });
    res.status(200).json({
      status: 200,
      success: true,
      message: "User details",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "internel server error",
      data: null,
    });
  }
});
module.exports = router;
