const axios = require("axios");
const cron = require("node-cron");
const { LRUCache } = require("lru-cache");
const pdfParse = require("pdf-parse");
const userSchema = require("../models/userSchema");
const resumeSchema = require("../models/resumeSchema");
const analyticResultsSchema = require('../models/analyticsResultsSchema')
const {updateResumeCounter} = require('./resumeController')
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
// const { sendBufferToAffinda } = require("./resumeController");

const Together = require("together-ai");

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_KEY);
const genAI1 = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_KEY_1);

// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const model1 = genAI1.getGenerativeModel({ model: "gemini-1.5-flash" });

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;
const BASE_URL = process.env.ADZUNA_BASE_URL;

const cache = new LRUCache({
  max: 100000,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

// Request queue for controlled concurrency
class RequestQueue {
  constructor(maxConcurrent = 8) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

const requestQueue = new RequestQueue();

// Utility functions
const normalizeString = (str = "") => {
  return String(str)
    .toLowerCase()
    .replace(/[\s\-_]/g, "");
};

const matchesFilter = (filterArray, value) => {
  if (!filterArray || filterArray.length === 0) return true;
  if (!value || value === "Unspecified") return true;
  return filterArray.some((filterVal) =>
    normalizeString(value).includes(normalizeString(filterVal))
  );
};

const matchesCompany = (filterCompanies, jobCompany) => {
  if (!filterCompanies || filterCompanies.length === 0) return true;
  if (!jobCompany) return false;

  const jobNorm = normalizeString(jobCompany);
  return filterCompanies.some(
    (comp) =>
      jobNorm.includes(normalizeString(comp)) ||
      normalizeString(comp).includes(jobNorm)
  );
};

const inferWorkplaceModel = (title = "", description = "", location = "") => {
  const text = `${title} ${description} ${location}`.toLowerCase();

  if (
    /(remote\sonly|fully\sremote|work\sfrom\shome|wfh|remote\sjob)/.test(text)
  ) {
    return "Remote";
  }
  if (/(hybrid|wfo\s+hybrid)/.test(text)) {
    return "Hybrid";
  }
  if (/(on[\s-]?site|office[\s-]?based|in[\s-]?office|wfo)/.test(text)) {
    return "On-site";
  }

  return "On-site";
};

const inferExperienceLevel = (text = "", title = "") => {
  const fullText = `${title} ${text}`.toLowerCase();

  // Explicit "entry level" mentions
  if (/(entry\slevel|junior|0-?1\s*years|fresher)/.test(fullText)) {
    return "Entry Level";
  }

  // Years experience detection
  const yearsExpMatch = fullText.match(/(\d+)\+?\s*years?\s*(experience|exp)/);
  if (yearsExpMatch) {
    const years = parseInt(yearsExpMatch[1]);
    if (years <= 1) return "Entry Level";
    if (years <= 3) return "Mid Level";
    return "Senior Level";
  }

  // Title-based detection
  const titleLevels = {
    junior: "Entry Level",
    senior: "Senior Level",
    lead: "Senior Level",
    principal: "Director",
    manager: "Director",
    director: "Director",
    vp: "Director",
    architect: "Senior Level",
  };

  for (const [keyword, level] of Object.entries(titleLevels)) {
    if (title.toLowerCase().includes(keyword)) return level;
  }

  return "Unspecified";
};

function classifyJobExperience(job) {
  const title = (job.title || "").toLowerCase();
  const description = (job.description || "").toLowerCase();
  const company = job.company?.display_name?.toLowerCase() || "";

  const allText = `${title} ${description}`;

  const seniorTitleKeywords = [
    "lead",
    "senior",
    "sr.",
    "sr ",
    "principal",
    "architect",
    "manager",
    "head of",
    "director",
    "vp",
    "vice president",
    "chief",
    "staff",
    "expert",
    "specialist",
  ];

  if (seniorTitleKeywords.some((keyword) => title.includes(keyword))) {
    return "experienced";
  }

  const fresherKeywords = [
    "fresher",
    "graduate",
    "trainee",
    "intern",
    "entry level",
    "entry-level",
    "junior",
    "jr.",
    "jr ",
    "associate",
    "beginner",
  ];

  if (fresherKeywords.some((keyword) => allText.includes(keyword))) {
    return "fresher";
  }

  const yearPatterns = [
    /(\d+)[\s-]*(?:to|-)[\s-]*(\d+)[\s-]*(?:years?|yrs?)/g,
    /(\d+)\+[\s-]*(?:years?|yrs?)/g,
    /minimum[\s-]*(\d+)[\s-]*(?:years?|yrs?)/g,
    /atleast[\s-]*(\d+)[\s-]*(?:years?|yrs?)/g,
    /(\d+)[\s-]*(?:years?|yrs?)[\s-]*(?:of[\s-]*)?experience/g,
    /experience[\s-]*(?:of[\s-]*)?(\d+)[\s-]*(?:years?|yrs?)/g,
  ];

  const years = [];
  yearPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(allText)) !== null) {
      if (match[1]) years.push(parseInt(match[1]));
      if (match[2]) years.push(parseInt(match[2]));
    }
  });

  if (years.length > 0) {
    const maxYears = Math.max(...years);
    const minYears = Math.min(...years);

    if (minYears >= 3 || maxYears >= 4) return "experienced";
    if (maxYears <= 1) return "fresher";
    if (minYears <= 2 && maxYears <= 3) return "fresher";
  }

  const levelMatch = title.match(/\b(?:ii|iii|iv|v|2|3|4|5)\b/i);
  if (levelMatch) return "experienced";

  const experienceKeywords = [
    "experienced",
    "hands-on experience",
    "hands on experience",
    "proven experience",
    "extensive experience",
    "solid experience",
    "strong experience",
    "deep understanding",
    "expert level",
    "advanced knowledge",
    "proficient in",
    "mastery of",
  ];

  if (experienceKeywords.some((keyword) => description.includes(keyword))) {
    return "experienced";
  }

  return "fresher";
}

