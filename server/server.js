import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'config.env') });

const app = express();
const PORT = process.env.PORT || 8081;


app.use(cors());
app.use(express.json());


const DB = process.env.MONGO_URI;
if (!DB) {
  console.error('FATAL ERROR: MONGO_URI is not defined');
  process.exit(1);
}

mongoose.connect(DB, {
  dbName: 'Rig-Op'  
})
.then(() => console.log('DB Connected to Rig-Op database'))
.catch(err => {
  console.error('DB Connection Error:', err.message);
  process.exit(1);
});


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

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

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});