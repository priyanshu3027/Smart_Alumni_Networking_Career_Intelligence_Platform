const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
['uploads/avatars', 'uploads/resumes', 'uploads/docs', 'uploads/posts'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'resume') cb(null, 'uploads/resumes');
    else if (file.fieldname === 'avatar') cb(null, 'uploads/avatars');
    else if (file.fieldname === 'postImage') cb(null, 'uploads/posts');
    else cb(null, 'uploads/docs');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error('Only PDF, DOC, DOCX allowed for resume'));
    }
  }
  if (file.fieldname === 'avatar' || file.fieldname === 'postImage') {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error('Only JPG, PNG, WEBP, GIF allowed for images'));
    }
  }
  cb(null, true);
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