const normalizeContractType = (contract_type = "", description = "") => {
  const text = `${contract_type} ${description}`.toLowerCase();

  if (/(consultant|contract\s*basis)/.test(text)) return "Contract";
  if (/(temp|temporary)/.test(text)) return "Temporary";
  if (/(fixed[\s-]?term|fixed[\s-]?duration)/.test(text)) return "Fixed-Term";
  if (/(permanent|full[\s-]?time|ft)/.test(text)) return "Permanent";

  return "Unspecified";
};

const normalizeWorkType = (contract_time = "") => {
  const ct = contract_time.toLowerCase();
  if (/(full|ft)/.test(ct)) return "Full-Time";
  if (/(part|pt)/.test(ct)) return "Part-Time";
  if (/internship/.test(ct)) return "Internship";
  if (/freelance/.test(ct)) return "Freelance";
  return "Unspecified";
};

const normalizeFilters = (filters = {}) => {
  return {
    companies: filters.Companies || filters.companies || [],
    roles: filters.roles || [],
    locations: filters.Locations || filters.locations || [],
    workType: filters.Work_Type || filters.workType || [],
    contractType: filters.Contract_Type || filters.contractType || [],
    experienceLevel: filters.Experience_Level || filters.experienceLevel || [],
    workplaceModel: filters.Workplace_Model || filters.workplaceModel || [],
  };
};

const fetchJob = async (company, role, location, retries = 3, delay = 50) => {
  const key = `${role}|${location}|${company}`;

  if (cache.has(key)) {
    console.log("Cache hit for:", key);
    return cache.get(key);
  }

  return requestQueue.add(async () => {
    // Double-check cache after queue
    if (cache.has(key)) {
      console.log("Cache hit for:", key);
      return cache.get(key);
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await axios.get(BASE_URL, {
          params: {
            app_id: APP_ID,
            app_key: APP_KEY,
            results_per_page: 50,
            what: `${company} ${role}`,
            where: location,
            sort_by: "date",
            max_days_old: 30,
          },
        });

        console.log("API call for:", key);
        const jobs = res.data.results || [];
        cache.set(key, jobs);
        return jobs;
      } catch (err) {
        if (err.response?.status === 429) {
          const waitTime = delay * Math.pow(2, attempt);
          console.warn(
            `429 Too Many Requests for ${key}. Retrying in ${waitTime}ms...`
          );
          await new Promise((res) => setTimeout(res, waitTime));
        } else {
          console.error(`Error fetching ${key}:`, err.message);
          break;
        }
      }
    }
    return [];
  });
};

// const fetchAllJobs = async (filters) => {
//   const normalizedFilters = normalizeFilters(filters);
//   console.log("Processing jobs with filters:", normalizedFilters);

//   const {
//     roles,
//     locations,
//     companies,
//     workType,
//     contractType,
//     experienceLevel,
//     workplaceModel,
//   } = normalizedFilters;

//   // Create all API call promises
//   const apiPromises = [];

//   for (const company of companies) {
//     for (const role of roles) {
//       for (const loc of locations) {
//         apiPromises.push(fetchJob(company, role, loc));
//       }
//     }
//   }

//   // Execute all API calls in parallel
//   const jobArrays = await Promise.all(apiPromises);
//   const allJobs = [];

//   // Process all jobs from all API calls
//   for (const jobs of jobArrays) {
//     for (const job of jobs) {
//       // Extract and normalize job properties
//       const companyName = job.company?.display_name || "";
//       const workplaceModelValue = inferWorkplaceModel(
//         job.title,
//         job.description,
//         job.location?.display_name
//       );
//       const workTypeValue = normalizeWorkType(job.contract_time || "");
//       const contractTypeValue = normalizeContractType(
//         job.contract_type || "",
//         job.description
//       );
//       const experienceLevelValue = classifyJobExperience(job);

//       if (
//         workplaceModel.length > 0 &&
//         !matchesFilter(workplaceModel, workplaceModelValue)
//       ) {
//         continue;
//       }

//       if (workType.length > 0 && !matchesFilter(workType, workTypeValue)) {
//         continue;
//       }

//       if (
//         contractType.length > 0 &&
//         !matchesFilter(contractType, contractTypeValue)
//       ) {
//         continue;
//       }

//       if (
//         experienceLevel.length > 0 &&
//         !matchesFilter(experienceLevel, experienceLevelValue)
//       ) {
//         continue;
//       }

