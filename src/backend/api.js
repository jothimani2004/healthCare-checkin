const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { MongoClient, ServerApiVersion  } = require("mongodb");
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
require('dotenv').config();



// MongoDB connection URI and Database Name
const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server (starting from MongoDB v4.7, this is optional)
    await client.connect();

    // Test the connection by pinging the database
    const db1 = client.db("mental_health_checkin");
    const result = await db.command({ ping: 1 });
    console.log("Ping successful:", result);

    console.log("Successfully connected to MongoDB!");

    return db; // Return the database instance for further use
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the process with a failure code
  }
}

// Run the connection test
let db1;
run()
  .then((database) => {
    db = database; // Assign the database instance globally for use in routes or other operations
  })
  .catch(console.dir);

const db = client.db("mental_health_checkin");

const app = express();
const PORT = process.env.PORT;
const fromemail=process.env.FROM_EMAIL;
const passemail=process.env.EMAIL_PASSWORD;
// Secret key for JWT
const SECRET_KEY = process.env.SECRET_KEY;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:fromemail,
    pass:passemail,
  },
});

// Middleware
const corsOptions = {
  origin: 'http://localhost:3001', // Frontend URL (adjust if different)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

const validator = require('validator');

// Middleware to trim spaces and sanitize username and email
const sanitizeInput = (req, res, next) => {
  // Trim and sanitize `username` if present
  if (req.body.username) {
    req.body.username = validator.escape(req.body.username.trim());
  }

  // Trim, normalize, and sanitize `email` if present
  if (req.body.email) {
    req.body.email = validator.escape(validator.normalizeEmail(req.body.email.trim()));
  }

  // For login, handle `loginInput` dynamically as email or username
  if (req.body.loginInput) {
    const isEmail = validator.isEmail(req.body.loginInput);
    req.body.loginInput = isEmail
      ? validator.escape(validator.normalizeEmail(req.body.loginInput.trim())) // Treat as email
      : validator.escape(req.body.loginInput.trim()); // Treat as username
  }

  next();
};

const authMiddleware = (req, res, next) => {
  const token = req.cookies.jwtToken; // Ensure the token is named 'jwtToken'
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
     // Attach user data to the request object
     console.log(req.user);
    next();
  } catch (error) {
    return res.status(403).send({ message: 'Invalid or expired token' });
  }
};

app.get('/get-username', async(req, res) => {
  const token = req.cookies.jwtToken;  // Get the JWT token from cookies
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);

      const loginInput = decoded.loginInput;
      
      const isEmail = validator.isEmail(loginInput);

      if (isEmail) {
        // Query the database to find the username using the email
        const user = await user.findOne({ email: loginInput }); // Adjust based on your DB structure
        if (user) {
          return res.status(200).json({ username: user.username }); // Send the username
        } else {
          return res.status(404).json({ message: 'User not found' });
        }
      } else {
        return res.status(400).json({ message: 'Invalid email format' });
      }

    } catch (error) {
      res.status(401).json({ message: 'Token is invalid or expired' });
    }
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
});


// Register endpoint
app.post('/register', sanitizeInput, async (req, res) => {
  try {
    const { username, password, email } = req.body;
    console.log(username, password, email);

    // Validate required fields
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' });
    }

    // Check if username or email already exists
    const userExists = await db.collection('users').findOne({
      $or: [{ username }, { email }]
    });

    if (userExists) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Password validation (at least one uppercase letter, one special character, and 8 characters long)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long, contain an uppercase letter, and a special character' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the user into the database
    const result = await db.collection("users").insertOne({
      username,
      password: hashedPassword,
      email,
    });

    console.log("User inserted with ID:", result.insertedId);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Login endpoint
app.post('/login', sanitizeInput, async (req, res) => {
  const { loginInput, password } = req.body;
  console.log(loginInput, password);

  const isEmail = validator.isEmail(loginInput); // Check if the input is an email
  const query = isEmail ? { email: loginInput } : { username: loginInput };

  const user = await db.collection("users").findOne(query);

  console.log(user);

  if (!user) {
    return res.status(401).send({ message: 'Username or email does not exist' });
  }

  // Check if the account is locked
  const lockDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
  const currentTime = new Date().getTime();

  if (user.failedAttempts >= 5) {
    
    if (currentTime - user.lastFailedAttempt < lockDuration) {
      return res.status(403).send({ message: 'Account locked. Please try again later or reset your password.' });
    } else {
      // Reset failed attempts after lock duration has passed
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { failedAttempts: 0, lastFailedAttempt: null } }
      );
    }
  }

  // Compare the password with the hashed password stored in the database
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $inc: { failedAttempts: 1 },
        $set: { lastFailedAttempt: currentTime }
      }
    );
    return res.status(401).send({ message: 'Invalid credentials' });
  }

  // Reset failed attempts if login is successful
  await db.collection('users').updateOne(
    { _id: user._id },
    { $set: { failedAttempts: 0, lastFailedAttempt: null } }
  );

  // Create a JWT token
  const token = jwt.sign({ loginInput }, SECRET_KEY, { expiresIn: '1h' });

  // Send the token as the response
  res.cookie('jwtToken',token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 3600000,
  });

  console.log('Set-Cookie:', res.getHeaders()['set-cookie']);

  res.status(200).send({ message: 'Login successful' });
});


