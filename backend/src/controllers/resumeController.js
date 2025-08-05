const Resume = require("../models/resumeSchema");
const cloudinary = require("cloudinary").v2;
const FormData = require("form-data");
const axios = require("axios");
const pdfParse = require("pdf-parse");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const userSchema = require("../models/userSchema");
const atsSchema = require("../models/ATSSchema");
const analyticResultsSchema = require('../models/analyticsResultsSchema')

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Combined function: Upload resume and get viewing URL
async function uploadToCloudinary(
  userId,
  buffer,
  filename,
  pageNumber = 1,
  width = 800
) {
  const safeFilename = filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_");

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          public_id: `resumes/${userId}_${safeFilename}_${Date.now()}`,
          overwrite: false,
          access_mode: "public",
          tags: [`user_${userId}`, "resume"],
          context: {
            alt: `Resume for user ${userId}`,
            source: "mobile_upload",
          },
        },
        (error, result) => {
          if (error) return reject(error);

          const viewingUrl = cloudinary.url(result.public_id, {
            resource_type: "image",
            secure: true,
            format: "jpg",
            page: pageNumber,
            width: width,
            quality: "auto:good",
            fetch_format: "auto",
            dpr: "auto",
          });

          resolve(viewingUrl);
        }
      )
      .end(buffer);
  });
}

// Send resume file buffer to Affinda for parsing
// async function sendBufferToAffinda(buffer, filename, mimetype) {
//   const form = new FormData();
//   form.append("file", buffer, {
//     filename,
//     contentType: mimetype,
//   });

//   const response = await axios.post(
//     "https://api.affinda.com/v1/resumes",
//     form,
//     {
//       headers: {
//         ...form.getHeaders(),
//         Authorization: `Bearer ${process.env.AFFINDA_API_KEY}`,
//       },
//     }
//   );

//   const documentId = response.data.meta.identifier;
//   if (!documentId) throw new Error("Affinda did not return a document ID");

//   return response.data;
// }

// Save parsed resume to MongoDB
async function saveResumeContent(userId, fileName, data, resumeUrl) {
  const resume = JSON.stringify(data);

  try {
    const existingResume = await Resume.findOne({ userId });
    if (existingResume) {
      existingResume.fileName = fileName;
      existingResume.resume = resume;
      existingResume.resumeUrl = resumeUrl;
      existingResume.save();
      return existingResume;
    } else {
      const newResume = new Resume({
        userId,
        fileName,
        resume,
        resumeUrl,
      });
      await newResume.save();
      return newResume;
    }
  } catch (error) {
    console.error("Error saving resume content:", error);
    throw new Error("Failed to save resume content");
  }
}