//       // If all filters passed, add to results
//       allJobs.push({
//         title: job.title,
//         company: companyName,
//         location: job.location?.display_name,
//         url: job.redirect_url,
//         created: job.created,
//         category: job.category?.label,
//         description: job.description,
//         salary_is_predicted: job.salary_is_predicted,
//         Workplace_Model: workplaceModelValue,
//         Work_Type: workTypeValue,
//         Contract_Type: contractTypeValue,
//         Experience_Level: experienceLevelValue,
//       });
//     }
//   }

//   return allJobs;
// };

// const fetchJob = async (company, role, location, retries = 3, delay = 50) => {
//   const key = `${role || ''}|${location || ''}|${company || ''}`;

//   if (cache.has(key)) {
//     console.log("Cache hit for:", key);
//     return cache.get(key);
//   }

//   return requestQueue.add(async () => {
//     if (cache.has(key)) {
//       console.log("Cache hit (inside queue) for:", key);
//       return cache.get(key);
//     }

//     for (let attempt = 0; attempt <= retries; attempt++) {
//       try {
//         const query = [company, role].filter(Boolean).join(' ');
//         const res = await axios.get(BASE_URL, {
//           params: {
//             app_id: APP_ID,
//             app_key: APP_KEY,
//             results_per_page: 50,
//             what: query || undefined,
//             where: location || undefined,
//             sort_by: "date",
//             max_days_old: 30,
//           },
//         });

//         const jobs = res.data?.results || [];
//         cache.set(key, jobs);
//         return jobs;
//       }
//       catch (err) {
//         if (err.response?.status === 429) {
//           const waitTime = delay * Math.pow(2, attempt);
//           console.warn(`429 for ${key}, retrying in ${waitTime}ms...`);
//           await new Promise((res) => setTimeout(res, waitTime));
//         }
//          else {
//           console.error(`Error fetching ${key}:`, err.message);
//           break;
//         }
//       }
//     }

//     return [];
//   });
// };

// const fetchAllJobs = async (filters) => {
//   const normalizedFilters = normalizeFilters(filters);
//   console.log("Processing jobs with filters:", normalizedFilters);

//   const {
//     roles,
//     locations,
//     companies,
//     workType,
//     contractType,
//     experienceLevel,
//     workplaceModel,
//   } = normalizedFilters;

//   // Graceful fallback: use empty string to allow broad queries
//   const safeRoles = roles.length ? roles : [""];
//   const safeLocations = locations.length ? locations : [""];
//   const safeCompanies = companies.length ? companies : [""];

//   const apiPromises = [];

//   for (const company of safeCompanies) {
//     for (const role of safeRoles) {
//       for (const location of safeLocations) {
//         apiPromises.push(fetchJob(company, role, location));
//       }
//     }
//   }

//   // Wait for all API responses
//   const jobArrays = await Promise.all(apiPromises);
//   const allJobs = [];

//   for (const jobs of jobArrays) {
//     for (const job of jobs) {
//       const companyName = job.company?.display_name || "";
//       const workplaceModelValue = inferWorkplaceModel(
//         job.title,
//         job.description,
//         job.location?.display_name
//       );
//       const workTypeValue = normalizeWorkType(job.contract_time || "");
//       const contractTypeValue = normalizeContractType(
//         job.contract_type || "",
//         job.description
//       );
//       const experienceLevelValue = classifyJobExperience(job);

//       // Apply all secondary filters
//       if (
//         (workplaceModel.length &&
//           !matchesFilter(workplaceModel, workplaceModelValue)) ||
//         (workType.length && !matchesFilter(workType, workTypeValue)) ||
//         (contractType.length &&
//           !matchesFilter(contractType, contractTypeValue)) ||
//         (experienceLevel.length &&
//           !matchesFilter(experienceLevel, experienceLevelValue))
//       ) {
//         continue;
//       }

//       async function getCompanyLogo(companyName) {
//         const response = await fetch(
//           `https://autocomplete.clearbit.com/v1/companies/suggest?query=${companyName}`
//         );
//         const data = await response.json();

//         if (data.length > 0) {
//           return {companyUrl : data[0].domain, logoUrl : data[0].logo || `https://logo.clearbit.com/${data[0].domain}`};
//         }
//         else {
//           return null;
//         }
//       }

//       var logoUrl = null
//       var companyUrl = null
//       await getCompanyLogo(companyName).then((companyUrl, logoUrl) => {
//         if (logoUrl) {
//           console.log("logoUrl", logoUrl);
//           logoUrl = logo
//         }
//         if(companyUrl){
//           console.log("companyUrl", companyUrl);

//           companyUrl = companyUrl
//         }
//       });

//       // Add valid job
//       allJobs.push({
//         title: job.title,
//         company: companyName,
//         location: job.location?.display_name,
//         url: job.redirect_url,
//         logoUrl: logoUrl,
//         companyUrl: companyUrl,
//         created: job.created,
//         category: job.category?.label,
//         description: job.description,
//         Workplace_Model: workplaceModelValue,
//         Work_Type: workTypeValue,
//         Contract_Type: contractTypeValue,
//         Experience_Level: experienceLevelValue,
//       });
//     }
//   }

//   return allJobs;
// };

