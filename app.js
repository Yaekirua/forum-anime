const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const Thread = require('./models/thread');
const Reply = require('./models/reply');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-forum';
mongoose.connect(mongoURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

// Middleware
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes

// Home Page
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// Forum Category Page
app.get('/forum/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const threads = await Thread.find({ category }).sort({ createdAt: -1 });
    res.render('forum', { title: `${category} Discussions`, category, threads });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Create a New Thread
app.post('/thread/create', async (req, res) => {
  try {
    const { title, content, author, category } = req.body;
    const newThread = new Thread({ title, content, author, category });
    await newThread.save();
    io.emit('newThread', newThread); // Broadcast new thread to all clients
    res.redirect(`/forum/${category}`);
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Thread Detail Page
app.get('/thread/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    const replies = await Reply.find({ threadId: req.params.id }).sort({ createdAt: 1 });
    res.render('thread', { title: thread.title, thread, replies });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Create a New Reply
app.post('/reply/create', async (req, res) => {
  try {
    const { content, author, threadId } = req.body;
    const newReply = new Reply({ content, author, threadId });
    await newReply.save();
    io.emit('newReply', newReply); // Broadcast new reply to all clients
    res.redirect(`/thread/${threadId}`);
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});