// Main controller function
const addResume = async (req, res) => {
  console.log(req.body);
  try {
    console.log(req.body);
    const userId = req.body.userId;
    const file = req.file;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    if (!file) {
      return res.status(400).json({ error: "Missing resume file" });
    }
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.monthlyCount <= 0) {
      return res
        .status(400)
        .json({ error: "User has reached resume upload limit" });
    }

    // Parallel Cloudinary + Affinda
    // const [resumeUrl, parsedResume] = await Promise.all([
    //   uploadToCloudinary(userId, file.buffer, file.originalname),
    //   // sendBufferToAffinda(file.buffer, file.originalname, file.mimetype),
    //   pdfParse(file.buffer),
    // ]);

    // const [savedResume, updatedUser] = await Promise.all([
    //   saveResumeContent(userId, file.originalname, parsedResume),
    //   userSchema.findByIdAndUpdate(
    //     userId,
    //     { $set: { resumeUrl: resumeUrl }, $set: { atsScore: atsScore.percentage } },
    //     { new: true }
    //   ),
    // ]);

    const [resumeUrl, parsedResume] = await Promise.all([
      uploadToCloudinary(userId, file.buffer, file.originalname),
      // sendBufferToAffinda(file.buffer, file.originalname, file.mimetype),
      pdfParse(file.buffer),
    ]);

    // console.log(resumeUrl);

    const atsScore = await analyzeResumeWithATS(parsedResume);

    await Promise.all([
      saveResumeContent(userId, file.originalname, parsedResume, resumeUrl),
      userSchema.findByIdAndUpdate(
        userId,
        {
          $set: {
            resumeUrl: resumeUrl,
            atsScore: atsScore.percentage,
          },
        },
        { new: true }
      ),
      saveAnalysisResult(userId, atsScore),
      updateResumeCounter(userId),
    ]);
    // console.log(resumeUrlSave);

    return res
      .status(200)
      .json("Resume uploaded, parsed, and saved successfully");
  } catch (err) {
    console.error("[Resume Upload Error]", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
};

// const checkATS = async (req, res) => {
//   const file = req.file;
//   const userId = req.body.userId;
//   const resumeText = await pdfParse(file.buffer);

//   try {
//     const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze ONLY resumes and CVs for technical roles. For any non-resume content, respond with "This is not a resume/CV content."

// For resume/CV content, provide analysis in this exact JSON format:

// {
//   "percentage": [number 0-100],
//   "strengths": [
//     "[strength - 1]",
//     "[strength - 2]"...
//   ],
//   "issues": [
//     "[ ATS/formatting/technical issue - 1]",
//     "[ ATS/formatting/technical issue - 2]"...
//   ],
//   "improvements": [
//     "[improvement -1]",
//     "[improvement -2]"....
//   ]
// }

// Rules:
// - Only analyze resumes/CVs, reject other content types
// - Be SPECIFIC and CLEAR in every point
// - Each point must be exactly 10 words or less but highly detailed
// - Provide atmost 6 points per section
// - Mention exact technologies, frameworks, versions when possible
// - ATS score based on parsing issues, keyword optimization, technical depth
// - Identify specific formatting problems affecting ATS parsing
// - Focus on concrete technical skills gaps and improvements
// - Avoid generic advice, provide actionable specific recommendations

// Resume Content: ${resumeText.text}
// `;

//     const result = await model.generateContent(prompt);

//     function extractAndParseJson(responseString) {
//       try {
//         // Extract JSON from markdown code blocks
//         const jsonMatch = responseString.match(/```json\s*([\s\S]*?)\s*```/);

//         if (jsonMatch) {
//           const jsonString = jsonMatch[1].trim();
//           return JSON.parse(jsonString);
//         } else {
//           // Try to find JSON without code blocks
//           const jsonStart = responseString.indexOf("{");
//           const jsonEnd = responseString.lastIndexOf("}") + 1;

//           if (jsonStart !== -1 && jsonEnd > jsonStart) {
//             const jsonString = responseString.substring(jsonStart, jsonEnd);
//             return JSON.parse(jsonString);
//           }
//         }

//         return null;
//       } catch (error) {
//         console.error("Error extracting JSON:", error);
//         return null;
//       }
//     }

//     const parsedJson = extractAndParseJson(result.response.text());
//     if (parsedJson === null) {
//       res.status(201).json("Please Provide a Valid Resume");
//     } else {
//       res.status(200).json(parsedJson);
//     }
//   } catch (error) {
//     console.error("Error in main function:", error);
//     res
//       .status(500)
//       .json({ error: "Internal server error", message: error.message });
//   }
// };

const analyzeResumeWithATS = async (resumeText) => {
  try {
    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze ONLY resumes and CVs for technical roles. For any non-resume content, respond with "This is not a resume/CV content."

For resume/CV content, provide analysis in this exact JSON format:

{
  "percentage": [number 0-100],
  "strengths": [
    "[strength - 1]",
    "[strength - 2]"...
  ],
  "issues": [
    "[ ATS/formatting/technical issue - 1]",
    "[ ATS/formatting/technical issue - 2]"...
  ],
  "improvements": [
    "[improvement -1]",
    "[improvement -2]"....
  ]
}

Rules:
- Only analyze resumes/CVs, reject other content types
- Be SPECIFIC and CLEAR in every point
- Each point must be exactly 10 words or less but highly detailed
- Provide atmost 6 points per section
- Mention exact technologies, frameworks, versions when possible
- ATS score based on parsing issues, keyword optimization, technical depth
- Identify specific formatting problems affecting ATS parsing
- Focus on concrete technical skills gaps and improvements
- Avoid generic advice, provide actionable specific recommendations

Resume Content: ${resumeText.text}
`;

    const result = await model.generateContent(prompt);

    function extractAndParseJson(responseString) {
      try {
        // Extract JSON from markdown code blocks
        const jsonMatch = responseString.match(/```json\s*([\s\S]*?)\s*```/);

        if (jsonMatch) {
          const jsonString = jsonMatch[1].trim();
          return JSON.parse(jsonString);
        } else {
          // Try to find JSON without code blocks
          const jsonStart = responseString.indexOf("{");
          const jsonEnd = responseString.lastIndexOf("}") + 1;

          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            const jsonString = responseString.substring(jsonStart, jsonEnd);
            return JSON.parse(jsonString);
          }
        }

        return null;
      } catch (error) {
        console.error("Error extracting JSON:", error);
        return null;
      }
    }

    const parsedJson = extractAndParseJson(result.response.text());
    return parsedJson;
  } catch (error) {
    console.error("Error in main function:", error);
    return { message: "Internal Server Error", error: error.message };
  }
};

const updateResumeCounter = async (userId) => {
  await userSchema.findByIdAndUpdate(userId, {
    $inc: { monthlyCount: -1 },
  });
};

const saveAnalysisResult = async (userId, analysisResult) => {
  try {
    const ats = await atsSchema.findOneAndUpdate(
      { userId: userId },
      {
        userId: userId,
        percentage: analysisResult.percentage,
        strengths: analysisResult.strengths,
        issues: analysisResult.issues,
        improvements: analysisResult.improvements,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return ats;
  } catch (error) {
    console.error("Error saving analysis result:", error);
    throw error;
  }
};
const extractAndParseJson = (responseString) => {
  try {
    // Extract JSON from markdown code blocks
    const jsonMatch = responseString.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
      const jsonString = jsonMatch[1].trim();
      return JSON.parse(jsonString);
    } else {
      // Try to find JSON without code blocks
      const jsonStart = responseString.indexOf("{");
      const jsonEnd = responseString.lastIndexOf("}") + 1;

      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonString = responseString.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonString);
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting JSON:", error);
    return null;
  }
};

const getAtsAnalysis = async (req, res) => {
  const file = req.file;
  const userId = req.body.userId;
  const jobId = req.body.jobId;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  if (!userId) {
    return res.status(400).json({ error: "User Id is required" });
  }
  
  const user = await userSchema.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.monthlyCount <= 0) {
    return res.status(400).json({ error: "User has reached resume upload limit" });
  }

  try {
    const resumeText = await pdfParse(file.buffer);
    console.log(resumeText);

    const analysisResult = await analyzeResumeWithATS(resumeText);
    if (analysisResult === null) {
      return res.status(400).json({ error: "Please provide a valid resume" });
    }

    await Promise.all([
      saveAnalysisResult(userId, analysisResult),
      updateResumeCounter(userId),
    ]);
    return res.status(200).json(analysisResult);
  } catch (error) {
    console.error("Error in ATS analysis:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

module.exports = { addResume, getAtsAnalysis, updateResumeCounter };