// const fetchAllJobs = async (filters) => {
//   const normalizedFilters = normalizeFilters(filters);
//   console.log("Processing jobs with filters:", normalizedFilters);

//   const {
//     roles = [],
//     locations = [],
//     companies = [],
//     workType = [],
//     contractType = [],
//     experienceLevel = [],
//     workplaceModel = [],
//   } = normalizedFilters;

//   const apiPromises = [];

//   // If any of company/role/location are missing, still proceed with defaults
//   const targetCompanies = companies.length ? companies : [""];
//   const targetRoles = roles.length ? roles : [""];
//   const targetLocations = locations.length ? locations : [""];

//   for (const company of targetCompanies) {
//     for (const role of targetRoles) {
//       for (const loc of targetLocations) {
//         apiPromises.push(fetchJob(company, role, loc));
//       }
//     }
//   }

//   const jobArrays = await Promise.all(apiPromises);
//   const allJobs = [];

//   for (const jobs of jobArrays) {
//     for (const job of jobs) {
//       const companyName = job.company?.display_name || "";
//       const workplaceModelValue = inferWorkplaceModel(job.title, job.description, job.location?.display_name);
//       const workTypeValue = normalizeWorkType(job.contract_time || "");
//       const contractTypeValue = normalizeContractType(job.contract_type || "", job.description);
//       const experienceLevelValue = classifyJobExperience(job);

//       if (
//         (workplaceModel.length && !matchesFilter(workplaceModel, workplaceModelValue)) ||
//         (workType.length && !matchesFilter(workType, workTypeValue)) ||
//         (contractType.length && !matchesFilter(contractType, contractTypeValue)) ||
//         (experienceLevel.length && !matchesFilter(experienceLevel, experienceLevelValue))
//       ) {
//         continue;
//       }

//       allJobs.push({
//         title: job.title,
//         company: companyName,
//         location: job.location?.display_name,
//         url: job.redirect_url,
//         created: job.created,
//         category: job.category?.label,
//         description: job.description,
//         salary_is_predicted: job.salary_is_predicted,
//         Workplace_Model: workplaceModelValue,
//         Work_Type: workTypeValue,
//         Contract_Type: contractTypeValue,
//         Experience_Level: experienceLevelValue,
//       });
//     }
//   }

//   const topJobsToEnrich = allJobs.slice(0, 1);
//   const remainingJobs = allJobs.slice(1);

//   const enrichedTopJobs = await Promise.all(
//     topJobsToEnrich.map(async (job) => {
//       try {
//         const aiDetails = await getJobDetailsFromAI(job);
//         return { ...job, ...aiDetails };
//       } catch (err) {
//         console.warn("Enrichment failed, returning original job:", err.message);
//         return job;
//       }
//     })
//   );

//   return [...enrichedTopJobs, ...remainingJobs];
// };

// const fetchAllJobs = async (filters) => {
//   const normalizedFilters = normalizeFilters(filters);
//   console.log("Processing jobs with filters:", normalizedFilters);

//   const {
//     roles,
//     locations,
//     companies,
//     workType,
//     contractType,
//     experienceLevel,
//     workplaceModel,
//   } = normalizedFilters;

//   const apiPromises = [];

//   const effectiveCompanies = companies.length ? companies : [""];
//   const effectiveRoles = roles.length ? roles : [""];
//   const effectiveLocations = locations.length ? locations : [""];

//   for (const company of effectiveCompanies) {
//     for (const role of effectiveRoles) {
//       for (const loc of effectiveLocations) {
//         apiPromises.push(fetchJob(company, role, loc));
//       }
//     }
//   }

//   const jobArrays = await Promise.all(apiPromises);
//   const flatJobs = jobArrays.flat();
//   const enrichedJobs = [];

//   for (const job of flatJobs) {
//     const companyName = job.company?.display_name || "";
//     const workplaceModelValue = inferWorkplaceModel(job.title, job.description, job.location?.display_name);
//     const workTypeValue = normalizeWorkType(job.contract_time || "");
//     const contractTypeValue = normalizeContractType(job.contract_type || "", job.description);
//     const experienceLevelValue = classifyJobExperience(job);

//     // Apply filters
//     if (
//       (workplaceModel.length && !matchesFilter(workplaceModel, workplaceModelValue)) ||
//       (workType.length && !matchesFilter(workType, workTypeValue)) ||
//       (contractType.length && !matchesFilter(contractType, contractTypeValue)) ||
//       (experienceLevel.length && !matchesFilter(experienceLevel, experienceLevelValue))
//     ) continue;

//     const enriched = await getJobDetailsFromAI(job);
//     enrichedJobs.push({
//       title: job.title,
//       company: companyName,
//       location: job.location?.display_name,
//       url: job.redirect_url,
//       created: job.created,
//       category: job.category?.label,
//       description: job.description,
//       salary_is_predicted: job.salary_is_predicted,
//       Workplace_Model: workplaceModelValue,
//       Work_Type: workTypeValue,
//       Contract_Type: contractTypeValue,
//       Experience_Level: experienceLevelValue,
//       skills: enriched.skills,
//       responsibilities: enriched.responsibilities,
//     });
//   }

//   return enrichedJobs;
// };

