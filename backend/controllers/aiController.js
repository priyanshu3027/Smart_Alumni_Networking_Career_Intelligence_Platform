const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Job = require('../models/Job');
const fs = require('fs');
const path = require('path');

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const mockAIResponse = (type) => {
  const mocks = {
    resume: {
      atsScore: 72, 
      strengths: ['Clear work experience section', 'Good skills listing', 'Quantified achievements'],
      improvements: ['Add a professional summary', 'Include more keywords matching job descriptions', 'Add certifications section', 'Improve formatting consistency'],
      missingSkills: ['Docker', 'Kubernetes', 'AWS', 'System Design'],
      suggestions: 'Your resume shows solid technical skills. Consider adding a professional summary at the top and quantifying your achievements with metrics. Tailor each application by matching job keywords.'
    },
    jobRecommendations: [
      { title: 'Full Stack Developer', company: 'TCS', location: 'Noida', match: 85, reason: 'Matches your MERN stack skills' },
      { title: 'React Developer', company: 'Wipro', location: 'Bangalore', match: 78, reason: 'Strong alignment with frontend expertise' },
      { title: 'Node.js Engineer', company: 'Infosys', location: 'Hyderabad', match: 71, reason: 'Backend skills match job requirements' }
    ],
    careerRoadmap: {
      goal: 'Full Stack Developer',
      phases: [
        { phase: 'Foundation (0-3 months)', topics: ['JavaScript ES6+', 'React Hooks', 'Node.js', 'REST APIs'], resources: ['MDN Web Docs', 'freeCodeCamp', 'The Odin Project'] },
        { phase: 'Intermediate (3-6 months)', topics: ['MongoDB', 'Express.js', 'Authentication', 'Deployment'], resources: ['MongoDB University', 'Heroku Docs', 'Udemy MERN Course'] },
        { phase: 'Advanced (6-12 months)', topics: ['System Design', 'Docker', 'AWS', 'Microservices'], resources: ['System Design Primer', 'AWS Free Tier', 'Docker Docs'] },
        { phase: 'Career Ready (12+ months)', topics: ['Portfolio Projects', 'Open Source', 'Interview Prep'], resources: ['LeetCode', 'GitHub', 'InterviewBit'] }
      ],
      certifications: ['AWS Cloud Practitioner', 'MongoDB Certified Developer'],
      estimatedTime: '12 months'
    }
  };
  return mocks[type];
};

const pdfParse = require('pdf-parse');

// @desc   Analyze resume (AI)
// @route  POST /api/ai/analyze-resume
const analyzeResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let resumeText = '';

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text;
      } else {
        resumeText = req.file.buffer.toString('utf8'); // raw text fallback if it's not a pdf but say docx (won't work well without library, but let's assume it grabs something or user uploads txt)
      }
    } else {
      // Fallback to profile
      resumeText = `Profile details:
Name: ${user.name}
Skills: ${user.skills.join(', ')}
Education: ${user.education?.map(e => `${e.degree} from ${e.institution}`).join(', ') || 'Not provided'}
Experience: ${user.experience?.map(e => `${e.title} at ${e.company}`).join(', ') || 'Not provided'}
Projects: ${user.projects?.map(p => p.title).join(', ') || 'Not provided'}
Bio: ${user.bio || 'Not provided'}`;
    }

    const prompt = `Act as an expert ATS (Applicant Tracking System) and professional recruiter. Analyze this resume text for a ${user.role} role:
"${resumeText.substring(0, 4000)}"

Provide a strict JSON response EXACTLY in this structure:
{
  "atsScore": 85,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "missingSkills": ["string", "string"],
  "suggestions": "A detailed paragraph of professional advice."
}`;

    // Try Gemini first
    const geminiKey = process.env.GEMINI_API_KEY;
    let geminiErrorMsg = null;
    if (geminiKey && geminiKey !== 'paste_your_free_key_here') {
      try {
        const axios = require('axios');
        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1000, temperature: 0.3, responseMimeType: 'application/json' } },
          { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
        );
        const rawText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim();
          return res.json({ success: true, analysis: JSON.parse(cleanJson) });
        }
      } catch (geminiErr) {
        geminiErrorMsg = geminiErr?.response?.data?.error?.message || geminiErr.message;
        console.error('Gemini resume error:', geminiErrorMsg);
      }
    }

    const openai = getOpenAI();
    let result;
    if (!openai) {
      result = mockAIResponse('resume');
    } else {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        });
        result = JSON.parse(response.choices[0].message.content);
      } catch (openAiErr) {
        console.error('OpenAI Error:', openAiErr.message);
        // If both failed, return the mock response instead of completely failing
        if (geminiErrorMsg) {
           return res.status(500).json({ success: false, message: `AI Models Failed (Gemini: ${geminiErrorMsg}, OpenAI: ${openAiErr.message})` });
        }
        return res.status(500).json({ success: false, message: `OpenAI Error: ${openAiErr.message}` });
      }
    }
    res.json({ success: true, analysis: result });
  } catch (err) { 
    console.error('Resume core function hit an error:', err);
    res.status(500).json({ success: false, message: 'Parse/Server Error: ' + err.message }); 
  }
};

