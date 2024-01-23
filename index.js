// Import the Express module
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session'); 
// const { MongoClient } = require('mongodb');
// require models
const User = require('./models/User')
const VehicleRegistration = require('./models/Vehicle');
const UserFeedback = require('./models/UserFeedback');
const Chat = require('./models/Chat');

// Create an instance of the Express application
const app = express();
//middle wares
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Middleware to check if a user is authenticated
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}
//set up session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  }));
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set up Passport local strategy
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// connect to mongoDB
mongoose.connect('mongodb+srv://VDT_ADMIN:project@cluster0.dhgn2sl.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//USER AUTHENTICATION
// Define routes for authentication
app.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ message: 'Login successful', user: req.user });
});
//register user
app.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.register(new User({ username }), password);
      res.json({ message: 'Registration successful', user });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
});

//route to get all users
app.get('/profile/users' , async (req, res) => {
  try {
    const users = await User.find({_id: {$exists: true}});
    res.status(200).json(users);
  } catch(error) {
    console.error('Error: ' + error);
  }
});

// route for getting user feedback
app.post('/profile/:user/user-feedback', async (req, res) => {
  try {
    const {userId, description} = req.body;
    const owner = userId;
    const newUserFeedback = new UserFeedback({owner, description });
    const userFeedbackData = await newUserFeedback.save();

    res.json(userFeedbackData);
  } catch(error) {
    console.error('Error:' + error);
    res.status(500).json({error: 'Internal Server Error!'});
  }
})
// register your vehicle
app.post('/profile/:user/register-vehicle', async (req, res) => {
    try {
        const { plateNumber, make, model, userId } = req.body;
        const owner = userId;
        const newRegistration = new VehicleRegistration({ plateNumber, owner, make, model });
        const registration = await newRegistration.save();

        res.status(201).json(registration);
    } catch (error) {
        console.error('Error registering vehicle:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

  // Fetching owner-specific vehicles
app.get('/profile/:user/vehicles', async (req, res) => {
    try {
      // Assuming you have a User model and the user's ID is in req.params.user
      const userId = req.params.user;
  
      // Use the user ID to find vehicles specific to that user
      const vehicles = await VehicleRegistration.find({ owner: userId });
  
      res.json({ vehicles });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // save chat messages to database
  app.post('/profile/chat/:receiver', async (req, res) => {
    try {
      const { sender, receiver, message, timestamp} = req.body;
      const newChat = new Chat({sender, receiver, message, timestamp});
      const savedChat = await newChat.save();

      res.status(200).json(savedChat);
    } catch(error) {
      console.error(error);
    }
  })

  //get chat messages

  app.get('/profile/chat/:receiver/:sender', async (req, res) => {
    try {
      const sender = req.params.sender;
      const receiver = req.params.receiver;
  
      const messages = await Chat.find({
        $or: [
          { sender: sender, receiver: receiver },
          { sender: receiver, receiver: sender }
        ]
      });
      
      res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  

// Specify the port number for the server to listen on
const port = 3000;

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
