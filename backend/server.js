import express      from 'express';
import cors         from 'cors';
import mongoose     from 'mongoose';
import dotenv       from 'dotenv';
import path         from 'path';
import { fileURLToPath } from 'url';
import crypto       from 'crypto';
import jwt          from "jsonwebtoken";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app  = express();
const PORT = process.env.PORT || 8082;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Database ──────────────────────────────────────────────────────────────
const DB = process.env.MONGO_URI;
if (!DB) { console.error('FATAL: MONGO_URI not defined'); process.exit(1); }

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    dbName: 'Rig-Op',
    family: 4,
  })
  .then(() => console.log('DB Connected to Rig-Op'))
  .catch(err => { console.error('❌ DB Error:', err.message); process.exit(1); });

// ── Schemas ───────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  fname:            { type: String,  required: true },
  sname:            { type: String,  required: true },
  username:         { type: String,  required: true, unique: true },
  email:            { type: String,  required: true, unique: true },
  phonenumber:      { type: Number,  required: true, unique: true },
  password:         { type: String,  required: true },
  department:       { type: String,  required: true },
  role:             { type: String,  required: true },
  isActive:         { type: Boolean, required: true, default: false },
  dob:              { type: Date,    required: true },
  ticketsCompleted: { type: Number,  default: 0 },
}, { timestamps: true });

const reportSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:    { type: String, required: true },
  title:       { type: String, required: true },
  type:        { type: String, required: true, enum: ['Incident', 'Maintenance', 'Safety', 'Environmental', 'Equipment', 'Other'] },
  priority:    { type: String, required: true, enum: ['Low', 'Medium', 'High', 'Critical'] },
  location:    { type: String, default: '' },
  description: { type: String, required: true },
  status:      { type: String, default: 'Open', enum: ['Open', 'In_Progress', 'Resolved', 'Closed'] },
}, { timestamps: true });

const supportSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:    { type: String, required: true },
  title:       { type: String, required: true },
  category:    { type: String, required: true, enum: ['Technical', 'Operational', 'HR', 'Safety', 'Equipment', 'Other'] },
  priority:    { type: String, required: true, enum: ['Low', 'Medium', 'High', 'Critical'] },
  description: { type: String, required: true },
  status:      { type: String, default: 'Open', enum: ['Open', 'Pending', 'In_Progress', 'Resolved', 'Closed'] },
  resolvedAt:  { type: Date, default: null },
}, { timestamps: true });

// ── Models ────────────────────────────────────────────────────────────────
const User    = mongoose.model('User',    userSchema,    'Users');
const Report  = mongoose.model('Report',  reportSchema,  'Reports');
const Support = mongoose.model('Support', supportSchema, 'SupportTickets');