// @desc   AI Job Recommendations
// @route  GET /api/ai/job-recommendations
const getJobRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobs = await Job.find({ isActive: true }).populate('postedBy', 'name company');

    // Score jobs by skill match
    const scoredJobs = jobs.map(job => {
      const userSkills = user.skills.map(s => s.toLowerCase());
      const jobSkills = job.skills.map(s => s.toLowerCase());
      const matched = userSkills.filter(s => jobSkills.some(j => j.includes(s) || s.includes(j)));
      const score = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 50;
      return { ...job.toObject(), matchScore: score, matchedSkills: matched };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);

    const openai = getOpenAI();
    if (openai && scoredJobs.length > 0) {
      try {
        const prompt = `User has skills: ${user.skills.join(', ')}. 
Available jobs: ${scoredJobs.slice(0, 3).map(j => `${j.title} at ${j.company} requiring: ${j.skills.join(', ')}`).join('; ')}
Provide a brief personalized recommendation (2-3 sentences) for why the top job is a great match.`;
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini', 
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150
        });
        return res.json({ success: true, recommendations: scoredJobs, aiInsight: response.choices[0].message.content });
      } catch (e) {
        return res.json({ success: true, recommendations: scoredJobs });
      }
    }
    res.json({ success: true, recommendations: scoredJobs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   AI Career Roadmap
// @route  POST /api/ai/career-roadmap
const getCareerRoadmap = async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ success: false, message: 'Career goal is required' });
    const user = await User.findById(req.user._id);
    const userSkills = user ? user.skills : [];

    const ROADMAP_DB = {
      'full stack developer': { goal: 'Full Stack Developer', estimatedTime: '10-14 months', certifications: ['AWS Cloud Practitioner', 'MongoDB Certified Developer', 'Meta Frontend Developer'], phases: [
        { phase: 'Phase 1 — Frontend Foundations (0-2 months)', topics: ['HTML5 & CSS3', 'JavaScript ES6+', 'Responsive Design', 'Git & GitHub', 'Flexbox & Grid'], resources: ['MDN Web Docs', 'The Odin Project (free)', 'freeCodeCamp', 'JavaScript.info'] },
        { phase: 'Phase 2 — React & Modern UI (2-4 months)', topics: ['React.js & Hooks', 'State Management (Redux/Zustand)', 'React Router', 'Tailwind CSS', 'TypeScript basics'], resources: ['React Official Docs', 'Scrimba React Course', 'Jack Herrington YouTube', 'Tanstack Query Docs'] },
        { phase: 'Phase 3 — Backend with Node.js (4-7 months)', topics: ['Node.js & Express.js', 'REST API Design', 'JWT Authentication', 'MongoDB & Mongoose', 'SQL basics (PostgreSQL)'], resources: ['Node.js Official Docs', 'Traversy Media YouTube', 'MongoDB University (free)', 'Postman Learning Center'] },
        { phase: 'Phase 4 — DevOps & Deployment (7-10 months)', topics: ['Docker basics', 'AWS EC2 & S3', 'CI/CD with GitHub Actions', 'Nginx', 'Performance optimization'], resources: ['AWS Free Tier', 'Docker Docs', 'DigitalOcean Tutorials', 'GitHub Actions Docs'] },
        { phase: 'Phase 5 — Projects & Job Ready (10-14 months)', topics: ['Build 3 portfolio projects', 'System design basics', 'LeetCode 150+ problems', 'Open source contributions', 'Mock interview practice'], resources: ['LeetCode', 'System Design Primer (GitHub)', 'Pramp.com (mock interviews)', 'NeetCode.io'] },
      ]},
      'backend developer': { goal: 'Backend Developer', estimatedTime: '8-12 months', certifications: ['AWS Developer Associate', 'Oracle Java SE Certification', 'MongoDB Certified Developer'], phases: [
        { phase: 'Phase 1 — Core Programming (0-2 months)', topics: ['Python / Java / Node.js (pick one)', 'OOP concepts & SOLID principles', 'Data structures basics', 'Git & GitHub', 'Terminal & CLI'], resources: ['CS50 (free Harvard)', 'Python.org docs', 'GeeksforGeeks'] },
        { phase: 'Phase 2 — Backend Frameworks (2-4 months)', topics: ['REST API design', 'Express.js / Django / Spring Boot', 'Authentication (JWT, OAuth2)', 'Error handling & logging', 'Input validation & sanitization'], resources: ['Express Docs', 'Django Docs', 'Traversy Media YouTube'] },
        { phase: 'Phase 3 — Databases (4-6 months)', topics: ['SQL (PostgreSQL/MySQL)', 'MongoDB & NoSQL', 'ORMs (Prisma/Sequelize)', 'Database indexing & optimization', 'Redis caching'], resources: ['PostgreSQL Docs', 'MongoDB University', 'Redis University (free)'] },
        { phase: 'Phase 4 — System Design (6-9 months)', topics: ['Load balancing', 'Message queues (Kafka/RabbitMQ)', 'Microservices architecture', 'API security & rate limiting', 'Scalability patterns'], resources: ['Designing Data-Intensive Applications (book)', 'ByteByteGo YouTube', 'Martin Fowler blog'] },
        { phase: 'Phase 5 — Cloud & Production (9-12 months)', topics: ['AWS / GCP basics', 'Docker & containerization', 'CI/CD pipelines', 'Monitoring (Datadog)', 'Build 2 real-world APIs'], resources: ['AWS Free Tier', 'Docker Docs', 'GitHub Actions Tutorial'] },
      ]},
      'frontend developer': { goal: 'Frontend Developer', estimatedTime: '7-10 months', certifications: ['Meta Frontend Developer Certificate', 'Google UX Design Certificate'], phases: [
        { phase: 'Phase 1 — HTML, CSS & JS (0-2 months)', topics: ['HTML5 semantics', 'CSS3 & animations', 'JavaScript ES6+', 'DOM manipulation', 'Responsive design'], resources: ['MDN Web Docs', 'freeCodeCamp', 'The Odin Project', 'CSS Tricks'] },
        { phase: 'Phase 2 — React Mastery (2-4 months)', topics: ['React.js fundamentals', 'Hooks deep dive', 'Component patterns', 'JSX & conditional rendering', 'React Router'], resources: ['React Official Docs', 'Scrimba', 'Fireship YouTube', 'Codevolution YouTube'] },
        { phase: 'Phase 3 — Styling & Design Systems (4-6 months)', topics: ['Tailwind CSS', 'Framer Motion animations', 'Figma basics', 'Design tokens', 'TypeScript for React'], resources: ['Tailwind CSS Docs', 'Framer Motion Docs', 'Figma Community', 'Total TypeScript (Matt Pocock)'] },
        { phase: 'Phase 4 — State & Performance (6-8 months)', topics: ['Redux/Zustand', 'React Query / SWR', 'Web performance', 'Lazy loading', 'Testing (Jest, RTL)'], resources: ['Redux Toolkit Docs', 'Tanstack Query Docs', 'web.dev (Google)', 'Kent C. Dodds blog'] },
        { phase: 'Phase 5 — Job Ready (8-10 months)', topics: ['3 strong portfolio projects', 'Accessibility (WCAG)', 'Browser DevTools mastery', 'Open source contributions'], resources: ['Portfolio examples GitHub', 'a11y.coffee', 'Frontend Masters'] },
      ]},
      'data scientist': { goal: 'Data Scientist', estimatedTime: '12-18 months', certifications: ['Google Data Analytics Certificate', 'IBM Data Science Certificate', 'AWS ML Specialty'], phases: [
        { phase: 'Phase 1 — Math & Programming (0-3 months)', topics: ['Python programming', 'Statistics & probability', 'Linear algebra basics', 'Numpy & Pandas', 'Data cleaning'], resources: ['CS50P (free)', 'Khan Academy Math', '3Blue1Brown YouTube', 'Kaggle Learn (free)'] },
        { phase: 'Phase 2 — Data Analysis & Visualization (3-6 months)', topics: ['Pandas data manipulation', 'Matplotlib & Seaborn', 'Plotly interactive charts', 'Exploratory Data Analysis (EDA)', 'SQL for data analysis'], resources: ['Kaggle Courses (free)', 'Mode Analytics SQL Tutorial', 'Towards Data Science blog'] },
        { phase: 'Phase 3 — Machine Learning (6-10 months)', topics: ['Scikit-learn fundamentals', 'Supervised & unsupervised learning', 'Model evaluation & validation', 'Feature engineering', 'Cross-validation'], resources: ['Hands-On ML Book (Géron)', 'fast.ai (free)', 'StatQuest YouTube'] },
        { phase: 'Phase 4 — Deep Learning & NLP (10-14 months)', topics: ['Neural networks', 'TensorFlow or PyTorch', 'CNNs for images', 'Transformers for NLP', 'Transfer learning'], resources: ['deep learning.ai (Andrew Ng)', 'Hugging Face Tutorials', 'PyTorch Docs'] },
        { phase: 'Phase 5 — Projects & Industry (14-18 months)', topics: ['Kaggle competitions', 'End-to-end ML pipeline', 'Model deployment (FastAPI)', 'Portfolio on GitHub', 'MLflow experiment tracking'], resources: ['Kaggle.com', 'MLflow Docs', 'FastAPI Docs'] },
      ]},
      'machine learning engineer': { goal: 'Machine Learning Engineer', estimatedTime: '14-20 months', certifications: ['AWS ML Specialty', 'TensorFlow Developer Certificate', 'Google Professional ML Engineer'], phases: [
        { phase: 'Phase 1 — Foundations (0-3 months)', topics: ['Python advanced', 'Linear Algebra & Calculus', 'Probability & Statistics', 'Numpy, Pandas, Matplotlib', 'DSA basics'], resources: ['fast.ai Math for DL', 'CS50P', 'Kaggle Learn', '3Blue1Brown YouTube'] },
        { phase: 'Phase 2 — ML Core (3-7 months)', topics: ['Scikit-learn', 'Supervised & unsupervised learning', 'Model evaluation metrics', 'Feature engineering', 'Hyperparameter tuning'], resources: ['Hands-On ML Book', 'fast.ai course', 'StatQuest YouTube'] },
        { phase: 'Phase 3 — Deep Learning (7-12 months)', topics: ['PyTorch fundamentals', 'CNN, RNN, Transformer architectures', 'NLP with BERT & GPT', 'Computer Vision projects', 'Generative models'], resources: ['PyTorch Docs', 'deep learning.ai', 'Hugging Face', 'Papers With Code'] },
        { phase: 'Phase 4 — MLOps & Production (12-16 months)', topics: ['MLflow & experiment tracking', 'Model serving (FastAPI, TorchServe)', 'Docker for ML', 'AWS SageMaker', 'Data pipelines (Airflow)'], resources: ['MLflow Docs', 'AWS SageMaker Workshop', 'Made With ML (free)'] },
        { phase: 'Phase 5 — Research & Advanced (16-20 months)', topics: ['Research papers implementation', 'Kaggle competitions', 'LLM fine-tuning', 'Open source ML contributions', 'Building ML products'], resources: ['ArXiv.org', 'Kaggle.com', 'Hugging Face Hub'] },
      ]},
      'devops engineer': { goal: 'DevOps Engineer', estimatedTime: '10-14 months', certifications: ['AWS DevOps Engineer Professional', 'Certified Kubernetes Administrator (CKA)', 'HashiCorp Terraform Associate'], phases: [
        { phase: 'Phase 1 — Linux & Networking (0-2 months)', topics: ['Linux commands & shell scripting', 'Networking (TCP/IP, DNS, HTTP)', 'Bash scripting', 'SSH & security basics', 'File system & permissions'], resources: ['Linux Journey (free)', 'OverTheWire: Bandit (free)', 'The Linux Command Line (book)'] },
        { phase: 'Phase 2 — CI/CD & Version Control (2-4 months)', topics: ['Git advanced (branching, rebasing)', 'GitHub Actions', 'Jenkins pipelines', 'Automated testing', 'Artifact management'], resources: ['GitHub Actions Docs', 'Jenkins Official Docs', 'Atlassian Git Tutorials'] },
        { phase: 'Phase 3 — Containers & Kubernetes (4-7 months)', topics: ['Docker (images, compose)', 'Kubernetes fundamentals', 'Helm charts', 'Service mesh basics', 'Container security'], resources: ['Docker Docs', 'Kubernetes.io Tutorials (free)', 'KodeKloud free labs', 'TechWorld with Nana YouTube'] },
        { phase: 'Phase 4 — Cloud & IaC (7-10 months)', topics: ['AWS core (EC2, S3, VPC, IAM, Lambda)', 'Terraform', 'Ansible for config management', 'Cloud architecture patterns', 'Cost optimization'], resources: ['AWS Free Tier + docs', 'Terraform Docs', 'Ansible Docs'] },
        { phase: 'Phase 5 — Monitoring & SRE (10-14 months)', topics: ['Prometheus & Grafana', 'ELK Stack', 'Alerting & on-call practices', 'SLOs & SLAs', 'Incident management'], resources: ['Prometheus Docs', 'Grafana Labs Tutorials', 'Google SRE Book (free online)'] },
      ]},
      'software engineer': { goal: 'Software Engineer', estimatedTime: '10-15 months', certifications: ['AWS Cloud Practitioner', 'Oracle Java SE', 'Microsoft Azure Fundamentals'], phases: [
        { phase: 'Phase 1 — CS Fundamentals (0-3 months)', topics: ['Data structures (arrays, trees, graphs)', 'Algorithms (sorting, searching)', 'Big O complexity', 'OOP & SOLID principles', 'Git & GitHub'], resources: ['CS50 Harvard (free)', 'Algorithm Visualizer (free)', 'GeeksforGeeks', 'Abdul Bari YouTube'] },
        { phase: 'Phase 2 — Programming Mastery (3-6 months)', topics: ['Java / Python / C++ (one deeply)', 'Design patterns', 'Clean code principles', 'Unit testing', 'Debugging strategies'], resources: ['Clean Code (book)', 'Refactoring.Guru', 'LeetCode patterns'] },
        { phase: 'Phase 3 — System Design (6-9 months)', topics: ['Low Level Design (LLD)', 'High Level Design (HLD)', 'Database design', 'API design patterns', 'Scalability concepts'], resources: ['System Design Primer (GitHub)', 'Grokking System Design', 'ByteByteGo YouTube'] },
        { phase: 'Phase 4 — Specialization + Cloud (9-12 months)', topics: ['Choose: Web/Mobile/Data/Cloud specialization', 'Microservices concepts', 'REST & GraphQL APIs', 'AWS/GCP basics', 'Security fundamentals'], resources: ['AWS Free Tier', 'CS50 Web', 'Google Cloud Skills Boost'] },
        { phase: 'Phase 5 — Interview Prep (12-15 months)', topics: ['LeetCode 250+ problems', 'Mock interviews (5-10)', 'Build 3 production-quality projects', 'Open source contributions', 'Company-specific prep'], resources: ['LeetCode', 'Pramp.com', 'InterviewBit', 'NeetCode.io'] },
      ]},
      'ui ux designer': { goal: 'UI/UX Designer', estimatedTime: '8-12 months', certifications: ['Google UX Design Certificate', 'Interaction Design Foundation', 'Figma Professional'], phases: [
        { phase: 'Phase 1 — Design Fundamentals (0-2 months)', topics: ['Design thinking process', 'Color theory & typography', 'Visual hierarchy & layout', 'Gestalt principles', 'Accessibility basics (WCAG)'], resources: ['Google UX Design Coursera (free audit)', 'Interaction Design Foundation', 'Nielsen Norman Group'] },
        { phase: 'Phase 2 — Figma Mastery (2-4 months)', topics: ['Figma basics to advanced', 'Auto-layout & components', 'Design systems', 'Prototyping & interactions', 'Figma variables & tokens'], resources: ['Figma Official YouTube', 'Figma Community (free)', 'DesignCode.io'] },
        { phase: 'Phase 3 — User Research (4-6 months)', topics: ['User interviews & surveys', 'Usability testing', 'Affinity mapping', 'User personas', 'Information architecture'], resources: ['Just Enough Research (book)', 'Maze.co blog', 'UX Collective on Medium'] },
        { phase: 'Phase 4 — Motion & Advanced (6-9 months)', topics: ['Micro-interactions design', 'Animation principles', 'Lottie basics', 'Dark mode design', 'Mobile-first patterns'], resources: ['Motion Design School', 'Lottie docs', 'Material Design Guidelines'] },
        { phase: 'Phase 5 — Portfolio & Jobs (9-12 months)', topics: ['3-5 case study portfolio pieces', 'Behance & LinkedIn portfolio', 'Design critique practice', 'Webflow or Framer website', 'ADPList mentorship'], resources: ['Behance.net', 'Dribbble.com', 'Webflow University'] },
      ]},
      'data analyst': { goal: 'Data Analyst', estimatedTime: '6-9 months', certifications: ['Google Data Analytics Certificate', 'Microsoft Power BI Analyst', 'Tableau Desktop Specialist'], phases: [
        { phase: 'Phase 1 — Excel & SQL (0-2 months)', topics: ['Excel formulas & pivot tables', 'SQL (SELECT, JOINs, GROUP BY)', 'Data cleaning techniques', 'Google Sheets', 'Basic statistics'], resources: ['Mode SQL Tutorial (free)', 'SQLZoo (free)', 'Kaggle Learn SQL (free)', 'Excel Campus YouTube'] },
        { phase: 'Phase 2 — Python for Analysis (2-4 months)', topics: ['Python basics', 'Pandas & Numpy', 'Data cleaning & transformation', 'Matplotlib & Seaborn', 'Jupyter Notebooks'], resources: ['Kaggle Python Course (free)', 'Pandas Docs', 'Towards Data Science'] },
        { phase: 'Phase 3 — Visualization & BI (4-6 months)', topics: ['Tableau basics to intermediate', 'Power BI fundamentals', 'Dashboard design', 'Storytelling with data', 'Google Looker Studio (free)'], resources: ['Tableau Public (free)', 'Power BI Microsoft Learn (free)', 'Storytelling with Data (book)'] },
        { phase: 'Phase 4 — Statistics & A/B Testing (6-8 months)', topics: ['Hypothesis testing', 'A/B testing', 'Regression analysis', 'Business metrics & KPIs', 'Descriptive vs inferential stats'], resources: ['Khan Academy Statistics', 'StatQuest YouTube', 'Think Stats (free book)'] },
        { phase: 'Phase 5 — Projects & Job Search (8-9 months)', topics: ['3 portfolio data projects', 'Kaggle competition entry', 'SQL interview practice', 'Business problem framing', 'Stakeholder communication'], resources: ['Kaggle.com', 'StrataScratch SQL practice', 'Maven Analytics'] },
      ]},
      'android developer': { goal: 'Android Developer', estimatedTime: '9-13 months', certifications: ['Google Associate Android Developer', 'Kotlin Developer Certificate'], phases: [
        { phase: 'Phase 1 — Kotlin & Android Basics (0-2 months)', topics: ['Kotlin syntax & OOP', 'Android Studio setup', 'Activities & Fragments', 'Layouts & XML', 'Basic UI components'], resources: ['Kotlin Koans (official)', 'developers.android.com', 'Philipp Lackner YouTube'] },
        { phase: 'Phase 2 — Jetpack Compose (2-4 months)', topics: ['Compose fundamentals', 'State management in Compose', 'Navigation in Compose', 'Material 3 components', 'Theming & custom UI'], resources: ['Compose Pathway (Google - free)', 'Compose Samples GitHub', 'Stevdza-San YouTube'] },
        { phase: 'Phase 3 — Data & Networking (4-6 months)', topics: ['Room database', 'Retrofit + OkHttp', 'Hilt dependency injection', 'DataStore', 'WorkManager'], resources: ['Android Codelab series (free)', 'Retrofit2 Docs', 'Hilt Docs'] },
        { phase: 'Phase 4 — Advanced Features (6-9 months)', topics: ['Firebase (Auth, Firestore, FCM)', 'Google Maps SDK', 'Camera & media', 'In-App Purchases', 'Performance optimization'], resources: ['Firebase Docs', 'Google Maps Docs', 'Android Vitals'] },
        { phase: 'Phase 5 — Publish & Portfolio (9-13 months)', topics: ['Google Play Store publishing', 'App signing & release', '2-3 portfolio apps', 'Analytics setup', 'Code reviews & best practices'], resources: ['Google Play Console Docs', 'Firebase Crashlytics'] },
      ]},
      'cybersecurity analyst': { goal: 'Cybersecurity Analyst', estimatedTime: '12-16 months', certifications: ['CompTIA Security+', 'Certified Ethical Hacker (CEH)', 'CompTIA CySA+'], phases: [
        { phase: 'Phase 1 — Fundamentals (0-3 months)', topics: ['Networking basics (OSI, TCP/IP)', 'Linux & Windows admin', 'Cryptography basics', 'CIA triad & security concepts', 'Basic Python scripting'], resources: ['TryHackMe (free paths)', 'CompTIA Study Materials', 'Professor Messer Security+ YouTube'] },
        { phase: 'Phase 2 — Ethical Hacking (3-6 months)', topics: ['OWASP Top 10', 'Network scanning (Nmap)', 'Web app pentesting (Burp Suite)', 'Metasploit basics', 'CTF challenges'], resources: ['HackTheBox (free tier)', 'PortSwigger Academy (free)', 'TryHackMe', 'IppSec YouTube'] },
        { phase: 'Phase 3 — Blue Team & SOC (6-9 months)', topics: ['SIEM tools (Splunk, ELK)', 'Log analysis & threat hunting', 'Incident response', 'IDS/IPS systems', 'Vulnerability management'], resources: ['Splunk Free Training', 'Elastic SIEM Tutorial', 'SANS Reading Room'] },
        { phase: 'Phase 4 — Cloud Security (9-12 months)', topics: ['AWS GuardDuty & Security Hub', 'Application security (SAST/DAST)', 'Container security', 'Zero trust networks', 'Identity & access governance'], resources: ['AWS Security Specialty', 'OWASP Testing Guide', 'Cloud Security Alliance'] },
        { phase: 'Phase 5 — Certifications & Career (12-16 months)', topics: ['Security+ exam prep', 'CEH exam prep', 'Bug bounty programs', 'Security report writing', 'Home lab practice'], resources: ['CompTIA Study Pass', 'Bugcrowd & HackerOne', 'VirtualBox home lab'] },
      ]},
      'product manager': { goal: 'Product Manager', estimatedTime: '9-14 months', certifications: ['Product School Certificate', 'Google Project Management', 'Agile Certified Practitioner (PMI-ACP)'], phases: [
        { phase: 'Phase 1 — PM Fundamentals (0-2 months)', topics: ['Product lifecycle & strategy', 'Agile & Scrum', 'User story writing', 'OKRs & goal setting', 'Stakeholder management'], resources: ['Inspired (Marty Cagan book)', 'Product School blog', 'Scrum.org'] },
        { phase: 'Phase 2 — User Research & Data (2-4 months)', topics: ['User interviews & surveys', 'Funnel & cohort analysis', 'Google Analytics / Mixpanel', 'A/B testing', 'NPS & feedback loops'], resources: ['Google Analytics Academy (free)', 'Mixpanel blog', 'Lenny Rachitsky newsletter'] },
        { phase: 'Phase 3 — Roadmapping & Strategy (4-6 months)', topics: ['Roadmap creation (Now/Next/Later)', 'RICE & ICE frameworks', 'MoSCoW prioritization', 'PRD & spec writing', 'Competitor analysis'], resources: ['ProductPlan blog', 'Aha.io resources', 'John Cutler blog'] },
        { phase: 'Phase 4 — Technical Literacy (6-9 months)', topics: ['APIs & how they work', 'SQL for product analytics', 'System design understanding', 'Working with engineers', 'Technical feasibility assessment'], resources: ['SQL for PMs (Mode)', 'Reforge articles', 'Shreyas Doshi Substack'] },
        { phase: 'Phase 5 — GTM & Portfolio (9-14 months)', topics: ['Go-to-market strategy', 'Pricing models', 'Growth loops & retention', 'PM case studies portfolio', 'Interview prep (CIRCLES method)'], resources: ['Lenny newsletter', 'Andrew Chen blog', 'First Round Review'] },
      ]},
    };

    const normalizedGoal = goal.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
    const findBestMatch = (g) => {
      if (ROADMAP_DB[g]) return ROADMAP_DB[g];
      for (const key of Object.keys(ROADMAP_DB)) {
        const keyWords = key.split(' ');
        if (keyWords.some(kw => kw.length > 3 && g.includes(kw))) return ROADMAP_DB[key];
        if (g.split(' ').some(gw => gw.length > 3 && key.includes(gw))) return ROADMAP_DB[key];
      }
      return null;
    };

    // Try Gemini first
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'paste_your_free_key_here') {
      try {
        const axios = require('axios');
        const prompt = `Create a 5-phase career roadmap for: "${goal}".
Current skills: ${userSkills.join(', ') || 'beginner level'}.
Return ONLY valid JSON: {"goal":"${goal}","estimatedTime":"X-Y months","certifications":["cert1","cert2","cert3"],"phases":[{"phase":"Phase 1 — Name (0-2 months)","topics":["topic1","topic2","topic3","topic4","topic5"],"resources":["resource1","resource2","resource3"]}]}`;
        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1500, temperature: 0.5, responseMimeType: 'application/json' } },
          { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
        );
        const rawText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim();
          const roadmap = JSON.parse(cleanJson);
          if (roadmap.phases && roadmap.phases.length > 0) {
            return res.json({ success: true, roadmap, source: 'gemini' });
          }
        }
      } catch (geminiErr) {
        console.error('Gemini roadmap error:', geminiErr?.response?.data?.error?.message || geminiErr.message);
      }
    }

    // Try OpenAI
    const openai = getOpenAI();
    if (openai) {
      try {
        const prompt = `Create a detailed 5-phase career roadmap for "${goal}". Skills: ${userSkills.join(', ') || 'beginner'}. JSON with: goal, estimatedTime, certifications (array), phases (array of {phase, topics, resources}).`;
        const response = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } });
        const roadmap = JSON.parse(response.choices[0].message.content);
        return res.json({ success: true, roadmap, source: 'openai' });
      } catch (openaiErr) { console.error('OpenAI roadmap error:', openaiErr.message); }
    }

    // Local DB fallback
    const localRoadmap = findBestMatch(normalizedGoal);
    if (localRoadmap) return res.json({ success: true, roadmap: { ...localRoadmap }, source: 'local' });

    // Generic fallback
    return res.json({ success: true, roadmap: {
      goal, estimatedTime: '10-14 months',
      certifications: ['Relevant domain certificate', 'Cloud platform certification (AWS/GCP/Azure)', 'Project Management (PMP/Agile)'],
      phases: [
        { phase: 'Phase 1 — Discovery & Foundations (0-2 months)', topics: ['Research the role deeply', 'Identify core skills required', 'Find community & mentors', 'Set up learning environment', 'Read industry blogs & news'], resources: ['LinkedIn Learning', 'YouTube tutorials', 'Reddit communities for the field', 'Discord learning servers'] },
        { phase: 'Phase 2 — Core Skills (2-5 months)', topics: ['Primary technical skills for the role', 'Domain-specific tools & software', 'Best practices in the field', 'Side project to apply skills', 'Connect with professionals'], resources: ['Coursera / Udemy courses', 'Official documentation', 'Free YouTube courses', 'GitHub projects'] },
        { phase: 'Phase 3 — Intermediate Mastery (5-8 months)', topics: ['Advanced concepts in the domain', 'Industry workflows & tools', 'Real-world problem solving', 'Networking with peers', 'Contributing to community'], resources: ['Advanced courses', 'Open source projects', 'Meetups & conferences', 'Specialized blogs'] },
        { phase: 'Phase 4 — Projects & Portfolio (8-11 months)', topics: ['3 substantial portfolio projects', 'Document your work thoroughly', 'Get feedback from professionals', 'Build LinkedIn & GitHub presence', 'Case studies for your work'], resources: ['GitHub Pages / Vercel (free hosting)', 'Medium (write about learnings)', 'Behance/Dribbble for design'] },
        { phase: 'Phase 5 — Job Search & Growth (11-14 months)', topics: ['Resume tailored to the role', 'Interview preparation', 'Mock interviews with peers', 'Networking & referrals', 'Salary negotiation skills'], resources: ['LeetCode / InterviewBit', 'Pramp.com (mock interviews)', 'Glassdoor salary insights', 'LinkedIn jobs'] },
      ]
    }, source: 'generic' });

  } catch (err) {
    console.error('Roadmap error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   AI Connection Suggestions
// @route  GET /api/ai/connection-suggestions
const getConnectionSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const Connection = require('../models/Connection');
    const myConns = await Connection.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: { $in: ['accepted', 'pending'] }
    });
    const excludeIds = [req.user._id, ...myConns.map(c =>
      c.sender.toString() === req.user._id.toString() ? c.receiver : c.sender
    )];
    const allUsers = await User.find({ _id: { $nin: excludeIds }, isActive: true })
      .select('name avatar role skills bio company institution designation location')
      .limit(20);

    // Score by skill overlap
    const scored = allUsers.map(u => {
      const shared = user.skills.filter(s => u.skills.map(sk => sk.toLowerCase()).includes(s.toLowerCase()));
      return { ...u.toObject(), sharedSkills: shared, relevanceScore: shared.length };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 8);

    res.json({ success: true, suggestions: scored });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Skill demand trends
// @route  GET /api/ai/skill-trends
const getSkillTrends = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true });
    const skillCounts = {};
    jobs.forEach(job => {
      job.skills.forEach(skill => {
        const key = skill.toLowerCase();
        skillCounts[key] = (skillCounts[key] || 0) + 1;
      });
    });
    const trends = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, count, demand: count > 2 ? 'High' : count > 1 ? 'Medium' : 'Low' }));
    res.json({ success: true, trends });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Smart rule-based fallback when OpenAI quota is exceeded
