import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import crypto from 'crypto';   


const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Explicitly tell dotenv to look for the .env file in the server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

const DB = process.env.MONGO_URI;
if (!DB) {
  console.error('FATAL ERROR: MONGO_URI is not defined');
  process.exit(1);
}

mongoose
  .connect(DB, { dbName: 'Rig-Op' })
  .then(() => console.log('DB Connected to Rig-Op database'))
  .catch(err => {
    console.error('DB Connection Error:', err.message);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  sname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phonenumber: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  isActive: {type:Boolean, required: true},
  dob: {type: Date, required: true}
});

const sessionSecret = process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim() !== ""
      ? process.env.SESSION_SECRET
      : crypto.randomBytes(64).toString('hex');

console.log("🔑 Session Secret in use:", sessionSecret);

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
  })
);

const User = mongoose.model('User', userSchema, 'Users');

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User does not exist'
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

   await User.updateOne(
      {username : user.username},
      {$set: {isActive: true}
    });


    req.session.user = {
      id: user._id,
      username: username,
      role: user.role,
      isActive: true
    };
console.log("🆕 New session created:", {
  sessionID: req.sessionID,
  user: req.session.user
});

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

app.post('/createAccount', async (req, res) => {
  const { fname, sname, email, phonenumber, password, role, isActive, dob } = req.body;

  if (!fname || !sname || !email || !phonenumber || !password || !role|| !dob) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  try {
    const username = `${fname.toLowerCase()}.${sname.toLowerCase()}`;

    const newUser = new User({
      fname,
      sname,
      username,
      email,
      phonenumber,
      password,
      role,
      isActive,
      dob
    });

    await newUser.save();
    
      console.log("Account created successfully", {
        username,
        role,
        status: 201
      });
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        username,
        role,
        dob
      }
    });
  } catch (error) {
    console.error('Creation Error:', error);

    let errorMessage = 'Account creation failed';
    if (error.code === 11000) {
      if (error.message.includes('email')) {
        errorMessage = 'Email already exists';
      } else if (error.message.includes('username')) {
        errorMessage = 'Username already exists';
      } else if (error.message.includes('phonenumber')) {
        errorMessage = 'Phone Number already exists';
      } else {
        errorMessage = 'Duplicate field exists';
      }
    }

    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

app.post('/profile', async (req, res) => {
  try{
    if(!req.session.user || !req.session.user.id ){
      return res.status(400).json({
        success:false,
        message: 'No Active sessions'
      });
    }

    const userID = req.session.user.id;
    
    const user = await User.findById(userID);
    
    if(!user){
      return res.status(404).json({
        success: false,
        message: 'No User Found'
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        password: user.password,
        email: user.email,
        phonenumber: user.phonenumber,
        role: user.role,
        dob: user.dob,
        avatar: user.avatar,
        isActive: user.isActive
        //add more fields
      }
    });
  }
  catch(err){
    console.error(err);
    return res.status(500).json({
      success: false,
      message:'Failed to fetch user'
    });
  }
});

app.post('/logout', async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'No active session found'
    });
  }

  try {
    await User.updateOne(
      { username: user.username },
      { $set: { isActive: false } }
    );

    console.log("Logout request received for session:", req.sessionID);

    req.session.destroy(err => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error logging out'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    });
  } catch (error) {
    console.error('Logout DB error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
