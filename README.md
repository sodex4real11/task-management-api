
<div align="center"><h1>Task Manager RESTFul-API</h1></div>

------------------------

<div align="center">
<img src="https://i.imgur.com/0iXMDac.jpg" alt="My Shortlinkify Design">
</div>

## __Overview__

This __task management project__ is designed to provide functionality for creating, reading, updating, and deleting tasks, along with user authentication and task categorization and also enable users to manage their tasks efficiently
 
The application is built using [__Node.js__, __MongoDB__, __Express.js],
and it offers a user-friendly interface for __Task Management__.

__Features__
- `Task Categorization`: Easily assign tasks to categories (e.g work, personal, others).
- `User Authentication`: Allow users to sign up and log in and log out.
- `Priority Levels`: set priority levels for tasks.
- `Search and Filter`: Search for tasks and filter by category, priority.
- `Dark Mode`: Toggle between light and dark mode for a personalized viewing experience.
- `User-Friendly Interface`: A clean and intuitive user interface for easy navigation.
- `CRUD Operations for Tasks`: Easily create, read, update and delete tasks.

## Prerequisites
Before running the application, the following must be installed:
- `Node.js`
- `MongoDB`
- `PostMan`

## Installation

- Step 1: __Clone this repository__:

```
git clone https://github.com/sodex4real11/task-management-api.git

```
- Step 2: __Navigate to the project directory__: 

```
cd task-management-api

```
- Step 3: __Initialize Node.js Project__: 

```
npm init -y

```
- Step 4: __Install dependencies__: 

```
npm i express mongoose ejs
npm install express mongoose jsonwebtoken bcrypt dotenv
npm install --save-dev nodemon

``` 

## Set up the Server and Database

- Step 1: __Create Server (server.js)__:

```
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();

dotenv.config();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Database connection
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected'))
    .catch((error) => console.error('Database connection error:', error));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

```

- Step 2: __configure database__: 

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;

```
- Step 3: __Create Environment configuration (.env)__:

```
DB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskdb
JWT_SECRET=your_jwt_secret
```

## Configuration
- Step 1: __Create a MongoDB database__.

- Update the __mongoose.connect__ method in __server.js__ with the __MongoDB__ connection string:

```
mongoose.connect('your-mongodb-connection-string', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

```
## Implement User Authentication
- Step 1: __Create User Model (models/user.js)__:

```
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

```
- Step 2: __Create Authentication Controller (controllers/authController.js)__:

```
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).send({ message: 'User registered' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).send({ token });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

```
- Step 3: __Create Authentication Routes (routes/authRoutes.js__:

```
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;

```
- Step 4: __Create Authentication Middleware (middlewares/authMiddleware.js__:

```
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).send({ message: 'Access denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;

```
## Implement Task Management
- Step 1: __Create Task Model (models/Task.js)__:

```
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, default: 'general' },
    completed: { type: Boolean, default: false },
});

module.exports = mongoose.model('Task', TaskSchema);

```
- Step 2: __Create Task Controller (controllers/taskController.js__:

```
const Task = require('../models/Task');

exports.createTask = async (req, res) => {
    try {
        const task = new Task({ ...req.body, userId: req.user.userId });
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.userId });
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, req.body, { new: true });
        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }
        res.status(200).send({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

```
- Step 3: __Create Task Routes (routes/taskRoutes.js)__:

```
const express = require('express');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createTask);
router.get('/', authMiddleware, getTasks);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);

module.exports = router;

```


## Testing and Running the API
- Step 1: __Install Nodemon__:

```
npm install --save-dev nodemon

```

This command installs the nodemon during development.


- Step 2: __Run the API__:

```
npm run devStart
npm start

```


## Application Structure


- __shortUrl.js__: Defines the Mongoose schema for the ShortUrl model used to interact with the MongoDB database.

- __package.json__: Specifies project details, dependencies, and scripts for running the application.

- __server.js__: The main server file that sets up the Express application, defines routes, and connects to the database.



## Detailed Explanation of the Application Structure

This breakdown provides a comprehensive understanding of the task management API
covering its frontend structure, backend data schema, project configuration, and server setup. 

1) `package.json`

This file contains metadata about the project and its dependencies.

- Specifies the name and version of the project.

- Defines a development script (`devStart`) using nodemon to auto-restart the server during development.

- Lists the project's runtime dependencies, including `Express`, `EJS`, `Mongoose`, and `ShortId`.

- Lists development dependencies, including nodemon for automatic server restarts.


2) `server.js`

 This is the main server file responsible for setting up the Express application, defining routes, and connecting to the MongoDB database.

- Imports required libraries, including Express, Mongoose.

- Express Setup: Configures the Express app with EJS as the view engine.

- Enables parsing of URL-encoded data.

- Defines routes for handling homepage requests, URL shortening submissions, URL deletion requests, and short URL redirection.

- Connects to the MongoDB database using Mongoose.

- Specifies the port to listen on and starts the server.


- HTML Structure:

html, head, and body tags define the basic HTML structure.
meta tags set character encoding, viewport settings, and compatibility.
External stylesheets are linked for Bootstrap and local styling.

## API Endpoints

| Methods | Endpoints                          | Access  | Description                              |
| ------- | ---------------------------------- | ------- | ---------------------------------------- |
| POST    | /users                             | Public  | Sign up                                  |
| POST    | /users/login                       | Public  | Login                                    |
| GET     | /users/me                          | Private | User's Profile                           |
| PATCH   | /users/me                          | Private | Update Profile                           |
| POST    | /users/me/avatar                   | Private | Upload Profile Picture                   |
| GET     | /users/userID/avataar              | Private | View Profile Picture                     |
| DELETE  | /users/me/avatar                   | Private | Delete Profile Picture                   |
| DELETE  | /users/me                          | Private | Delete Account                           |
| POST    | /users/tasks                       | Private | Create a Task                            |
| GET     | /users/tasks/taskID                | Private | View a Task                              |
| GET     | /users/tasks                       | Private | View all Tasks                           |
| GET     | /users/tasks?limit=2               | Private | Limit the result to 2                    |
| GET     | /users/tasks?sortBy=createdAt:desc | Private | Sort by Descending order of created date |
| GET     | /users/tasks?sortBy=createdAt:asc  | Private | Sort by Ascending order of created date  |
| GET     | /users/tasks?skip=3                | Private | Paginating result                        |
| PATCH   | /users/tasks/taskID                | Private | Update a Task                            |
| DELETE  | /users/tasks/taskID                | Private | Delete a Task                            |
| POST    | /users/logout                      | Private | Logout an account                        |
| POST    | /users/logoutall                   | Private | Logout all accounts                      |