const smartFallback = (userMessage) => {
  const msg = userMessage.toLowerCase();

  if (msg.includes('what is') && (msg.includes('alumsphere') || msg.includes('this') || msg.includes('platform'))) {
    return `AlumSphere is a premium alumni networking & career intelligence platform 🚀\n\nIt connects students with verified alumni for mentoring, job referrals, and career growth. Features include AI job matching, live events, real-time chat, and a gamified leaderboard.\n\n👉 **[Sign up free](/register)** to explore everything!`;
  }
  if (msg.includes('job') || msg.includes('internship') || msg.includes('placement')) {
    return `AlumSphere has an **exclusive job board** posted directly by alumni hiring managers 💼\n\nYou can:\n- Browse AI-matched job listings tailored to your skills\n- Get referrals from connected alumni\n- Track applications in one place\n\nSign in to access the jobs section!`;
  }
  if (msg.includes('alumni') || msg.includes('mentor') || msg.includes('connect') || msg.includes('network')) {
    return `You can connect with **verified alumni mentors** across industries 🤝\n\nSimply go to the **Network** section after signing in, search by skill, company, or batch, and send a connection request. Alumni can also refer you for jobs at their companies!`;
  }
  if (msg.includes('resume') || msg.includes('cv')) {
    return `AlumSphere's **AI Career Hub** analyzes your resume and gives:\n\n- ATS score (0-100)\n- Specific improvement suggestions\n- Missing skills for your target role\n- Tailored career roadmap\n\nTip: Include quantified achievements and match keywords from job descriptions! 📄`;
  }
  if (msg.includes('event') || msg.includes('webinar') || msg.includes('ama')) {
    return `AlumSphere hosts **live events** regularly 📅\n\n- Webinars by industry leaders\n- AMA sessions with alumni at top companies\n- Mock interviews & workshops\n\nCheck the **Events** section after logging in. Most events are free for members!`;
  }
  if (msg.includes('sign') || msg.includes('login') || msg.includes('register') || msg.includes('account') || msg.includes('join')) {
    return `Getting started is easy and **free** 🎉\n\n1. Click **"Join Now"** on the landing page\n2. Choose your role: Student or Alumni\n3. Fill in your profile details\n4. Explore the full platform!\n\n[Create your free account →](/register)`;
  }
  if (msg.includes('feature') || msg.includes('offer') || msg.includes('provide')) {
    return `AlumSphere offers **6 powerful features** ⚡\n\n🎯 AI Job Matching & Referrals\n🤝 Verified Alumni Network\n📄 Resume Analysis & Career AI\n📅 Live Events & Webinars\n🏆 Gamified XP Leaderboard\n💬 Real-time Chat with Connections\n\nAll in one premium platform. **Sign up free** to access everything!`;
  }
  if (msg.includes('price') || msg.includes('cost') || msg.includes('paid') || msg.includes('free')) {
    return `AlumSphere is **completely free** for students and alumni! 🎉\n\nNo subscription, no credit card required. Just sign up and start networking, applying for jobs, and connecting with mentors instantly.`;
  }
  if (msg.includes('roadmap') || msg.includes('career') || msg.includes('path') || msg.includes('skill')) {
    return `The **AI Career Hub** builds personalised career roadmaps for you 🗺️\n\nJust enter your goal role (e.g. "Software Engineer") and it gives a phase-by-phase plan:\n→ Skills to learn\n→ Resources to use\n→ Certifications to get\n→ Estimated timeline\n\nLog in and head to the AI Hub to try it!`;
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('start')) {
    return `Hi there! 👋 I'm **AlumBot**, your AI guide for AlumSphere!\n\nI can help you with:\n- 🎯 Learning about the platform\n- 💼 Job search tips\n- 📄 Resume advice\n- 🤝 Connecting with alumni\n\nWhat would you like to know?`;
  }

  // Generic fallback
  return `Thanks for asking! 😊 AlumSphere is built to connect students with alumni for **mentoring, jobs, and career growth**.\n\nFor detailed help on your query, I recommend:\n- Signing up and exploring the platform\n- Visiting the **AI Hub** for career-specific guidance\n- Checking the **Community** section for discussions\n\nIs there something specific about AlumSphere I can help with?`;
};