// ── Auth Middleware ───────────────────────────────────────────────────────
// Decodes the JWT and attaches { id, username, role } to req.user
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

 const token = authHeader.slice(7).trim();

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Guard against jwt.verify returning undefined (seen in older package versions)
    if (!decoded || !decoded.id) {
      console.error('requireAuth: jwt.verify returned invalid payload:', decoded);
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('requireAuth: jwt.verify threw:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════════════════════════════════════════════════

// POST /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Wrong password' });
    }

    // Mark user active on login
    await User.updateOne({ _id: user._id }, { $set: { isActive: true } });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /createAccount
app.post('/createAccount', async (req, res) => {
  const { fname, sname, email, phonenumber, password, role, subRole, dob } = req.body;

  if (!fname || !sname || !email || !phonenumber || !password || !role || !dob) {
    return res.status(400).json({ success: false, message: 'All mandatory fields are required' });
  }
  if (role === 'Maintenance' && !subRole) {
    return res.status(400).json({ success: false, message: 'Please select a specific trade for Maintenance' });
  }

  try {
    const username     = `${fname.toLowerCase()}.${sname.toLowerCase()}`;
    const dbDepartment = role;
    const dbRole       = role === 'Maintenance' ? subRole : 'Staff';

    const newUser = new User({
      fname, sname, username, email, phonenumber, password,
      role: dbRole, department: dbDepartment, isActive: false, dob,
    });

    await newUser.save();
    console.log(`Account created: ${username} in ${dbDepartment} as ${dbRole}`);

    res.status(201).json({
      success: true,
      message: 'Account created',
      user: { username, department: dbDepartment, role: dbRole },
    });
  } catch (err) {
    console.error('CreateAccount error:', err);
    let msg = 'Account creation failed';
    if (err.code === 11000) {
      if (err.message.includes('email'))       msg = 'Email already exists';
      else if (err.message.includes('username')) msg = 'Username already exists';
      else if (err.message.includes('phonenumber')) msg = 'Phone number already exists';
      else msg = 'Duplicate field error';
    }
    res.status(500).json({ success: false, message: msg });
  }
});

// POST /logout  — JWT is stateless; we just mark the user inactive
app.post('/logout', requireAuth, async (req, res) => {
  try {
    await User.updateOne({ _id: req.user.id }, { $set: { isActive: false } });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// PROFILE ROUTES
// ════════════════════════════════════════════════════════════════════════════

// GET /profile
app.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id:               user._id,
        username:         user.username,
        password:         user.password,
        email:            user.email,
        phonenumber:      user.phonenumber,
        role:             user.role,
        department:       user.department,
        dob:              user.dob,
        isActive:         user.isActive,
        ticketsCompleted: user.ticketsCompleted,
      },
    });
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// POST /updateUser
app.post('/updateUser', requireAuth, async (req, res) => {
  try {
    const updates = { ...req.body };
    // Prevent privilege escalation
    delete updates.role;
    delete updates.isActive;
    delete updates.ticketsCompleted;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-__v');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (err) {
    console.error('UpdateUser error:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// HOME / DASHBOARD
// ════════════════════════════════════════════════════════════════════════════

// GET /home
app.get('/home', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user   = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [
      totalReports, totalTickets,
      openReports,  openTickets,
      criticalReports, criticalTickets,
      resolvedReports, teamCount,
    ] = await Promise.all([
      Report.countDocuments({ userId }),
      Support.countDocuments({ userId }),
      Report.countDocuments({ userId, status: 'Open' }),
      Support.countDocuments({ userId, status: { $in: ['Open', 'Pending'] } }),
      Report.countDocuments({ userId, priority: 'Critical', status: { $nin: ['Resolved', 'Closed'] } }),
      Support.countDocuments({ userId, priority: 'Critical', status: { $nin: ['Resolved', 'Closed'] } }),
      Report.countDocuments({ userId, status: { $in: ['Resolved', 'Closed'] } }),
      User.countDocuments({ role: user.role }),
    ]);

    const [recentReports, recentTickets] = await Promise.all([
      Report.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Support.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    res.json({
      success: true,
      user: {
        id:               user._id,
        username:         user.username,
        role:             user.role,
        isActive:         user.isActive,
        ticketsCompleted: user.ticketsCompleted,
      },
      stats: {
        totalReports,
        totalTickets,
        openItems:    openReports + openTickets,
        resolvedReports,
        criticalCount: criticalReports + criticalTickets,
        teamCount,
      },
      recent: { reports: recentReports, tickets: recentTickets },
    });
  } catch (err) {
    console.error('Home error:', err);
    res.status(500).json({ success: false, message: 'Dashboard fetch failed' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// REPORT ROUTES
// ════════════════════════════════════════════════════════════════════════════

// POST /reports/create
app.post('/reports/create', requireAuth, async (req, res) => {
  const { title, type, priority, location, description } = req.body;
  if (!title || !type || !priority || !description) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  try {
    const report = new Report({
      userId:   req.user.id,
      username: req.user.username,
      title, type, priority, location: location || '', description,
    });
    await report.save();
    console.log('📋 Report created:', report._id, '| User:', report.username);
    res.status(201).json({ success: true, message: 'Report filed', report });
  } catch (err) {
    console.error('Report create error:', err);
    res.status(500).json({ success: false, message: 'Failed to create report' });
  }
});

// GET /reports/list — IT/Admin see all; others see own
app.get('/reports/list', requireAuth, async (req, res) => {
  try {
    const { role, id } = req.user;
    const filter = ['IT', 'Admin'].includes(role) ? {} : { userId: id };
    const reports = await Report.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, reports });
  } catch (err) {
    console.error('Report list error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
});

// PATCH /reports/:id/status
app.patch('/reports/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const allowed = ['Open', 'In_Progress', 'Resolved', 'Closed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }
  try {
    const { role, id } = req.user;
    const filter = { _id: req.params.id };
    if (!['IT', 'Admin'].includes(role)) filter.userId = id;

    const report = await Report.findOneAndUpdate(filter, { $set: { status } }, { new: true });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found or not authorised' });

    res.json({ success: true, report });
  } catch (err) {
    console.error('Report status update error:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// SUPPORT TICKET ROUTES
// ════════════════════════════════════════════════════════════════════════════

// POST /support/create
app.post('/support/create', requireAuth, async (req, res) => {
  const { title, category, priority, description } = req.body;
  if (!title || !category || !priority || !description) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  try {
    const ticket = new Support({
      userId:   req.user.id,
      username: req.user.username,
      title, category, priority, description,
    });
    await ticket.save();
    console.log('🎫 Support ticket created:', ticket._id, '| User:', ticket.username);
    res.status(201).json({ success: true, message: 'Ticket submitted', ticket });
  } catch (err) {
    console.error('Support create error:', err);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
});

// GET /support/list — IT/Admin see all; others see own
app.get('/support/list', requireAuth, async (req, res) => {
  try {
    const { role, id } = req.user;
    const filter = ['IT', 'Admin'].includes(role) ? {} : { userId: id };
    const tickets = await Support.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, tickets });
  } catch (err) {
    console.error('Support list error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// PATCH /support/:id/status
app.patch('/support/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const allowed = ['Open', 'Pending', 'In_Progress', 'Resolved', 'Closed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }
  try {
    const { role, id } = req.user;
    const filter = { _id: req.params.id };
    if (!['IT', 'Admin'].includes(role)) filter.userId = id;

    const updateData = { status };
    if (status === 'Resolved') {
      updateData.resolvedAt = new Date();
      // Increment ticketsCompleted counter for the ticket owner
      const ticket = await Support.findOne(filter);
      if (ticket) {
        await User.updateOne({ _id: ticket.userId }, { $inc: { ticketsCompleted: 1 } });
      }
    }

    const ticket = await Support.findOneAndUpdate(filter, { $set: updateData }, { new: true });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found or not authorised' });

    res.json({ success: true, ticket });
  } catch (err) {
    console.error('Support status update error:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});