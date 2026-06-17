// AlumSphere API Server — Gemini AI enabled
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const eventRoutes = require('./routes/eventRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const communityRoutes = require('./routes/communityRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const postRoutes = require('./routes/postRoutes');

// Connect to DB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] }
});

// Track online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', async (data) => {
    const { receiverId, senderId, content, senderName, senderAvatar } = data;
    // Emit to receiver
    io.to(receiverId).emit('receiveMessage', {
      _id: Date.now().toString(),
      sender: { _id: senderId, name: senderName, avatar: senderAvatar },
      content,
      createdAt: new Date(),
      isRead: false
    });
    // Also emit notification if receiver not in chat
    io.to(receiverId).emit('newNotification', {
      type: 'message', title: 'New Message',
      message: `${senderName}: ${content.substring(0, 50)}`, fromUser: { name: senderName, avatar: senderAvatar }
    });
  });

  socket.on('typing', (data) => {
    io.to(data.receiverId).emit('userTyping', { senderId: data.senderId });
  });

  socket.on('stopTyping', (data) => {
    io.to(data.receiverId).emit('userStopTyping', { senderId: data.senderId });
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) { onlineUsers.delete(userId); break; }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/posts', postRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'AlumSphere API is running 🚀', timestamp: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));

module.exports = { app, io };