// @desc   Public chatbot — Gemini (free) → OpenAI → Smart fallback
// @route  POST /api/ai/chatbot
const chatbot = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'messages array required' });
    }

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const userText = lastUserMsg?.content || '';

    const systemPrompt = `You are AlumBot, the friendly and intelligent AI assistant of AlumSphere — a premium alumni networking and career intelligence platform.

Your role:
- Help users understand AlumSphere (networking, jobs, events, mentoring, AI career hub, leaderboard, community)
- Provide career advice, resume tips, interview prep, and skill roadmaps
- Guide visitors to sign up or log in
- Be concise, warm, and professional. Use emojis occasionally.

Platform highlights:
- AI-powered job matching and referrals from alumni
- Connect with verified alumni mentors
- Career roadmaps and resume ATS analysis
- Live events, webinars, AMAs with industry leaders
- Gamified XP leaderboard
- Real-time chat with connections

Keep responses concise (2-4 sentences max unless asked for detail).`;

    // ── 1. Try Gemini REST API (FREE) ────────────────────────
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'paste_your_free_key_here') {
      try {
        const axios = require('axios');

        const firstUserIdx = messages.findIndex(m => m.role === 'user');
        const conversationMsgs = messages.slice(firstUserIdx).slice(-20);

        const geminiContents = conversationMsgs.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const geminiBody = {
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiContents,
          generationConfig: { maxOutputTokens: 400, temperature: 0.75 },
        };

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          geminiBody,
          { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
        );

        const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.json({ success: true, reply, engine: 'gemini' });
        }
        throw new Error('Empty response from Gemini');

      } catch (geminiErr) {
        const errStatus = geminiErr?.response?.status;
        const errMsg = geminiErr?.response?.data?.error?.message || geminiErr.message;
        console.error(`⚠️ Gemini REST error [${errStatus}]:`, errMsg);
        // fall through to OpenAI
      }
    }

    // ── 2. Try OpenAI ─────────────────────────────────────────
    const openai = getOpenAI();
    if (openai) {
      try {
        const firstUserIdx = messages.findIndex(m => m.role === 'user');
        const cleanMessages = messages.slice(firstUserIdx).slice(-10);
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, ...cleanMessages],
          max_tokens: 300,
          temperature: 0.7,
        });
        return res.json({ success: true, reply: response.choices[0].message.content, engine: 'openai' });
      } catch (openaiErr) {
        console.error('⚠️ OpenAI error:', openaiErr?.status, openaiErr?.message);
      }
    }

    // ── 3. Smart keyword fallback ─────────────────────────────
    return res.json({ success: true, reply: smartFallback(userText), engine: 'fallback' });

  } catch (err) {
    console.error('❌ Chatbot error:', err?.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Market Insights — real-time data from DB + AI summary
// @route  GET /api/ai/market-insights
const getMarketInsights = async (req, res) => {
  try {
    const Event  = require('../models/Event');
    const User   = require('../models/User');

    // ── 1. Fetch all active jobs ───────────────────────────────
    const jobs = await Job.find({ isActive: true }).lean();

    // ── 2. Top Skills demand ───────────────────────────────────
    const skillMap = {};
    jobs.forEach(j => j.skills.forEach(s => {
      const k = s.trim().toLowerCase();
      skillMap[k] = (skillMap[k] || 0) + 1;
    }));
    const topSkills = Object.entries(skillMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        count,
        demand: count >= 4 ? 'High' : count >= 2 ? 'Medium' : 'Low',
      }));

    // ── 3. Job type distribution ──────────────────────────────
    const typeMap = {};
    jobs.forEach(j => {
      const t = j.type || 'full-time';
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    const jobTypes = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

    // ── 4. Daily job postings — last 14 days ─────────────────
    const now   = new Date();
    const daily = [];
    for (let i = 13; i >= 0; i--) {
      const d    = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd   = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
      const count    = jobs.filter(j => {
        const c = new Date(j.createdAt);
        return c >= dayStart && c < dayEnd;
      }).length;
      daily.push({
        date: dayStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        jobs: count,
      });
    }

    // ── 5. Top hiring companies ───────────────────────────────
    const companyMap = {};
    jobs.forEach(j => {
      const c = j.company || 'Unknown';
      companyMap[c] = (companyMap[c] || 0) + 1;
    });
    const topCompanies = Object.entries(companyMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([company, openings]) => ({ company, openings }));

    // ── 6. Salary range distribution ─────────────────────────
    const salaryBuckets = { '0-5L': 0, '5-10L': 0, '10-20L': 0, '20-40L': 0, '40L+': 0 };
    jobs.forEach(j => {
      const mid = ((j.salaryMin || 0) + (j.salaryMax || 0)) / 2;
      const lpa = mid / 100000;
      if      (lpa < 5)  salaryBuckets['0-5L']++;
      else if (lpa < 10) salaryBuckets['5-10L']++;
      else if (lpa < 20) salaryBuckets['10-20L']++;
      else if (lpa < 40) salaryBuckets['20-40L']++;
      else               salaryBuckets['40L+']++;
    });
    const salaryDist = Object.entries(salaryBuckets).map(([range, count]) => ({ range, count }));

    // ── 7. Platform stats ─────────────────────────────────────
    const [totalUsers, totalEvents] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Event.countDocuments(),
    ]);
    const stats = {
      totalJobs:    jobs.length,
      totalUsers,
      totalEvents,
      avgApplicants: jobs.length
        ? Math.round(jobs.reduce((s, j) => s + (j.applicants?.length || 0), 0) / jobs.length)
        : 0,
      remoteJobs: jobs.filter(j => j.type === 'remote').length,
      internships: jobs.filter(j => j.type === 'internship').length,
    };

    // ── 8. Optional Gemini AI summary ────────────────────────
    let aiSummary = null;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'paste_your_free_key_here' && topSkills.length > 0) {
      try {
        const axios = require('axios');
        const prompt = `Based on this job market data from our alumni platform:
- Top skills in demand: ${topSkills.slice(0, 5).map(s => s.skill).join(', ')}
- Most common job type: ${jobTypes.sort((a,b)=>b.value-a.value)[0]?.name || 'full-time'}
- Total active jobs: ${stats.totalJobs}
- Remote jobs: ${stats.remoteJobs}

Write a 2-sentence market insight summary for job seekers. Be concise and actionable.`;
        const gemRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 120, temperature: 0.6 } },
          { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
        );
        aiSummary = gemRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      } catch (e) {
        console.warn('Gemini insights summary skipped:', e.message);
      }
    }

    res.json({
      success: true,
      data: { topSkills, jobTypes, daily, topCompanies, salaryDist, stats },
      aiSummary,
      generatedAt: new Date(),
    });
  } catch (err) {
    console.error('Market insights error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { analyzeResume, getJobRecommendations, getCareerRoadmap, getConnectionSuggestions, getSkillTrends, chatbot, getMarketInsights };

