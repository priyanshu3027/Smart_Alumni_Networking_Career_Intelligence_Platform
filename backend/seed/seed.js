require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');
const Event = require('../models/Event');
const Connection = require('../models/Connection');
const Announcement = require('../models/Announcement');
const { Group, Post } = require('../models/Group');
const { Message, Conversation } = require('../models/Message');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alumsphere');
  console.log('✅ Connected to MongoDB');
};

const hashPassword = async (pwd) => bcrypt.hash(pwd, 10);
const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const pastDate   = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}), Job.deleteMany({}), Event.deleteMany({}),
      Connection.deleteMany({}), Announcement.deleteMany({}),
      Group.deleteMany({}), Post.deleteMany({}),
      Message.deleteMany({}), Conversation.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    const pwd = await hashPassword('Password@123');

    // ─── USERS (12 total) ────────────────────────────────────────────────────
    const [
      priyanshu, anmol, ritesh, kavya, deepak, nisha,
      rahul, sneha, amit, pooja, vikram, admin
    ] = await User.insertMany([

      // ── STUDENTS (6) ──────────────────────────────────────────────────────
      {
        name: 'Priyanshu Singh',
        email: 'priyanshu@cu.ac.in',
        password: pwd, role: 'student',
        bio: 'Passionate MERN Stack Developer | MCA @ Chandigarh University | Open source enthusiast',
        institution: 'Chandigarh University', course: 'MCA', graduationYear: 2025,
        location: 'Chandigarh, Punjab',
        skills: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'Tailwind CSS', 'Git'],
        education: [{ degree: 'MCA', institution: 'Chandigarh University', year: '2023-2025', grade: '8.5 CGPA' }],
        projects: [
          { title: 'AlumSphere Platform', description: 'AI-powered alumni networking platform', github: 'https://github.com/priyanshu3027', tech: ['React', 'Node.js', 'MongoDB'] },
          { title: 'E-commerce Store', description: 'Full-stack MERN e-commerce with payment gateway', github: 'https://github.com/priyanshu3027/ecom', tech: ['React', 'Node.js', 'Stripe'] }
        ],
        points: 320, badges: ['Active Member', 'Rising Star'],
        avatar: `https://ui-avatars.com/api/?name=Priyanshu+Singh&background=6366f1&color=fff&size=200`
      },
      {
        name: 'Anmol Saini',
        email: 'anmol@du.ac.in',
        password: pwd, role: 'student',
        bio: 'Frontend Developer | React & Vue.js enthusiast | B.Tech CSE @ Delhi University',
        institution: 'Delhi University', course: 'B.Tech CSE', graduationYear: 2025,
        location: 'Delhi',
        skills: ['React.js', 'Vue.js', 'JavaScript', 'HTML', 'CSS', 'Figma', 'Tailwind CSS', 'TypeScript'],
        education: [{ degree: 'B.Tech CSE', institution: 'Delhi University', year: '2021-2025', grade: '8.2 CGPA' }],
        projects: [
          { title: 'Portfolio Website', description: 'Personal portfolio with GSAP animations', github: 'https://github.com/anmol/portfolio', tech: ['Vue.js', 'GSAP', 'Three.js'] },
          { title: 'Task Manager App', description: 'Kanban-style task manager with drag & drop', github: 'https://github.com/anmol/tasks', tech: ['React', 'Redux', 'Firebase'] }
        ],
        points: 210, badges: ['Active Member'],
        avatar: `https://ui-avatars.com/api/?name=Anmol+Saini&background=8b5cf6&color=fff&size=200`
      },
      {
        name: 'Ritesh Pandey',
        email: 'ritesh@iit.ac.in',
        password: pwd, role: 'student',
        bio: 'Python & ML enthusiast | Computer Vision projects | B.Tech AI/ML @ IIT Delhi',
        institution: 'IIT Delhi', course: 'B.Tech AI/ML', graduationYear: 2025,
        location: 'Delhi',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'OpenCV', 'Scikit-learn', 'SQL', 'Pandas'],
        education: [{ degree: 'B.Tech AI/ML', institution: 'IIT Delhi', year: '2021-2025', grade: '9.1 CGPA' }],
        projects: [
          { title: 'Face Recognition System', description: 'Real-time face detection using OpenCV & DeepFace', github: 'https://github.com/ritesh/face-rec', tech: ['Python', 'OpenCV', 'DeepFace'] },
          { title: 'Sentiment Analyzer', description: 'NLP-based Twitter sentiment analysis', github: 'https://github.com/ritesh/sentiment', tech: ['Python', 'BERT', 'Flask'] }
        ],
        points: 280, badges: ['Active Member', 'Rising Star'],
        avatar: `https://ui-avatars.com/api/?name=Ritesh+Pandey&background=ec4899&color=fff&size=200`
      },
      {
        name: 'Kavya Sharma',
        email: 'kavya@vit.ac.in',
        password: pwd, role: 'student',
        bio: 'Full-stack Developer | DSA enthusiast | BCA @ VIT Vellore | Competitive Programmer',
        institution: 'VIT Vellore', course: 'BCA', graduationYear: 2025,
        location: 'Vellore, Tamil Nadu',
        skills: ['Java', 'Spring Boot', 'React.js', 'MySQL', 'DSA', 'C++', 'Redis'],
        education: [{ degree: 'BCA', institution: 'VIT Vellore', year: '2022-2025', grade: '8.8 CGPA' }],
        projects: [
          { title: 'Online Judge Platform', description: 'LeetCode-style competitive programming judge', github: 'https://github.com/kavya/judge', tech: ['Java', 'Spring Boot', 'Docker'] }
        ],
        points: 190, badges: ['Active Member'],
        avatar: `https://ui-avatars.com/api/?name=Kavya+Sharma&background=14b8a6&color=fff&size=200`
      },
      {
        name: 'Deepak Nair',
        email: 'deepak@bits.ac.in',
        password: pwd, role: 'student',
        bio: 'DevOps & Cloud enthusiast | B.Tech IT @ BITS Pilani | AWS Certified Cloud Practitioner',
        institution: 'BITS Pilani', course: 'B.Tech IT', graduationYear: 2025,
        location: 'Pilani, Rajasthan',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Python', 'CI/CD', 'Jenkins'],
        education: [{ degree: 'B.Tech IT', institution: 'BITS Pilani', year: '2021-2025', grade: '8.0 CGPA' }],
        projects: [
          { title: 'CI/CD Pipeline', description: 'Automated deployment pipeline with GitHub Actions', github: 'https://github.com/deepak/cicd', tech: ['Docker', 'Jenkins', 'Kubernetes'] }
        ],
        points: 160, badges: ['Active Member'],
        avatar: `https://ui-avatars.com/api/?name=Deepak+Nair&background=f97316&color=fff&size=200`
      },
      {
        name: 'Nisha Gupta',
        email: 'nisha@amity.ac.in',
        password: pwd, role: 'student',
        bio: 'UI/UX Designer & Frontend Developer | Figma & React | BCA @ Amity University',
        institution: 'Amity University', course: 'BCA', graduationYear: 2025,
        location: 'Noida, UP',
        skills: ['Figma', 'Adobe XD', 'React.js', 'CSS', 'Framer Motion', 'JavaScript', 'Prototyping'],
        education: [{ degree: 'BCA', institution: 'Amity University', year: '2022-2025', grade: '8.6 CGPA' }],
        projects: [
          { title: 'HealthCare App UI', description: 'Complete UI/UX redesign for healthcare mobile app', github: 'https://github.com/nisha/healthcare-ui', tech: ['Figma', 'React Native'] }
        ],
        points: 140, badges: ['Active Member'],
        avatar: `https://ui-avatars.com/api/?name=Nisha+Gupta&background=db2777&color=fff&size=200`
      },

      // ── ALUMNI (5) ────────────────────────────────────────────────────────
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@tcs.com',
        password: pwd, role: 'alumni',
        bio: 'Senior SDE @ TCS | 5+ yrs | Full Stack + Microservices | Ex-Chandigarh University | Mentor & Recruiter',
        company: 'TCS', designation: 'Senior Software Engineer',
        institution: 'Chandigarh University', course: 'MCA', graduationYear: 2019,
        location: 'Noida, UP',
        skills: ['Java', 'Spring Boot', 'React.js', 'Microservices', 'Docker', 'AWS', 'Kubernetes', 'Kafka'],
        experience: [
          { title: 'Senior Software Engineer', company: 'TCS', from: '2022', to: 'Present', description: 'Leading microservices development for banking clients. Architected a system handling 1M+ daily transactions.' },
          { title: 'Software Engineer', company: 'TCS', from: '2019', to: '2022', description: 'Developed REST APIs and React dashboards for enterprise clients.' }
        ],
        isVerified: true, verificationStatus: 'approved',
        points: 780, badges: ['Active Member', 'Rising Star', 'Top Contributor', 'Elite Networker'],
        avatar: `https://ui-avatars.com/api/?name=Rahul+Verma&background=10b981&color=fff&size=200`
      },
      {
        name: 'Sneha Kapoor',
        email: 'sneha.kapoor@infosys.com',
        password: pwd, role: 'alumni',
        bio: 'Software Consultant @ Infosys | Angular & Java | IIT Bombay graduate | Alumni Mentor',
        company: 'Infosys', designation: 'Software Consultant',
        institution: 'IIT Bombay', course: 'B.Tech CSE', graduationYear: 2020,
        location: 'Bangalore, Karnataka',
        skills: ['Angular', 'Java', 'Spring Boot', 'MySQL', 'Docker', 'Jenkins', 'Agile', 'TypeScript'],
        experience: [
          { title: 'Software Consultant', company: 'Infosys', from: '2020', to: 'Present', description: 'Working on enterprise Angular applications and Spring Boot REST APIs for EU banking clients.' }
        ],
        isVerified: true, verificationStatus: 'approved',
        points: 580, badges: ['Active Member', 'Rising Star', 'Top Contributor'],
        avatar: `https://ui-avatars.com/api/?name=Sneha+Kapoor&background=f59e0b&color=fff&size=200`
      },
      {
        name: 'Amit Sharma',
        email: 'amit.sharma@wipro.com',
        password: pwd, role: 'alumni',
        bio: 'Data Engineer @ Wipro | Python & PySpark | NIT Allahabad | Building scalable data pipelines',
        company: 'Wipro', designation: 'Software Engineer',
        institution: 'NIT Allahabad', course: 'B.Tech IT', graduationYear: 2021,
        location: 'Hyderabad, Telangana',
        skills: ['Python', 'PySpark', 'SQL', 'Hadoop', 'Tableau', 'Power BI', 'Airflow', 'Kafka'],
        experience: [
          { title: 'Software Engineer', company: 'Wipro', from: '2021', to: 'Present', description: 'Building data pipelines with PySpark & Hadoop for FMCG analytics.' }
        ],
        isVerified: false, verificationStatus: 'pending',
        points: 90, badges: ['Active Member'],
        avatar: `https://ui-avatars.com/api/?name=Amit+Sharma&background=ef4444&color=fff&size=200`
      },
      {
        name: 'Pooja Mehta',
        email: 'pooja.mehta@amazon.com',
        password: pwd, role: 'alumni',
        bio: 'SDE-2 @ Amazon | Distributed Systems | IIT Madras | Open-source contributor | Speaker',
        company: 'Amazon', designation: 'Software Development Engineer II',
        institution: 'IIT Madras', course: 'B.Tech CSE', graduationYear: 2018,
        location: 'Bangalore, Karnataka',
        skills: ['Java', 'AWS', 'DynamoDB', 'Kafka', 'Microservices', 'System Design', 'CDK', 'Lambda'],
        experience: [
          { title: 'SDE-2', company: 'Amazon', from: '2021', to: 'Present', description: 'Building high-throughput distributed services for Amazon Logistics.' },
          { title: 'SDE-1', company: 'Amazon', from: '2018', to: '2021', description: 'Worked on Order Management System backend services.' }
        ],
        isVerified: true, verificationStatus: 'approved',
        points: 920, badges: ['Active Member', 'Rising Star', 'Top Contributor', 'Elite Networker'],
        avatar: `https://ui-avatars.com/api/?name=Pooja+Mehta&background=3b82f6&color=fff&size=200`
      },
      {
        name: 'Vikram Joshi',
        email: 'vikram.joshi@google.com',
        password: pwd, role: 'alumni',
        bio: 'Software Engineer @ Google | ML Infrastructure | IIT Kanpur | 7 years industry experience',
        company: 'Google', designation: 'Software Engineer L5',
        institution: 'IIT Kanpur', course: 'B.Tech CS', graduationYear: 2017,
        location: 'Hyderabad, Telangana',
        skills: ['Go', 'Python', 'TensorFlow', 'Kubernetes', 'BigQuery', 'Spanner', 'gRPC', 'C++'],
        experience: [
          { title: 'Software Engineer L5', company: 'Google', from: '2021', to: 'Present', description: 'Building ML training infrastructure and model serving systems at Google Brain.' },
          { title: 'Software Engineer L4', company: 'Google', from: '2017', to: '2021', description: 'Worked on Google Search infrastructure and BigTable optimization.' }
        ],
        isVerified: true, verificationStatus: 'approved',
        points: 1100, badges: ['Active Member', 'Rising Star', 'Top Contributor', 'Elite Networker'],
        avatar: `https://ui-avatars.com/api/?name=Vikram+Joshi&background=6366f1&color=fff&size=200`
      },

      // ── ADMIN ──────────────────────────────────────────────────────────────
      {
        name: 'Admin User',
        email: 'admin@alumsphere.com',
        password: pwd, role: 'admin',
        bio: 'Platform Administrator — AlumSphere',
        skills: ['Administration', 'Management', 'Platform Ops'],
        isVerified: true, verificationStatus: 'approved',
        points: 1500, badges: ['Active Member', 'Rising Star', 'Top Contributor', 'Elite Networker'],
        avatar: `https://ui-avatars.com/api/?name=Admin+User&background=1e293b&color=fff&size=200`
      }
    ]);
    console.log('👥 12 Users seeded');

    // ─── JOBS (8) ────────────────────────────────────────────────────────────
    const jobs = await Job.insertMany([
      {
        title: 'Frontend Developer (React)',
        description: `TCS is looking for a passionate Frontend Developer to join our growing team in Noida.\n\n**Responsibilities:**\n- Build responsive UIs with React.js and TypeScript\n- Collaborate with backend teams on REST API integration\n- Optimize applications for maximum speed and scalability\n- Participate in code reviews and agile sprints\n\n**Benefits:**\n- Competitive salary: 6-8 LPA\n- Health insurance for self + family\n- Annual performance bonus\n- 5-day work week`,
        company: 'TCS', location: 'Noida, UP', type: 'full-time',
        salary: '6-8 LPA', salaryMin: 600000, salaryMax: 800000,
        skills: ['React.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Git', 'Tailwind CSS'],
        experience: '0-2 years', openings: 5,
        aboutCompany: 'Tata Consultancy Services (TCS) is a global IT services, consulting and business solutions organization with 600,000+ employees across 55 countries.',
        postedBy: rahul._id,
      },
      {
        title: 'Backend Engineer (Java/Spring Boot)',
        description: `Infosys is hiring Backend Engineers for our Bangalore Digital Innovation Hub.\n\n**Responsibilities:**\n- Design and develop scalable REST APIs using Spring Boot\n- Work with Kafka for event-driven microservices\n- Perform database design and query optimization\n- Write unit and integration tests\n\n**What we offer:**\n- 8-11 LPA + variable pay\n- Stock options\n- International project exposure`,
        company: 'Infosys', location: 'Bangalore, Karnataka', type: 'full-time',
        salary: '8-11 LPA', salaryMin: 800000, salaryMax: 1100000,
        skills: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'Kafka', 'Microservices', 'JUnit'],
        experience: '1-3 years', openings: 3,
        aboutCompany: 'Infosys Limited is an Indian multinational IT company offering digital services and next-gen consulting for 50+ Fortune 500 clients.',
        postedBy: sneha._id,
      },
      {
        title: 'Data Engineer (PySpark/AWS)',
        description: `Wipro Technologies is looking for Data Engineers for their Analytics CoE in Hyderabad.\n\n**Responsibilities:**\n- Build and optimize data pipelines with PySpark\n- Design and manage data warehouses on AWS Redshift\n- Collaborate with data scientists for ML feature engineering\n- Monitor pipeline health and data quality\n\n**Perks:**\n- 7-9 LPA\n- WFH 3 days/week\n- AWS certification sponsorship`,
        company: 'Wipro', location: 'Hyderabad, Telangana', type: 'full-time',
        salary: '7-9 LPA', salaryMin: 700000, salaryMax: 900000,
        skills: ['Python', 'PySpark', 'SQL', 'AWS', 'Airflow', 'Data Engineering', 'Redshift'],
        experience: '0-2 years', openings: 8,
        aboutCompany: 'Wipro Limited is a leading global IT services & consulting company with presence in 66 countries.',
        postedBy: rahul._id,
      },
      {
        title: 'SDE Intern (6 months)',
        description: `Amazon is offering a 6-month SDE Internship for final-year students, with a high probability of PPO.\n\n**Responsibilities:**\n- Work on real Amazon systems (not toy projects)\n- Be mentored by senior SDEs\n- Deliver a project with measurable business impact\n- Attend tech talks and networking sessions\n\n**Stipend:**\n- ₹1.5 LPA stipend\n- Relocation allowance\n- PPO evaluation at end`,
        company: 'Amazon', location: 'Bangalore, Karnataka', type: 'internship',
        salary: '₹1.5L/month', salaryMin: 125000, salaryMax: 150000,
        skills: ['Java', 'Data Structures', 'Algorithms', 'System Design', 'AWS', 'SQL'],
        experience: '0-1 years', openings: 12,
        aboutCompany: 'Amazon is a global technology leader in e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.',
        postedBy: pooja._id,
      },
      {
        title: 'ML Engineer (Python/TensorFlow)',
        description: `Google is looking for ML Engineers to join the Google Brain team in Hyderabad.\n\n**Responsibilities:**\n- Train and deploy ML models at scale\n- Work on Google's ML infrastructure\n- Collaborate with research scientists on ML experiments\n- Optimize model performance and reduce latency\n\n**Compensation:**\n- 25-35 LPA (base + stock + bonus)\n- World-class learning resources\n- 20% time for personal projects`,
        company: 'Google', location: 'Hyderabad, Telangana', type: 'full-time',
        salary: '25-35 LPA', salaryMin: 2500000, salaryMax: 3500000,
        skills: ['Python', 'TensorFlow', 'PyTorch', 'ML', 'Go', 'Distributed Systems', 'Kubernetes'],
        experience: '2-5 years', openings: 4,
        aboutCompany: 'Google LLC is an American multinational tech company focusing on AI, search, cloud computing, and online advertising.',
        postedBy: vikram._id,
      },
      {
        title: 'DevOps Engineer (AWS/K8s)',
        description: `HCL Technologies is hiring DevOps Engineers for their Cloud Infrastructure team.\n\n**Responsibilities:**\n- Manage CI/CD pipelines using Jenkins & GitHub Actions\n- Kubernetes cluster management and scaling\n- Infrastructure as Code with Terraform\n- 24/7 on-call rotation (shared among team)\n\n**Benefits:**\n- 7-10 LPA\n- AWS & GCP certification reimbursement\n- Flexible shift timings`,
        company: 'HCL Technologies', location: 'Chennai, Tamil Nadu', type: 'full-time',
        salary: '7-10 LPA', salaryMin: 700000, salaryMax: 1000000,
        skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Linux', 'Python', 'Monitoring'],
        experience: '1-3 years', openings: 6,
        aboutCompany: 'HCL Technologies is a global technology company with expertise in digital transformation, IoT, and cloud services.',
        postedBy: rahul._id,
      },
      {
        title: 'UI/UX Designer + Developer',
        description: `Razorpay is looking for a talented UI/UX Designer + Developer hybrid to join the Growth team.\n\n**Responsibilities:**\n- Design intuitive product flows in Figma\n- Implement designs in React with pixel-perfect accuracy\n- Run A/B tests and analyze user behavior\n- Build and maintain the design system\n\n**Why Razorpay:**\n- 10-15 LPA\n- Direct product impact\n- Design-first culture`,
        company: 'Razorpay', location: 'Bangalore, Karnataka (Hybrid)', type: 'full-time',
        salary: '10-15 LPA', salaryMin: 1000000, salaryMax: 1500000,
        skills: ['Figma', 'React.js', 'CSS', 'Design Systems', 'A/B Testing', 'Framer', 'JavaScript'],
        experience: '1-3 years', openings: 2,
        aboutCompany: "Razorpay is India's leading payments infrastructure company, powering payments for 8M+ businesses including Airtel, Swiggy, and IRCTC.",
        postedBy: pooja._id,
      },
      {
        title: 'Full Stack Developer (Remote)',
        description: `Zepto is hiring Remote Full Stack Developers to scale their q-commerce tech infrastructure.\n\n**Responsibilities:**\n- Build and maintain the Zepto customer and operations platforms\n- Own features end-to-end from design to deployment\n- Optimize system performance for 10ms response times\n- Work with Go backend and React frontend\n\n**Perks:**\n- 12-18 LPA\n- 100% remote\n- Startup equity\n- No rigid 9-to-5`,
        company: 'Zepto', location: 'Remote (India)', type: 'remote',
        salary: '12-18 LPA', salaryMin: 1200000, salaryMax: 1800000,
        skills: ['React.js', 'Go', 'PostgreSQL', 'Redis', 'Kubernetes', 'Node.js', 'TypeScript'],
        experience: '2-5 years', openings: 3,
        aboutCompany: "Zepto is India's fastest-growing instant delivery startup delivering groceries in 10 minutes with a valuation of $1.4B.",
        postedBy: vikram._id,
      },
    ]);

    // Add sample applicants
    jobs[0].applicants.push({ user: priyanshu._id, status: 'pending',   coverLetter: 'I am a MERN stack developer with strong React.js skills and a passion for building great UIs. Excited to contribute to TCS!' });
    jobs[0].applicants.push({ user: anmol._id,     status: 'reviewed',  coverLetter: 'Frontend developer with experience in React and TypeScript. I have built 3+ production apps and would love to join TCS.' });
    jobs[1].applicants.push({ user: kavya._id,     status: 'shortlisted', coverLetter: 'Java Spring Boot developer with strong DSA background from VIT. Have hands-on project experience with microservices.' });
    jobs[2].applicants.push({ user: ritesh._id,    status: 'pending',   coverLetter: 'Data Science student with Python & PySpark skills. Worked on ML pipelines and would love to specialize in Data Engineering.' });
    jobs[3].applicants.push({ user: deepak._id,    status: 'pending',   coverLetter: 'DevOps-focused student with AWS CCP certification. Ready to bring my cloud skills to Amazon!' });
    jobs[4].applicants.push({ user: ritesh._id,    status: 'reviewed',  coverLetter: 'ML researcher with TensorFlow experience and a published paper on computer vision. Dream is to work at Google Brain.' });
    jobs[6].applicants.push({ user: nisha._id,     status: 'shortlisted', coverLetter: 'UI/UX designer and React developer. I have redesigned 3 apps and significantly improved user retention.' });
    jobs[7].applicants.push({ user: priyanshu._id, status: 'pending',   coverLetter: 'Full stack MERN developer looking for a remote opportunity. I thrive in async environments.' });
    await Promise.all(jobs.map(j => j.save()));
    console.log('💼 8 Jobs seeded with applicants');

    // ─── EVENTS (8) ──────────────────────────────────────────────────────────
    await Event.insertMany([
      {
        title: 'Placement Preparation Masterclass 2026',
        description: 'Join senior alumni from TCS, Infosys, Amazon & Google for an exclusive placement prep session. Get insider tips on cracking interviews, understanding the selection process, and building the right mindset. Includes live Q&A and mock interview slots.',
        type: 'placement-talk', date: futureDate(5), time: '10:00 AM IST',
        venue: 'Online · Zoom', link: 'https://zoom.us/j/999888777',
        tags: ['placement', 'interview', 'career', 'FAANG'],
        maxAttendees: 300, attendees: [priyanshu._id, anmol._id, kavya._id, nisha._id],
        createdBy: rahul._id, isFeatured: true,
      },
      {
        title: 'Live DSA Coding Session – Arrays & Linked Lists',
        description: 'A hands-on live coding session solving 6 LeetCode problems on Arrays and Linked Lists. Problems range from Easy to Hard. Perfect for interview prep. Solutions explained in multiple approaches with time & space complexity analysis.',
        type: 'workshop', date: futureDate(8), time: '7:00 PM IST',
        venue: 'YouTube Live', link: 'https://youtube.com/live/alumsphere',
        tags: ['DSA', 'coding', 'LeetCode', 'interview prep', 'algorithms'],
        maxAttendees: 1000, attendees: [priyanshu._id, ritesh._id, kavya._id, deepak._id],
        createdBy: vikram._id, isFeatured: true,
      },
      {
        title: 'AI & ML Trends Conference 2026',
        description: 'A full-day virtual conference exploring the latest trends in Artificial Intelligence and Machine Learning. Featuring keynotes on Generative AI, LLMs, Computer Vision, and Responsible AI. Speakers from Google, Microsoft, OpenAI India, and IITs.',
        type: 'conference', date: futureDate(15), time: '9:00 AM IST',
        venue: 'Online · Google Meet', link: 'https://meet.google.com/alumsphere-ai-conf',
        tags: ['AI', 'ML', 'deep learning', 'LLMs', 'GenAI'],
        maxAttendees: 500, attendees: [ritesh._id, anmol._id, priyanshu._id, deepak._id, kavya._id],
        createdBy: vikram._id, isFeatured: true,
      },
      {
        title: 'Resume & LinkedIn Profile Workshop',
        description: 'Get your resume and LinkedIn profile reviewed by industry professionals from Amazon and Google. Learn how to write ATS-friendly resumes, craft attention-grabbing headlines, and build a LinkedIn presence that gets you noticed by recruiters. 1-on-1 slots for 20 participants.',
        type: 'workshop', date: futureDate(12), time: '2:00 PM IST',
        venue: 'Online · Google Meet', link: 'https://meet.google.com/resume-workshop',
        tags: ['resume', 'LinkedIn', 'career', 'ATS', 'job search'],
        maxAttendees: 80, attendees: [priyanshu._id, nisha._id, anmol._id],
        createdBy: pooja._id,
      },
      {
        title: 'Alumni–Student Networking Meetup',
        description: 'An informal networking event at Chandigarh University connecting students with alumni across various industries — IT, Data Science, Product, Design, and Finance. Share experiences, get mentored, and build lasting professional connections. Refreshments & lucky draw with internship vouchers!',
        type: 'meetup', date: futureDate(22), time: '5:00 PM IST',
        venue: 'Chandigarh University · Main Auditorium',
        link: '',
        tags: ['networking', 'mentorship', 'alumni', 'community', 'offline'],
        maxAttendees: 200, attendees: [priyanshu._id, anmol._id, ritesh._id, kavya._id, deepak._id, nisha._id],
        createdBy: rahul._id, isFeatured: true,
      },
      {
        title: 'System Design for Interviews – Complete Guide',
        description: 'A 3-hour deep dive into System Design concepts frequently asked in software engineering interviews at top companies. Topics: URL Shortener, Twitter Clone, Netflix CDN, WhatsApp Messaging, Uber backend. Includes HLD, LLD, capacity estimation, and database selection.',
        type: 'workshop', date: futureDate(18), time: '6:00 PM IST',
        venue: 'Online · Zoom', link: 'https://zoom.us/j/system-design',
        tags: ['system design', 'interview', 'SDE', 'architecture', 'FAANG'],
        maxAttendees: 150, attendees: [priyanshu._id, kavya._id, ritesh._id],
        createdBy: pooja._id,
      },
      {
        title: 'Web3 & Blockchain for Developers',
        description: 'Introduction to Web3, Solidity smart contracts, and decentralized application (dApp) development. Build your first NFT contract and deploy it on the Ethereum testnet. No prior blockchain experience required — just JavaScript knowledge.',
        type: 'webinar', date: futureDate(28), time: '8:00 PM IST',
        venue: 'Online · Zoom', link: 'https://zoom.us/j/web3-session',
        tags: ['Web3', 'blockchain', 'Solidity', 'NFT', 'Ethereum'],
        maxAttendees: 120, attendees: [deepak._id, anmol._id],
        createdBy: vikram._id,
      },
      {
        title: 'Open Source Contribution – Getting Started',
        description: 'Your first contribution to open source doesn\'t have to be scary! Join this beginner-friendly workshop where we guide you step-by-step through finding the right project, understanding the codebase, and making your first meaningful PR. Alumni mentors available for all major languages.',
        type: 'workshop', date: futureDate(35), time: '11:00 AM IST',
        venue: 'Online · Discord Stage', link: 'https://discord.gg/alumsphere-oss',
        tags: ['open source', 'GitHub', 'beginner', 'community', 'contribution'],
        maxAttendees: 200, attendees: [priyanshu._id, nisha._id, deepak._id, anmol._id],
        createdBy: sneha._id,
      },
    ]);
    console.log('🎯 8 Events seeded');

    // ─── CONNECTIONS (10) ───────────────────────────────────────────────────
    const connData = [
      { sender: priyanshu._id, receiver: rahul._id,  status: 'accepted', message: 'Hi Rahul! MCA student from CU. Would love to connect and learn from your TCS experience.' },
      { sender: priyanshu._id, receiver: sneha._id,  status: 'accepted' },
      { sender: priyanshu._id, receiver: pooja._id,  status: 'pending',  message: 'Hi Pooja! Big fan of your work at Amazon. Could we connect for a quick chat?' },
      { sender: anmol._id,     receiver: sneha._id,  status: 'accepted' },
      { sender: anmol._id,     receiver: vikram._id, status: 'pending' },
      { sender: ritesh._id,    receiver: vikram._id, status: 'accepted', message: 'Hi Vikram! ML researcher from IIT Delhi. Would love to discuss your work at Google Brain.' },
      { sender: kavya._id,     receiver: pooja._id,  status: 'accepted' },
      { sender: kavya._id,     receiver: rahul._id,  status: 'pending' },
      { sender: deepak._id,    receiver: vikram._id, status: 'accepted' },
      { sender: nisha._id,     receiver: sneha._id,  status: 'accepted', message: 'Hi Sneha! Designer-dev from Amity. Would love your advice on transitioning to a product company.' },
    ];
    await Connection.insertMany(connData);

    // Update connections arrays for accepted
    const acceptedPairs = [
      [priyanshu._id, rahul._id], [priyanshu._id, sneha._id],
      [anmol._id, sneha._id], [ritesh._id, vikram._id],
      [kavya._id, pooja._id], [deepak._id, vikram._id],
      [nisha._id, sneha._id],
    ];
    await Promise.all(acceptedPairs.flatMap(([a, b]) => [
      User.findByIdAndUpdate(a, { $addToSet: { connections: b } }),
      User.findByIdAndUpdate(b, { $addToSet: { connections: a } }),
    ]));
    console.log('🤝 10 Connections seeded');

    // ─── ANNOUNCEMENTS (5) ──────────────────────────────────────────────────
    await Announcement.insertMany([
      {
        title: '🎉 Welcome to AlumSphere!',
        content: 'We are excited to launch AlumSphere – your AI-powered alumni networking platform! Connect with alumni, discover jobs, attend events, and grow your career. Start by completing your profile to unlock AI recommendations.',
        createdBy: admin._id, targetRole: 'all', isPinned: true
      },
      {
        title: '📢 Campus Placement Drive 2026 – Registration Open',
        content: 'The annual campus placement drive for the 2026 batch is now open. Companies participating: TCS, Infosys, Wipro, HCL, Amazon, Cognizant, and more. Register before April 30th through the portal.',
        createdBy: admin._id, targetRole: 'student', isPinned: true
      },
      {
        title: '✅ Alumni Verification – Submit Documents',
        content: 'All alumni who have not yet verified their profiles — please submit your company ID card or offer letter through Profile Settings → Verification. Verified alumni unlock mentoring and job posting features.',
        createdBy: admin._id, targetRole: 'alumni', isPinned: false
      },
      {
        title: '🏆 AlumSphere Leaderboard – April 2026',
        content: 'The April 2026 leaderboard is now live! Top contributors earn exclusive badges, priority mentorship slots, and feature spotlights on the platform homepage. Earn points by connecting, enrolling in events, and helping others.',
        createdBy: admin._id, targetRole: 'all', isPinned: false
      },
      {
        title: '🤖 AI Career Hub – New Features Launched',
        content: 'The AI Career Hub now includes: Resume ATS Score Analyzer, Personalized Career Roadmap Generator, Job Match Score, and Skill Demand Trends. Login and explore under the AI Hub section.',
        createdBy: admin._id, targetRole: 'all', isPinned: true
      },
    ]);
    console.log('📢 5 Announcements seeded');

    // ─── GROUPS (6) + POSTS ──────────────────────────────────────────────────
    const [g1, g2, g3, g4, g5, g6] = await Group.insertMany([
      {
        name: 'MERN Stack Developers',
        description: 'A community for MERN stack enthusiasts. Share projects, ask questions, find collaborators, and grow together.',
        category: 'Technology', tags: ['MERN', 'React', 'Node.js', 'MongoDB', 'Express'],
        createdBy: priyanshu._id,
        members: [priyanshu._id, anmol._id, rahul._id, sneha._id, nisha._id],
        moderators: [priyanshu._id]
      },
      {
        name: 'Placement 2026 – Prep Hub',
        description: 'Exclusive group for 2026 batch students preparing for campus placements. Share resources, mock tests, and interview experiences.',
        category: 'Career', tags: ['placement', '2026', 'interview', 'jobs', 'OA'],
        createdBy: admin._id,
        members: [priyanshu._id, anmol._id, ritesh._id, kavya._id, deepak._id, nisha._id],
        moderators: [admin._id, rahul._id]
      },
      {
        name: 'AI & ML Enthusiasts',
        description: 'Discuss latest developments in AI/ML, share research papers, projects, and Kaggle competitions.',
        category: 'Technology', tags: ['AI', 'ML', 'deep learning', 'NLP', 'research', 'Kaggle'],
        createdBy: ritesh._id,
        members: [ritesh._id, rahul._id, sneha._id, vikram._id, pooja._id, priyanshu._id],
        moderators: [ritesh._id, vikram._id]
      },
      {
        name: 'DevOps & Cloud Engineers',
        description: 'For everyone passionate about cloud computing, containers, CI/CD, and infrastructure automation.',
        category: 'Technology', tags: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'Terraform', 'Cloud'],
        createdBy: deepak._id,
        members: [deepak._id, vikram._id, pooja._id, rahul._id, amit._id],
        moderators: [deepak._id]
      },
      {
        name: 'Design & Frontend Guild',
        description: 'A space for UI/UX designers and frontend developers to share inspiration, critique work, and discuss design systems.',
        category: 'Design', tags: ['UI/UX', 'Figma', 'React', 'design systems', 'CSS', 'frontend'],
        createdBy: nisha._id,
        members: [nisha._id, anmol._id, sneha._id, priyanshu._id],
        moderators: [nisha._id]
      },
      {
        name: 'Alumni Mentors Network',
        description: 'Exclusive group for verified alumni mentors to coordinate sessions, share resources, and discuss student mentoring best practices.',
        category: 'Career', tags: ['mentorship', 'alumni', 'guidance', 'career coaching'],
        createdBy: rahul._id,
        members: [rahul._id, sneha._id, pooja._id, vikram._id],
        moderators: [rahul._id, pooja._id]
      },
    ]);

    await Post.insertMany([
      { content: '🚀 Just launched AlumSphere! Built with React + Node.js + MongoDB. Would love your feedback on the UI and performance. GitHub link in bio!', author: priyanshu._id, group: g1._id, type: 'post', tags: ['MERN', 'launch', 'project'], likes: [anmol._id, rahul._id, sneha._id], views: 142 },
      { content: '📌 Resource Drop: Best free courses to learn React in 2026:\n1. React Docs (Official) — best starting point\n2. Scrimba React Course (free tier)\n3. Jack Herrington YouTube — advanced patterns\n4. Theo T3 — modern patterns\n\nSave this! 🔖', author: anmol._id, group: g1._id, type: 'post', tags: ['React', 'resources', 'learning'], likes: [priyanshu._id, nisha._id, kavya._id], views: 208 },
      { content: '❓ Question: I have an Amazon online assessment tomorrow. Any last-minute tips for the coding round? Specifically struggling with DP and Graphs.', author: kavya._id, group: g2._id, type: 'question', tags: ['Amazon', 'OA', 'DSA', 'DP'], likes: [priyanshu._id, deepak._id], views: 95 },
      { content: '✅ Cracked my TCS NQT interview! Here is my prep timeline:\n• Week 1-2: Aptitude (IndiaBix)\n• Week 3-4: DSA basics (Striver SDE sheet)\n• Week 5-6: Mock TCS NQT tests\n\nFeel free to ask me anything! Happy to help 2026 batch 🙌', author: anmol._id, group: g2._id, type: 'post', tags: ['TCS', 'NQT', 'placement', 'success'], likes: [priyanshu._id, ritesh._id, kavya._id, deepak._id, nisha._id], views: 312 },
      { content: '📄 Sharing my notes on Transformer architecture and BERT fine-tuning — compiled after reading the original "Attention is All You Need" paper and 3 follow-up papers. PDF link: [Check pinned resources]. Feel free to contribute corrections!', author: ritesh._id, group: g3._id, type: 'post', tags: ['Transformers', 'BERT', 'NLP', 'research'], likes: [vikram._id, priyanshu._id, sneha._id], views: 187 },
      { content: '🔥 GPT-4o vs Gemini Ultra — I ran 50 coding benchmarks. Results: GPT-4o wins on Python generation, Gemini Ultra wins on reasoning tasks. Full analysis in thread 👇', author: vikram._id, group: g3._id, type: 'post', tags: ['GPT-4', 'Gemini', 'AI comparison', 'LLMs'], likes: [ritesh._id, pooja._id, rahul._id, priyanshu._id], views: 423 },
      { content: '🐳 Wrote a blog post on optimizing Docker multi-stage builds to reduce image size from 1.2GB to 89MB. Key tricks: use Alpine base, combine RUN commands, .dockerignore strictly. Full post on my GitHub Pages!', author: deepak._id, group: g4._id, type: 'post', tags: ['Docker', 'DevOps', 'optimization', 'containers'], likes: [vikram._id, rahul._id], views: 134 },
      { content: '🎨 Sharing my Figma design system for dark-themed SaaS apps — includes color tokens, typography scale, component library (80+ components), and motion guidelines. Free to use, attribution appreciated!', author: nisha._id, group: g5._id, type: 'post', tags: ['Figma', 'design system', 'dark mode', 'SaaS'], likes: [anmol._id, priyanshu._id, sneha._id], views: 256 },
    ]);
    console.log('👥 6 Groups + 8 Posts seeded');

    // ─── CONVERSATIONS & MESSAGES ───────────────────────────────────────────
    const makeConvId = (a, b) => [a.toString(), b.toString()].sort().join('_');

    // Conversation 1: Priyanshu <-> Rahul (mentor chat)
    const conv1Id = makeConvId(priyanshu._id, rahul._id);
    const conv1Msgs = await Message.insertMany([
      { conversationId: conv1Id, sender: priyanshu._id, receiver: rahul._id, content: 'Hi Rahul bhai! I am Priyanshu Singh, MCA student from CU. I saw your profile and would love to connect. I am preparing for TCS NQT.', isRead: true, createdAt: new Date(Date.now() - 3*24*60*60*1000) },
      { conversationId: conv1Id, sender: rahul._id, receiver: priyanshu._id, content: 'Hey Priyanshu! Happy to connect. TCS NQT is quite doable. Focus on aptitude + coding rounds. What skills do you currently have?', isRead: true, createdAt: new Date(Date.now() - 3*24*60*60*1000 + 5*60*1000) },
      { conversationId: conv1Id, sender: priyanshu._id, receiver: rahul._id, content: 'I know React, Node.js, MongoDB. Strong in JavaScript. DSA is average right now. Practicing on LeetCode.', isRead: true, createdAt: new Date(Date.now() - 2*24*60*60*1000) },
      { conversationId: conv1Id, sender: rahul._id, receiver: priyanshu._id, content: 'Great stack! For TCS, focus on easy-medium DSA. Arrays, Strings, Basic DP. Also do the TCS iON mock tests. Your MERN skills will help in the technical interview round.', isRead: true, createdAt: new Date(Date.now() - 2*24*60*60*1000 + 10*60*1000) },
      { conversationId: conv1Id, sender: priyanshu._id, receiver: rahul._id, content: 'Thank you so much! Can you review my resume once? I will share it on LinkedIn.', isRead: true, createdAt: new Date(Date.now() - 1*24*60*60*1000) },
      { conversationId: conv1Id, sender: rahul._id, receiver: priyanshu._id, content: 'Sure, send it over! Also check the Jobs section on AlumSphere — I posted a React Developer opening at TCS Noida specifically for freshers. Apply there too 😊', isRead: false, createdAt: new Date(Date.now() - 30*60*1000) },
    ]);
    const conv1 = await Conversation.create({
      participants: [priyanshu._id, rahul._id],
      lastMessage: conv1Msgs[conv1Msgs.length - 1]._id,
      lastMessageAt: conv1Msgs[conv1Msgs.length - 1].createdAt,
    });

    // Conversation 2: Priyanshu <-> Sneha (career advice)
    const conv2Id = makeConvId(priyanshu._id, sneha._id);
    const conv2Msgs = await Message.insertMany([
      { conversationId: conv2Id, sender: priyanshu._id, receiver: sneha._id, content: 'Hello Sneha di! I am a MERN stack student. I am interested in moving to product companies after graduation. Any advice?', isRead: true, createdAt: new Date(Date.now() - 5*24*60*60*1000) },
      { conversationId: conv2Id, sender: sneha._id, receiver: priyanshu._id, content: 'Hi Priyanshu! Great question. Product companies look for strong DSA + system design + communication skills. Start building projects with real users. What is your current project?', isRead: true, createdAt: new Date(Date.now() - 5*24*60*60*1000 + 20*60*1000) },
      { conversationId: conv2Id, sender: priyanshu._id, receiver: sneha._id, content: 'I am building AlumSphere — an AI-powered alumni networking platform for my MCA project. Full MERN stack with Socket.io for real-time features.', isRead: true, createdAt: new Date(Date.now() - 4*24*60*60*1000) },
      { conversationId: conv2Id, sender: sneha._id, receiver: priyanshu._id, content: 'Wow that sounds impressive! Real-time features + AI integration is exactly what product companies want to see. Add analytics, user metrics. That project alone can get you interviews at Infosys, Razorpay type companies.', isRead: true, createdAt: new Date(Date.now() - 4*24*60*60*1000 + 15*60*1000) },
      { conversationId: conv2Id, sender: priyanshu._id, receiver: sneha._id, content: 'Amazing! I will add analytics dashboard. Can we schedule a mock interview some time? Would love your feedback!', isRead: true, createdAt: new Date(Date.now() - 2*24*60*60*1000) },
      { conversationId: conv2Id, sender: sneha._id, receiver: priyanshu._id, content: 'Absolutely! This weekend works for me. Saturday 4 PM IST? I will focus on React + system design basics. Be prepared with your project architecture too 💪', isRead: false, createdAt: new Date(Date.now() - 45*60*1000) },
    ]);
    const conv2 = await Conversation.create({
      participants: [priyanshu._id, sneha._id],
      lastMessage: conv2Msgs[conv2Msgs.length - 1]._id,
      lastMessageAt: conv2Msgs[conv2Msgs.length - 1].createdAt,
    });

    // Conversation 3: Priyanshu <-> Pooja (Amazon internship)
    const conv3Id = makeConvId(priyanshu._id, pooja._id);
    const conv3Msgs = await Message.insertMany([
      { conversationId: conv3Id, sender: priyanshu._id, receiver: pooja._id, content: 'Hi Pooja ma\'am! I saw the Amazon SDE Intern opening you posted. I am very interested. Could you guide me on what Amazon looks for in interns?', isRead: true, createdAt: new Date(Date.now() - 6*24*60*60*1000) },
      { conversationId: conv3Id, sender: pooja._id, receiver: priyanshu._id, content: 'Hi! Amazon focuses heavily on Leadership Principles + DSA. For interns we look for: problem solving attitude, clean code, thorough testing mindset. What is your DSA level right now?', isRead: true, createdAt: new Date(Date.now() - 6*24*60*60*1000 + 30*60*1000) },
      { conversationId: conv3Id, sender: priyanshu._id, receiver: pooja._id, content: 'I have solved 120+ LeetCode problems. Comfortable with Arrays, Strings, Binary Search. Working on DP and Graphs now.', isRead: true, createdAt: new Date(Date.now() - 5*24*60*60*1000) },
      { conversationId: conv3Id, sender: pooja._id, receiver: priyanshu._id, content: '120+ is a good start! For Amazon OA you need BFS/DFS too. Practice the "Amazon tagged" filter on LeetCode. Apply through the AlumSphere job listing, it goes directly to our team.', isRead: true, createdAt: new Date(Date.now() - 5*24*60*60*1000 + 10*60*1000) },
      { conversationId: conv3Id, sender: priyanshu._id, receiver: pooja._id, content: 'Applied! Thank you so much for the guidance. Really appreciate it 🙏', isRead: true, createdAt: new Date(Date.now() - 3*24*60*60*1000) },
    ]);
    const conv3 = await Conversation.create({
      participants: [priyanshu._id, pooja._id],
      lastMessage: conv3Msgs[conv3Msgs.length - 1]._id,
      lastMessageAt: conv3Msgs[conv3Msgs.length - 1].createdAt,
    });

    // Conversation 4: Priyanshu <-> Ritesh (peer/project help)
    const conv4Id = makeConvId(priyanshu._id, ritesh._id);
    const conv4Msgs = await Message.insertMany([
      { conversationId: conv4Id, sender: ritesh._id, receiver: priyanshu._id, content: 'Hey Priyanshu! Saw your AlumSphere project on LinkedIn. Looks sick bro! Are you open source? I want to contribute.', isRead: true, createdAt: new Date(Date.now() - 7*24*60*60*1000) },
      { conversationId: conv4Id, sender: priyanshu._id, receiver: ritesh._id, content: 'Hey Ritesh! Thanks man! Not yet open source but I can add you as collaborator. Are you into full-stack or more ML side?', isRead: true, createdAt: new Date(Date.now() - 7*24*60*60*1000 + 15*60*1000) },
      { conversationId: conv4Id, sender: ritesh._id, receiver: priyanshu._id, content: 'I am more ML side, but know Python Flask for backend. I was thinking — you could integrate an actual ML model for job matching instead of rule-based scoring? I can build that part!', isRead: true, createdAt: new Date(Date.now() - 6*24*60*60*1000) },
      { conversationId: conv4Id, sender: priyanshu._id, receiver: ritesh._id, content: 'Bro that would be amazing! Skill vector similarity using TF-IDF or cosine similarity? Let us discuss the architecture. Call on Discord tonight?', isRead: true, createdAt: new Date(Date.now() - 6*24*60*60*1000 + 5*60*1000) },
      { conversationId: conv4Id, sender: ritesh._id, receiver: priyanshu._id, content: 'Yes! Cosine similarity with skill embeddings. I will also add experience level weighting. Tonight 9 PM Discord 💪', isRead: true, createdAt: new Date(Date.now() - 5*24*60*60*1000) },
      { conversationId: conv4Id, sender: priyanshu._id, receiver: ritesh._id, content: 'Perfect! Repository link sent on LinkedIn. See you tonight 🙌', isRead: true, createdAt: new Date(Date.now() - 5*24*60*60*1000 + 2*60*1000) },
    ]);
    const conv4 = await Conversation.create({
      participants: [priyanshu._id, ritesh._id],
      lastMessage: conv4Msgs[conv4Msgs.length - 1]._id,
      lastMessageAt: conv4Msgs[conv4Msgs.length - 1].createdAt,
    });

    // Conversation 5: Priyanshu <-> Vikram (Google prep)
    const conv5Id = makeConvId(priyanshu._id, vikram._id);
    const conv5Msgs = await Message.insertMany([
      { conversationId: conv5Id, sender: priyanshu._id, receiver: vikram._id, content: 'Hello Vikram sir! I am a huge admirer of your work at Google. Is it okay if I ask a few questions about preparing for Google SWE interviews?', isRead: true, createdAt: new Date(Date.now() - 10*24*60*60*1000) },
      { conversationId: conv5Id, sender: vikram._id, receiver: priyanshu._id, content: 'Hi Priyanshu! Absolutely, happy to help. Google SWE interviews are 5-6 rounds: 1 coding screen + 4-5 onsite (DSA + system design + behavioral). What is your current background?', isRead: true, createdAt: new Date(Date.now() - 10*24*60*60*1000 + 45*60*1000) },
      { conversationId: conv5Id, sender: priyanshu._id, receiver: vikram._id, content: 'MCA 2nd year. MERN stack + some Python. Leetcode 120+ problems. I know Google needs much more preparation but it is my dream company long term.', isRead: true, createdAt: new Date(Date.now() - 9*24*60*60*1000) },
      { conversationId: conv5Id, sender: vikram._id, receiver: priyanshu._id, content: 'Great foundation! For Google long-term plan: 1) Solve 300-400 LC problems (medium/hard) 2) Master system design 3) Contribute to open source 4) Build impactful projects 5) Apply after 2-3 years of industry experience. Google values depth over breadth.', isRead: true, createdAt: new Date(Date.now() - 9*24*60*60*1000 + 20*60*1000) },
      { conversationId: conv5Id, sender: priyanshu._id, receiver: vikram._id, content: 'This is gold! Thank you sir. I will follow this roadmap. Any specific topics for system design?', isRead: true, createdAt: new Date(Date.now() - 8*24*60*60*1000) },
      { conversationId: conv5Id, sender: vikram._id, receiver: priyanshu._id, content: 'Start with: Load balancers, Caching (Redis), Database sharding, Message queues (Kafka), CDN. Read the "Designing Data-Intensive Applications" book — it is the Bible for this. All the best! 🌟', isRead: false, createdAt: new Date(Date.now() - 2*60*60*1000) },
    ]);
    const conv5 = await Conversation.create({
      participants: [priyanshu._id, vikram._id],
      lastMessage: conv5Msgs[conv5Msgs.length - 1]._id,
      lastMessageAt: conv5Msgs[conv5Msgs.length - 1].createdAt,
    });

    console.log('💬 5 Conversations + 27 Messages seeded');

    console.log('\n🎉 SEED COMPLETE! All features now have rich data.\n');
    console.log('════════════════════ TEST CREDENTIALS ════════════════════');
    console.log('Students:');
    console.log('  priyanshu@cu.ac.in     | Password@123  (MERN Dev)');
    console.log('  anmol@du.ac.in         | Password@123  (Frontend)');
    console.log('  ritesh@iit.ac.in       | Password@123  (ML/AI)');
    console.log('  kavya@vit.ac.in        | Password@123  (Java/DSA)');
    console.log('  deepak@bits.ac.in      | Password@123  (DevOps)');
    console.log('  nisha@amity.ac.in      | Password@123  (UI/UX)');
    console.log('Alumni:');
    console.log('  rahul.verma@tcs.com       | Password@123  ✅ TCS SDE');
    console.log('  sneha.kapoor@infosys.com  | Password@123  ✅ Infosys');
    console.log('  amit.sharma@wipro.com     | Password@123  ⏳ Pending');
    console.log('  pooja.mehta@amazon.com    | Password@123  ✅ Amazon');
    console.log('  vikram.joshi@google.com   | Password@123  ✅ Google');
    console.log('Admin:');
    console.log('  admin@alumsphere.com      | Password@123');
    console.log('══════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