//logout
app.post('/logout', (req, res) => {
  
  res.clearCookie('jwtToken'); // Clear the auth token cookie
  res.status(200).send({ message: 'Logged out successfully' });
});

//forget password
app.post('/forgot-password',sanitizeInput, async (req, res) => {
  const { email } = req.body;
  const user = await db.collection("users").findOne({email:email});
  console.log(user);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '5m' });
  const resetUrl = `http://localhost:3000/#reset-password?token=${token}`;
  // Send email with reset link
  const mailOptions = {
    from: fromemail,
    to: email,
    subject: 'Password Reset Request',
    text: `Click on the following link to reset your password: ${resetUrl}`,
  };
  console.log("email created");
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset link sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending reset email' });
  }
})
// Reset Password Endpoint
app.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  console.log(token, password);

  if (!token || !password ) {
    return res.status(400).send({ message: 'Token and new password are required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, SECRET_KEY);
    const { email } = decoded; // Extract email from the token payload

    // Check if the email exists in the database
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password , 10);

    // Update the user's password in the database
    const result = await db.collection("users").updateOne(
      { email },
      {
        $set: { password: hashedPassword },

      }
    );
console.log("sucessfully password reset");
   

    res.status(200).send({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error during reset:', err);
    res.status(400).send({ message: 'Invalid or expired token' });
  }
});



app.post('/mental-health-checkin', authMiddleware, async (req, res) => {
  const { mood, stressLevel, feelings, date } = req.body;
  console.log('Request Body:', req.body);

  let username; // Define `username` outside of the conditional blocks

  try {
    // Check if the loginInput is an email
    const isEmail = validator.isEmail(req.user.loginInput);

    if (isEmail) {
      // Query the database to find the username using the email
      const user = await db.collection('users').findOne({ email: req.user.loginInput }); // Adjust based on your DB structure
      if (user) {
        username = user.username; // Assign the username
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      // If not an email, assume loginInput is the username
      username = req.user.loginInput;
    }

    // Check if username was successfully retrieved
    if (!username) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    // Get the MongoDB collection
    const collection = db.collection('check_ins');

    // Insert the check-in data into the 'check_ins' collection
    const result = await collection.insertOne({
      username,
      mood,
      stressLevel,
      feelings,
      date: new Date(date), // Ensure the date is in a proper format
      createdAt: new Date(), // Timestamp for when the check-in was created
    });

    // Send a success response
    res.status(200).json({ message: 'Mental health check-in submitted successfully', result });

  } catch (err) {
    console.error('Error handling mental health check-in:', err);
    res.status(500).json({ message: 'Error submitting mental health check-in' });
  }
});




app.get('/check-ins', authMiddleware, async (req, res) => {
  try {
    const { loginInput } = req.user; // Assuming `req.user` contains the logged-in user's details
    let username;

    // Check if the loginInput is an email
    const isEmail = validator.isEmail(loginInput);

    if (isEmail) {
      // Query the database to find the username using the email
      const user = await db.collection('users').findOne({ email: loginInput }); // Adjust based on your DB structure
      if (user) {
        username = user.username; // Use the username from the DB
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      // If not an email, assume loginInput is the username
      username = loginInput;
    }

    // Fetch check-ins from the database using the username
    const checkIns = await db.collection('check_ins')
      .find({ username }) // Query for check-ins by username
      .sort({ date: -1 }) // Sort by date in descending order
      .toArray(); // Convert the result to an array

    if (checkIns.length === 0) {
      return res.status(404).json({ message: 'No check-ins found for this user' });
    }

    // Respond with the check-ins
    res.status(200).json(checkIns);

  } catch (err) {
    console.error('Error fetching check-ins:', err);
    res.status(500).json({ message: 'An error occurred while fetching check-ins' });
  }
});




// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