// const getJobDetailsFromAI = async (jobObject, retries = 3) => {
//       const prompt = `You are an expert technical recruiter specializing in software engineering roles. Analyze the provided job posting and extract specific technical skills and core responsibilities.

// **Job Data:**
// ${JSON.stringify(jobObject, null, 2)}

// **CRITICAL INSTRUCTIONS:**

// **For Skills - Extract ONLY specific technical skills like:**
// - Programming languages, Frameworks, Databases, Cloud platforms, Tools & Technologies, Technical concepts
// - NO soft skills or business domain knowledge
// - Each skill must be 1-2 words maximum

// **For Responsibilities - Extract core job duties:**
// - Start each with action verbs (Design, Develop, Build, Implement, etc.)
// - Focus on what the person will actually DO day-to-day
// - 8-15 words per responsibility
// - Avoid vague statements

// - At max 8-10 skills and 5-8 responsibilities

// **Output Format (JSON only):**
// \`\`\`json
// {
//   "skills": ["skill-1", "skill-2", "skill-3", "skill-4", "skill-5"],
//   "responsibilities": ["responsibility-1", "responsibility-2"]
// }
// \`\`\``;

//   for (let attempt = 0; attempt <= retries; attempt++) {
//     try {
//       const result = await model.generateContent(prompt);
//       const response = await result.response;
//       const text = response.text();

//       const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/) || [null, text];
//       const jsonStr = jsonMatch[1] || text;
//       return JSON.parse(jsonStr.trim());
//     } catch (err) {
//       const retryDelayMatch = err.message.match(/retryDelay":"(\d+)s/);
//       const delaySec = retryDelayMatch ? parseInt(retryDelayMatch[1], 10) : 2;

//       console.warn(`Gemini API 429 - waiting ${delaySec}s before retrying...`);
//       await new Promise(res => setTimeout(res, delaySec * 1000));
//     }
//   }

//   console.error("Failed to enrich after retries");
//   return { skills: [], responsibilities: [] };
// };

// Company logo service without caching (for Express backend)
class CompanyLogoService {
  constructor() {
    this.rateLimitDelay = 50; // 50ms between requests to avoid rate limiting
    this.lastRequestTime = 0;
    this.pendingRequests = new Map(); // Only track pending requests to avoid duplicates
  }

  async getCompanyLogo(companyName) {
    if (!companyName) return { logoUrl: null, companyUrl: null };

    const normalizedName = companyName.toLowerCase().trim();

    // Return pending request if already in progress (avoid duplicate API calls in same batch)
    if (this.pendingRequests.has(normalizedName)) {
      return this.pendingRequests.get(normalizedName);
    }

    // Create new request with rate limiting
    const request = this.fetchWithRateLimit(normalizedName);
    this.pendingRequests.set(normalizedName, request);

    try {
      const result = await request;
      return result;
    } catch (error) {
      console.warn(`Failed to fetch logo for ${companyName}:`, error.message);
      return { logoUrl: null, companyUrl: null };
    } finally {
      this.pendingRequests.delete(normalizedName);
    }
  }

