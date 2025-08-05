const nodemailer = require("nodemailer");
const user = require("../models/userSchema");
const otpSchema = require("../models/otpSchema");
require("dotenv").config();
const cron = require("node-cron");
const https = require("https");
const userSchema = require("../models/userSchema");
process.env.TZ = "Asia/Kolkata";

const agent = new https.Agent({
  rejectUnauthorized: false,
});

// Create the transporter
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log(req.body);

    const existingUserName = await user.findOne({ name: name });

    console.log(existingUserName);

    if (existingUserName) {
      return res.status(400).json({ message: "User Name already exists" });
    }

    const existingUserEmail = await user.findOne({ email: email });
    if (existingUserEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create new user
    const newUser = new user({
      name,
      email,
      password,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log(req.body);

    if (!email && !name) {
      return res.status(400).json("Please enter either email or UserName");
    }

    if (!password) {
      return res.status(400).json("Password is required");
    }

    const query = email ? { email: email } : { name: name };

    const existingUser = await user.findOne(query);

    if (!existingUser) {
      return res.status(404).json("User Not Found");
    }

    if (existingUser.password !== password) {
      return res.status(401).json("Invalid Password");
    }

    return res.status(200).json({userId :existingUser._id ,message : "User logged in successfully"});
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json("Internal server error");
  } 
};

// const sendOtp = async (email) => {
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: `JobAlign OTP Service`,
//     text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
//   };

//   try {
//     // Send email
//     await transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log(`Error While Sending Otp to the user ${email} \n` + error);
//         return false;
//       }
//       console.log(`OtP sent successfully to : ${email} `);
//     });
//     console.log(`OTP sent successfully to: ${email}`);

//     // Save OTP to DB
//     const existingOtp = await otpSchema.findOne({ email });

//     const expiry = new Date(Date.now() + 10 * 60 * 1000);
//     if (existingOtp) {
//       existingOtp.otp = otp;
//       existingOtp.expiresAt = expiry;
//       await existingOtp.save();
//     } else {
//       const newOtp = new otpSchema({ email, otp, expiresAt: expiry });
//       await newOtp.save();
//     }
//     return true;
//   } catch (error) {
//     console.error("Error in sendOtp1:", error);
//     return false;
//   }
// };

const sendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

 const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your JobAlign Verification Code - Expires in 10 Minutes`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JobAlign OTP Verification</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.5;
                color: #333;
                background-color: #f8fafc;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 480px;
                margin: 20px auto;
                background: white;
                border-radius: 12px;
                padding: 40px 30px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            .header {
                text-align: center;
                margin-bottom: 25px;
            }
            .logo {
                font-size: 22px;
                font-weight: 600;
                color: #1e40af;
                margin-bottom: 5px;
            }
            .otp-container {
                margin: 30px 0;
                text-align: center;
            }
            .otp-code {
                display: inline-block;
                font-size: 36px;
                font-weight: 700;
                letter-spacing: 8px;
                color: #1e40af;
                padding: 15px 20px;
                background: #f1f5f9;
                border-radius: 8px;
                margin: 15px 0;
                font-family: monospace;
            }
            .note {
                color: #64748b;
                font-size: 15px;
                text-align: center;
                margin: 20px 0;
                line-height: 1.6;
            }
            .expiry {
                color: #dc2626;
                font-size: 14px;
                text-align: center;
                margin-top: 10px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #94a3b8;
                font-size: 13px;
            }
            @media (max-width: 600px) {
                .container {
                    padding: 30px 20px;
                    margin: 10px;
                }
                .otp-code {
                    font-size: 28px;
                    letter-spacing: 6px;
                    padding: 12px 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">JobAlign</div>
            </div>
            
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
                <div class="expiry">Valid for 10 minutes only</div>
            </div>
            
            <div class="note">
                <p>Please enter this verification code to complete your request.</p>
                <p>Do not share this code with anyone.</p>
            </div>
            
            <div class="footer">
                <p>If you didn't request this code, you can safely ignore this email.</p>
                <p>© ${new Date().getFullYear()} JobAlign. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`
};

  try {
    // Execute email sending and DB operations in parallel
    const [emailResult, dbResult] = await Promise.allSettled([
      // Email sending promise
      new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(
              `Error While Sending Otp to the user ${email} \n` + error
            );
            reject(error);
          } else {
            console.log(`OTP sent successfully to: ${email}`);
            resolve(info);
          }
        });
      }),

      // Database operation promise
      (async () => {
        const existingOtp = await otpSchema.findOne({ email });

        if (existingOtp) {
          existingOtp.otp = otp;
          existingOtp.expiresAt = expiry;
          await existingOtp.save();
        } else {
          const newOtp = new otpSchema({ email, otp, expiresAt: expiry });
          await newOtp.save();
        }
      })(),
    ]);

    // Check if both operations succeeded
    const emailSuccess = emailResult.status === "fulfilled";
    const dbSuccess = dbResult.status === "fulfilled";

    if (!emailSuccess) {
      console.error("Email sending failed:", emailResult.reason);
    }

    if (!dbSuccess) {
      console.error("Database operation failed:", dbResult.reason);
    }

    // Return true only if both operations succeeded
    return emailSuccess && dbSuccess;
  } catch (error) {
    console.error("Error in sendOtp:", error);
    return false;
  }
};

const verifyOtp = async (email, otp) => {
  try {
    const existingOtp = await otpSchema.findOne({ email });

    if (!existingOtp) {
      return 0; // OTP not found for email
    }

    if (otp === existingOtp.otp) {
      return 1; // OTP verified
    } else {
      return 2; // OTP mismatch
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return 3; // Internal error
  }
};

const sendUserOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).send("Email is Required");
  }
  if (sendOtp(email)) {
    res.status(200).json({ message: "OTP sent successfully" });
  } else {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

const verifyUserOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      res.status(400).send("Email and OTP are required");
    }

    const result = await verifyOtp(email, otp);

    switch (result) {
      case 0:
        return res.status(404).json("OTP not found. Please request a new one.");
      case 1:
        return res.status(200).json("OTP verified successfully.");
      case 2:
        return res.status(401).json("Invalid OTP. Please try again.");
      default:
        return res.status(500).json("Internal server error.");
    }
  } catch (error) {
    console.error("Error in verifyUserOtp:", error);
    return res
      .status(500)
      .json("Something went wrong. Please try again later.");
  }
};

const updatePassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400).send("Email and Password are required");
    }
    const existingUser = await user.find({ email });
    if (existingUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.updateOne({ email }, { $set: { password } });
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const updateUserDetails = async(req, res) =>{
//   const {userId, name , roles, locations } = req.body;
//   try{
//     const user = userSchema.findByIdAndUpdate({
//       name.length > 0 && name : name,
//       roles.length > 0 && userRoles : roles,
//       locations.length > 0 &&  userLocations : locations
//     });
//     res.status(200).send("User Data Updated Successfully")
// }
// catch(err){
//   console.log("Error ", err);
//   res.status(500).send("Internal Server Error ", err);
// }
// }

const updateUserDetails = async (req, res) => {
  try {
    const { userId, name, role, experienceLevel } = req.body;

    if (!userId) {
      return res.status(400).json("Valid userId is required");
    }

    if (!name && !role && !experienceLevel) {
      return res.status(400).json("At least one field is required");
    }

    const existingUser = await userSchema.findById(userId);

    if (!existingUser) {
      return res.status(404).json("User not found");
    }
    const trimmedName = name && name.trim();

    if (trimmedName !== existingUser.name) {
      const nameExists = await userSchema.findOne({
        name: trimmedName,
        _id: { $ne: userId },
      });

      if (nameExists) {
        return res.status(409).json("Username already exists");
      }
    }

    const trimmedExperienceLevel = experienceLevel && experienceLevel.trim();
    const trimmedRole = role && role.trim();

    const updateData = {
      name: trimmedName,
      role: trimmedRole,
      experienceLevel: trimmedExperienceLevel,
    };

    const updatedUser = await userSchema.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    res.status(200).json("User details updated successfully");
  } catch (err) {
    console.error("Error updating user details:", err);
    res.status(500).json("Internal server error");
  }
};

const updateContactDetails = async (req, res) => {
  try {
    const { userId, email, phone, location } = req.body;

    if (!userId) {
      return res.status(400).json("Valid userId is required");
    }

    if (!email && !phone && !location) {
      return res.status(400).json("At least one field is required");
    }

    const existingUser = await userSchema.findById(userId);

    if (!existingUser) {
      return res.status(404).json("User not found");
    }
    const trimmedEmail = email && email.trim();

    if (trimmedEmail !== existingUser.email) {
      const emailExists = await userSchema.findOne({
        email: trimmedEmail,
        _id: { $ne: userId },
      });

      if (emailExists) {
        return res.status(409).json("Email already exists");
      }
    }

    const trimmedLocation = location && location.trim();
    const trimmedphone = phone && phone;

    const updateData = {
      email: trimmedEmail,
      phone: trimmedphone,
      location: trimmedLocation,
    };

    const updatedUser = await userSchema.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    res.status(200).json("User details updated successfully");
  } catch (err) {
    console.error("Error updating user details:", err);
    res.status(500).json("Internal server error");
  }
};

const updatePreferedRoles = async (req, res) => {
  try {
    const { userId, preferedRoles } = req.body;

    if (!userId) {
      return res.status(400).send("User Id is required");
    }
    if (!preferedRoles) {
      return res.status(400).send("Prefered Roles are required");
    }

    console.log(typeof preferedRoles, preferedRoles);

    const updatedUser = await userSchema.findByIdAndUpdate(
      userId,
      { preferedRoles: preferedRoles },
      {
        new: true,
        runValidators: true,
        select: "-password",
      }
    );

    res.status(200).send("Data Updated Successfully");
  } catch (err) {
    console.log("Error : ", err);
    res.status(500).send("Internal Server Error");
  }
};

const updatePreferedLocations = async (req, res) => {
  try {
    const { userId, preferedLocations } = req.body;

    if (!userId) {
      return res.status(400).send("User Id is required");
    }
    if (!preferedLocations) {
      return res.status(400).send("Prefered Locations are required");
    }

    const updatedUser = await userSchema.findByIdAndUpdate(
      userId,
      { preferedLocations: preferedLocations },
      {
        new: true,
        runValidators: true,
        select: "-password",
      }
    );

    res.status(200).send("Data Updated Successfully");
  } catch (err) {
    console.log("Error : ", err);
    res.status(500).send("Internal Server Error");
  }
};

const getUserData = async (req, res) => {
    console.log("Comming for User Data...");

  try {
    const { userId } = req.body;
    if(!userId){
      return res.status(400).send("User Id is required");
    }
    const userData = await userSchema.findById(userId).select("-password");
    res.status(200).send(userData);
  } 
  catch (err) {
    console.log("Error : ", err);
    res.status(500).send("Internal Server Error");
  }
};

const getUserFilters = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json("User ID is required");
    }

    const userFilters = await userSchema.findById(userId).select('preferedLocations preferedRoles').lean(); 
    console.log(userFilters);

    if (!userFilters) {
      return res.status(404).json("User not found");
    }

    return res.status(200).json({
      message: "User filters retrieved successfully",
      data: {
        userId,
        preferredLocations: userFilters.preferedLocations || [],
        preferredRoles: userFilters.preferedRoles || []
      }
    });

  } catch (error) {
    console.error("Error in getUserFilters:", error.message);

    return res.status(500).json("Internal server error");
  }
};


// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await user.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

cron.schedule("0 0 1 * *", async () => {
  try {
    await user.updateMany({}, { $set: { monthlyCount: 10 } });
    console.log("All Monthly Counter fields reset to 10");
  } catch (err) {
    console.error("Error resetting dailyCounter:", err);
  }
});

module.exports = {
  createUser,
  getAllUsers,
  userLogin,
  sendUserOtp,
  verifyUserOtp,
  updatePassword,
  updateUserDetails,
  updatePreferedRoles,
  updatePreferedLocations,
  updateContactDetails,
  getUserData,
  getUserFilters,
};