  async fetchWithRateLimit(companyName) {
    // Implement simple rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const response = await fetch(
        `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(
          companyName
        )}`,
        {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const company = data[0];
        return {
          logoUrl:
            company.logo || `https://logo.clearbit.com/${company.domain}`,
          companyUrl: company.domain,
        };
      }

      return { logoUrl: null, companyUrl: null };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async batchFetchLogos(companyNames, concurrencyLimit = 8) {
    const uniqueNames = [...new Set(companyNames.filter(Boolean))];

    if (uniqueNames.length === 0) {
      return new Map();
    }

    const batches = [];
    for (let i = 0; i < uniqueNames.length; i += concurrencyLimit) {
      batches.push(uniqueNames.slice(i, i + concurrencyLimit));
    }

    const results = new Map();

    for (const batch of batches) {
      const batchPromises = batch.map(async (name) => {
        const result = await this.getCompanyLogo(name);
        return [name.toLowerCase().trim(), result];
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(([name, result]) => {
        results.set(name, result);
      });
    }

    return results;
  }
}

const fetchAllJobs = async (filters) => {
  const startTime = Date.now();

  try {
    const normalizedFilters = normalizeFilters(filters);
    console.log("Processing jobs with filters:", normalizedFilters);

    const {
      roles,
      locations,
      companies,
      workType,
      contractType,
      experienceLevel,
      workplaceModel,
    } = normalizedFilters;

    const safeRoles = roles.length ? roles : [""];
    const safeLocations = locations.length ? locations : [""];
    const safeCompanies = companies.length ? companies : [""];

    const MAX_CONCURRENT_REQUESTS = 12;
    const jobFetchPromises = [];

    for (const company of safeCompanies) {
      for (const role of safeRoles) {
        for (const location of safeLocations) {
          jobFetchPromises.push(() =>
            fetchJob(company, role, location).catch((error) => {
              console.warn(
                `Failed to fetch jobs for ${company}/${role}/${location}:`,
                error.message
              );
              return [];
            })
          );
        }
      }
    }

    console.log(`Executing ${jobFetchPromises.length} job fetch requests...`);

    const jobArrays = await executeWithConcurrencyLimit(
      jobFetchPromises,
      MAX_CONCURRENT_REQUESTS
    );

    const validJobs = [];
    const companyNames = new Set();

    for (const jobs of jobArrays) {
      if (!Array.isArray(jobs)) continue;

      for (const job of jobs) {
        if (!job || typeof job !== "object") continue;

        const companyName = job.company?.display_name || "";

        const workplaceModelValue = inferWorkplaceModel(
          job.title,
          job.description,
          job.location?.display_name
        );
        const workTypeValue = normalizeWorkType(job.contract_time || "");
        const contractTypeValue = normalizeContractType(
          job.contract_type || "",
          job.description
        );
        const experienceLevelValue = classifyJobExperience(job);

        if (
          (workplaceModel.length &&
            !matchesFilter(workplaceModel, workplaceModelValue)) ||
          (workType.length && !matchesFilter(workType, workTypeValue)) ||
          (contractType.length &&
            !matchesFilter(contractType, contractTypeValue)) ||
          (experienceLevel.length &&
            !matchesFilter(experienceLevel, experienceLevelValue))
        ) {
          continue;
        }

        validJobs.push({
          job,
          companyName,
          workplaceModelValue,
          workTypeValue,
          contractTypeValue,
          experienceLevelValue,
        });

        if (companyName) {
          companyNames.add(companyName);
        }
      }
    }

    console.log(
      `Found ${validJobs.length} valid jobs from ${companyNames.size} unique companies`
    );

    const logoService = new CompanyLogoService();
    const logoResults = await logoService.batchFetchLogos([...companyNames]);

    const allJobs = validJobs
      .map(
        ({
          job,
          companyName,
          workplaceModelValue,
          workTypeValue,
          contractTypeValue,
          experienceLevelValue,
        }) => {
          const logoData = logoResults.get(
            companyName.toLowerCase().trim()
          ) || {
            logoUrl: null,
            companyUrl: null,
          };
          // console.log(job);

          return {
            uniqueId: job.id,
            title: job.title,
            company: companyName,
            location: job.location?.display_name || null,
            url: job.redirect_url,
            logoUrl: logoData.logoUrl,
            companyUrl: logoData.companyUrl,
            created: job.created,
            category: job.category?.label || null,
            description: job.description,
            Workplace_Model: workplaceModelValue,
            Work_Type: workTypeValue,
            Contract_Type: contractTypeValue,
            Experience_Level: experienceLevelValue,
          };
        }
      );

    const endTime = Date.now();
    console.log(
      `Successfully processed ${allJobs.length} jobs in ${
        endTime - startTime
      }ms`
    );

    return allJobs;
  } catch (error) {
    console.error("Error in fetchAllJobs:", error);
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }
};

async function executeWithConcurrencyLimit(promiseFunctions, limit) {
  const results = [];
  const executing = [];

  for (const promiseFunction of promiseFunctions) {
    const promise = promiseFunction().then((result) => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });

    results.push(promise);
    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

const getFilteredJobs = async (req, res) => {
  try {
    let { userId, filters } = req.body;
    console.log("Received raw filters:", filters);

    if (
      !filters ||
      !filters.roles?.length ||
      !(filters.Locations?.length || filters.locations?.length)
    ) {
      const user = await userSchema.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      filters = {
        ...filters,
        roles: user.preferedRoles || [],
        Locations: user.preferedLocations || [],
      };
    }

    const result = await fetchAllJobs(filters);
    return res.status(200).json({
      count: result.length,
      jobs: result,
    });
  } catch (err) {
    console.error("Error fetching filtered jobs:", err);
    return res.status(500).json({
      error: "Failed to fetch jobs.",
      details: err.message,
    });
  }
};

const getJobDetails = async (req, res) => {
  try {
    const jobObject = req.body;
    const prompt = `You are an expert technical recruiter specializing in software engineering roles. Analyze the provided job posting and extract specific technical skills and core responsibilities.

**Job Data:**
${JSON.stringify(jobObject, null, 2)}

**CRITICAL INSTRUCTIONS:**

**For Skills - Extract ONLY specific technical skills like:**
- Programming languages, Frameworks, Databases, Cloud platforms, Tools & Technologies, Technical concepts
- NO soft skills or business domain knowledge
- Each skill must be 1-2 words maximum

**For Responsibilities - Extract core job duties:**
- Start each with action verbs (Design, Develop, Build, Implement, etc.)
- Focus on what the person will actually DO day-to-day
- 8-15 words per responsibility
- Avoid vague statements

- At max 8-10 skills and 5-8 responsibilities

**Output Format (JSON only):**
\`\`\`json
{
  "skills": ["skill-1", "skill-2", "skill-3", "skill-4", "skill-5"],
  "responsibilities": ["responsibility-1", "responsibility-2"]
}
\`\`\``;

    const result = await model1.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    try {
      const jsonMatch = analysis.match(/```json\s*([\s\S]*?)\s*```/) ||
        analysis.match(/```\s*([\s\S]*?)\s*```/) || [null, analysis];
      const jsonStr = jsonMatch[1] || analysis;
      parsedAnalysis = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(500).json("Failed to parse AI response as JSON");
    }

    if (!parsedAnalysis.skills || !parsedAnalysis.responsibilities) {
      return res.status(500).json({
        error: "Invalid response structure",
        response: parsedAnalysis,
      });
    }

    res.status(200).json(parsedAnalysis);
  } catch (error) {
    console.error("Error in main function:", error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const matchResume = async (jobObject, resumeContent) => {
  try {
    // const prompt = `You are an expert career compatibility analyst. Your task is to compare a candidate's resume content with a given job object and assess their compatibility.

    // **Input:**
    // You will receive two variables:
    // 1.  \`jobObject\`: A JSON object containing job details.
    // 2.  \`resumeContent\`: A string containing the candidate's full resume text.

    // **Output Format:**
    // Your response MUST be a single JSON object, strictly following this structure:
    // \`\`\`json
    // {
    //   "matchPercentage": number,
    //   "matchedSkills": [],
    //   "unmatchedSkills": [],
    //   "improvementSuggestions": []
    // }
    // \`\`\`

    // **Output Constraints (CRITICAL for accuracy AND adherence):**
    // 1.  **\`matchPercentage\`**: A numerical value.
    //     * **ABSOLUTELY CRITICAL: This value MUST be between 30 and 95 (inclusive) based on the compatibility.**
    //     * **Regardless of your internal compatibility calculation, if it falls below 30, YOU MUST output 30. If it exceeds 95, YOU MUST output 95.** This strict adherence to the range is essential for the accuracy and validity of the final output format.
    //     * The underlying assessment (why the match is low or high) should still be accurate, but the *final output number for this field* must conform to the specified range.
    // 2.  **\`matchedSkills\`**:
    //     * Must be an array of strings.
    //     * Each string MUST represent a *technical skill* found in the \`resumeContent\` that is highly relevant to the \`jobObject\`.
    //     * **CRITICAL: Each skill string MUST be 1 or 2 words ONLY.** For example, use "Java", "Python", "C", "React.js", "Node.js". **DO NOT** use "Java Programming", "Python Programming", "C Programming", or other multi-word descriptors.
    //     * The array MUST contain **at most 10 skills**. Prioritize the *most important* matched technical skills from the job description.
    // 3.  **\`unmatchedSkills\`**:
    //     * Must be an array of strings.
    //     * Each string MUST represent a *technical skill or a key technical/methodological/operational requirement* mentioned or clearly implied in the \`jobObject\` that is **not explicitly present or strongly demonstrated** in the \`resumeContent\`.
    //     * **CRITICAL: Each skill string MUST be 1 or 2 words ONLY.** For example, use "Java", "Python", "C", "React.js", "Node.js". **DO NOT** use "Java Programming", "Python Programming", "C Programming", or other multi-word descriptors.
    //     * The array MUST contain **at most 10 skills**. Prioritize the *most important* unmatched requirements.
    // 4.  **\`improvementSuggestions\`**:
    //     * Must be an array of strings.
    //     * Each string MUST be a concise suggestion for the candidate to improve their fit for similar roles.
    //     * Each suggestion MUST be **at most 10 words**.
    //     * **The array MUST contain AT MOST 5-8 suggestions. Select ONLY the top 4-6 most crucial suggestions.**

    // **Accuracy Requirement:**
    // Provide the most accurate results possible, with absolutely no compromise on the detailed constraints and the precision of the compatibility assessment. Focus solely on the provided \`resumeContent\` and \`jobObject\` for your analysis.

    // JobObject = ${JSON.stringify(jobObject)},
    // ResumeContent = ${resumeContent}

    // `;

    const prompt = `You are an expert career compatibility analyst. Your task is to compare a candidate's resume with a given job description and return ONLY a JSON object with the following structure:

{
  "matchPercentage": number,
  "matchedSkills": [string],
  "unmatchedSkills": [string],
  "improvementSuggestions": [string]
}

**Input:**
- jobObject: ${JSON.stringify(jobObject)}
- resumeContent: ${resumeContent}

**Instructions:**
1. Analyze the technical skills, tools, and requirements from the job description.
2. Compare them to the explicit skills and experience in the resume.
3. Return ONLY the JSON result—no explanation, markdown, or additional text.
4. Format strictly as per the schema:
   - matchPercentage: Number between 0-100.
   - matchedSkills: At most 10 strings, each 1-2 words.
   - unmatchedSkills: At most 6 strings, each 1-2 words.
   - improvementSuggestions: 4-6 concise suggestions under 10 words.

**Important:** Do NOT include any extra content such as reasoning, comments, markdown, or formatting. Output only the JSON object.`;

    // const result = await model.generateContent(prompt);
    // const response = await result.response;
    // const analysis = response.text();

    const response = await together.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    });

    const analysis = response.choices[0].message.content;
    // console.log("This is Result : ", analysis);
    // console.log(prompt);

    // console.log("AI Analysis Raw Data:", analysis);

    // let parsedAnalysis;
    // try {
    //   // Try multiple JSON extraction methods
    //   let jsonStr = analysis;

    //   // Method 1: Extract from code blocks
    //   const jsonMatch = analysis.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    //   if (jsonMatch) {
    //     jsonStr = jsonMatch[1];
    //   }

    //   // Method 2: Find JSON object pattern
    //   const jsonObjectMatch = analysis.match(/\{[\s\S]*\}/);
    //   if (!jsonMatch && jsonObjectMatch) {
    //     jsonStr = jsonObjectMatch[0];
    //   }

    //   parsedAnalysis = JSON.parse(jsonStr.trim());
    // }
    //  catch (parseError) {
    //   console.error("JSON parsing error:", parseError);
    //   console.error("Raw analysis:", analysis);

    //   // Return a default structure instead of empty string
    //   return {
    //     matchPercentage: 0,
    //     matchedSkills: [],
    //     unmatchedSkills: [],
    //     improvementSuggestions: [
    //       "Unable to analyze resume at this time. Please try again.",
    //     ],
    //     error: "JSON parsing failed",
    //   };
    // }

    // // Validate response structure with more comprehensive checks
    // if (
    //   typeof parsedAnalysis !== "object" ||
    //   parsedAnalysis === null ||
    //   typeof parsedAnalysis.matchPercentage !== "number" ||
    //   !Array.isArray(parsedAnalysis.matchedSkills) ||
    //   !Array.isArray(parsedAnalysis.unmatchedSkills) ||
    //   !Array.isArray(parsedAnalysis.improvementSuggestions)
    // ) {
    //   console.log("Invalid Response Structure:", parsedAnalysis);

    //   // Return a default structure instead of empty string
    //   return {
    //     matchPercentage: 0,
    //     matchedSkills: [],
    //     unmatchedSkills: [],
    //     improvementSuggestions: [
    //       "Invalid analysis response. Please try again.",
    //     ],
    //     error: "Invalid response structure",
    //   };
    // }

    // // Ensure percentage is within valid range
    // parsedAnalysis.matchPercentage = Math.max(
    //   0,
    //   Math.min(100, parsedAnalysis.matchPercentage)
    // );

    try {
      const rr = JSON.parse(analysis.trim());
      console.log(rr);
      return rr;
    } catch (error) {
      console.error("JSON parsing error:", error);
      console.error("Raw analysis:", jsonStr);
      return {
        matchPercentage: 0,
        matchedSkills: [],
        unmatchedSkills: [],
        improvementSuggestions: ["JSON parsing failed. Please try again."],
        error: "JSON parsing failed",
      };
    }
  } catch (error) {
    console.error("Error in matchResume function:", error);
    return {
      matchPercentage: 0,
      matchedSkills: [],
      unmatchedSkills: [],
      improvementSuggestions: [
        "Technical error occurred during analysis. Please try again.",
      ],
      error: error.message,
    };
  }
};

const getMatchAnalyticsFromMain = async (req, res) => {
  try {
    // console.log(req.body);
    if (!req.body.userId || !req.body.jobObject) {
      return res.status(400).json({
        message: "Missing required fields: userId and jobObject",
      });
    }

    const { userId, jobObject } = req.body;

    // const jobAnalytics = await analyticResultsSchema.find({
    //   userId : userId ,
    //   jobId : jobObject.uniqueId,
    // })

    // console.log(jobAnalytics);

    // if(jobAnalytics.length > 0){
    //   return res.status(200).json(JSON.parse(jobAnalytics[0].result))
    // }


    const resumeData = await resumeSchema.find({ userId: userId });

    if (!resumeData || resumeData.length === 0) {
      return res.status(404).json({
        message: "Resume not found for the provided user ID",
      });
    }

    const matchResult = await matchResume(jobObject, resumeData[0].resume);

    if (matchResult.error) {
      return res.status(500).json({
        message: "Error while matching resume with job description",
        details: matchResult.error,
        result: matchResult,
      });
    }

    // await analyticResultsSchema.insertOne({
    //   userId: userId ,
    //   jobId: jobObject.uniqueId ,
    //   result: JSON.stringify(matchResult),
    //   });
    res.status(200).json(matchResult);
  } catch (error) {
    console.error("Error in getMatchAnalytics function:", error);
    res.status(500).json({
      message: "Internal server error during resume analysis",
      error: error.message,
    });
  }
};

const getMatchAnalyticsFromTemp = async (req, res) => {
  try {
    const { userId, jobObject } = req.body;
    const resumeFile = req.file;

    if (!userId || !resumeFile || !jobObject) {
      return res.status(400).json({ error: "Missing required fields" });
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

    // const resumeContent = await sendBufferToAffinda( resumeFile.buffer, resumeFile.originalname, resumeFile.mimetype);
    const resumeContent = await pdfParse(resumeFile.buffer);

    if (resumeContent.status === "rejected") {
      return res.status(500).json({
        error: "Failed to process resume",
        details: resumeContent.reason?.message,
      });
    }

    const finalMatchResult = await matchResume(
      jobObject,
      JSON.stringify(resumeContent)
    );

    console.log(finalMatchResult);

    // if (finalMatchResult?.error) {
    //   return res.status(500).json({
    //     error: "Matching failed",
    //     details: finalMatchResult.error,
    //   });
    // }

    await updateResumeCounter(userId);
    res.status(200).send(finalMatchResult);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Cache cleanup job
cron.schedule("09 00 * * *", () => {
  cache.clear();
  console.log("Cache cleared at 3:00 AM");
});

module.exports = {
  getFilteredJobs,
  getJobDetails,
  getMatchAnalyticsFromMain,
  getMatchAnalyticsFromTemp,
};
