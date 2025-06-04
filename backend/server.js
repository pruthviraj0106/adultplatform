const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');
const connectPgSimple = require('connect-pg-simple')(session);
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

const dbHost = 'localhost';
const dbPort = 5432;
const dbUser = 'postgres'; // Replace with your PostgreSQL username
const dbPassword = 'root'; // Replace with your PostgreSQL password
const dbName = 'finallastday'; // Replace with your PostgreSQL database name

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Uncomment if needed for SSL
});

const sessionStore = new connectPgSimple({
  pool: pool,
  tableName: 'sessions',
});

const JWT_KEY = "great";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://adultplatform-1.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    store: sessionStore,
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', success: false });
})

console.clear();

const authenticateRequest = (req, res, next) => {
    if (!req.session || !req.session.username) {
        return res.status(401).json({ message: 'Not authenticated', success: false });
    }
    const token = req.session.token;
    jwt.verify(token, JWT_KEY, (err, decoded) => {
        if(err) {
            return res.status(401).json({ message: 'Unauthorized', success: false });
        }
    });
    next();
}

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const getSubscription = (id) => {
    switch (id) {
        case 1:
            return 'Basic Monthly';
        case 2:
            return 'Basic One-time';
        case 3:
            return 'Medium Monthly';
        case 4:
            return 'Medium One-time';
        case 5:
            return 'Hardcore Monthly';
        case 6:
            return 'Hardcore One-time';
        default:
            return 'Free';
    }
}

app.get('/', (req, res) => {
    if (!req.session.token) {
        return res.json({ message: 'Unauthorized', success: false });
    }

    const token = req.session.token;
    jwt.verify(token, JWT_KEY, (err, decoded) => {
        if(err) {
            return res.json({ message: 'Unauthorized', success: false });
        }
    });
    const user = req.session.username;
    return res.redirect(`/dashboard/${user}`);
})

app.get('/dashboard', authenticateRequest, (req, res) => {
    const user = req.params.username;
    return res.status(200).json({ message: user, success: true });
})

app.post('/adminLogin', async (req, res) => {
    const { username, password } = req.body;

    const result = await pool.query(`SELECT * FROM admin WHERE username = $1;`, [username]);

    if (result.rows.length === 0) {
        res.status(401).json({ message: 'Invalid credentials or No admin access', success: false });
    } 
    else {
        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid Credentials or No admin access', success: false });
        } 
        else {
            // Delete any existing sessions for this user
            await pool.query('DELETE FROM sessions WHERE sess::jsonb->>\'username\' = $1', [username]);

            if (!req.session) {
                console.error('Session object not initialized!');
                return res.status(500).json({ message: 'Session setup error', success: false });
            }
            const token = jwt.sign({username: user.username}, JWT_KEY, {expiresIn: '3h'});
            req.session.token = token;
            req.session.username = user.username;

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                maxAge: 3 * 60 * 60 * 1000 // 3 hours
            });

            req.session.save((err) => {
                if (err) {
                    console.error('Error saving session:', err);
                }
            });

            return res.status(200).json({ 
                message: 'Login successful', 
                success: true,
                user: {
                    username: user.username,
                    name: user.username,
                    subscription_status: 6
                }
            });
        }
    }
});

app.post('/register', async (req, res) => {
    console.log('Registration request received:', req.body);
    const { name, email, username, password } = req.body;

    // Validate required fields
    if (!name || !email || !username || !password) {
        console.log('Missing required fields');
        return res.status(400).json({ 
            message: 'All fields are required', 
            success: false 
        });
    }

    // Validate email format
    if (!validateEmail(email)) {
        console.log('Invalid email format:', email);
        return res.status(400).json({ 
            message: 'Invalid email format', 
            success: false 
        });
    }

    // Validate password length
    if (password.length < 6) {
        console.log('Password too short');
        return res.status(400).json({ 
            message: 'Password must be at least 6 characters long', 
            success: false 
        });
    }

    try {
        // Check if username already exists
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userCheck.rows.length > 0) {
            console.log('Username or email already exists');
            return res.status(400).json({ 
                message: 'Username or email already exists', 
                success: false 
            });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 12);

        // Insert new user
        const result = await pool.query(
            `INSERT INTO users (name, email, username, password) 
             VALUES($1, $2, $3, $4) 
             RETURNING id, name, email, username`,
            [name, email, username, hashedPassword]
        );

        console.log('User registered successfully:', result.rows[0]);
        return res.status(201).json({ 
            message: 'User registered successfully', 
            success: true,
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ 
            message: 'Error during registration', 
            success: false,
            error: err.message 
        });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.query(`SELECT * FROM users WHERE username = $1;`, [username]);

    if (result.rows.length === 0) {
        res.status(401).json({ message: 'Invalid username or password', success: false });
    } 
    else {
        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid username or password', success: false });
        } 
        else {
            // Delete any existing sessions for this user
            await pool.query('DELETE FROM sessions WHERE sess::jsonb->>\'username\' = $1', [username]);

            if (!req.session) {
                console.error('Session object not initialized!');
                return res.status(500).json({ message: 'Session setup error', success: false });
            }
            const token = jwt.sign({username: user.username}, JWT_KEY, {expiresIn: '3h'});
            req.session.token = token;
            req.session.username = user.username;

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                maxAge: 3 * 60 * 60 * 1000 // 3 hours
            });

            req.session.save((err) => {
                if (err) {
                    console.error('Error saving session:', err);
                }
            });

            const subscriptionPlan = getSubscription(user.subscription_status);

            return res.status(200).json({ 
                message: 'Login successful', 
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    subscription_status: subscriptionPlan
                }
            });
        }
    }
});

app.get('/logout', authenticateRequest, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
             console.log('Logout error');
            return res.status(500).json({ message: 'Logout failed', success: false });
        }
        res.clearCookie('connect.sid');
        console.log('Logout successful');
        return res.status(200).json({ message: 'Logged out successfully', success: true });
    });
})

app.get('/checkauth', async (req, res) => {
    console.log('Checking auth status:', req.session);
    
    if (!req.session || !req.session.username) {
        return res.status(401).json({ 
            message: 'Not authenticated', 
            success: false 
        });
    }

    try {
        // First check if user is admin
        const adminResult = await pool.query(`SELECT * FROM admin WHERE username = $1;`, [req.session.username]);

        if (adminResult.rows.length > 0) {
            return res.status(200).json({
                message: 'Authenticated as admin',
                success: true,
                user: {
                    username: req.session.username,
                    name: adminResult.rows[0].username,
                    isAdmin: true
                }
            });
        }

        // If not admin, check regular users table
        const userResult = await pool.query(`SELECT * FROM users WHERE username = $1;`, [req.session.username]);
        
        if (userResult.rows.length > 0) {
            return res.status(200).json({
                message: 'Authenticated as user',
                success: true,
                user: {
                    username: req.session.username,
                    name: userResult.rows[0].name,
                    isAdmin: false
                }
            });
        }

        return res.status(401).json({
            message: 'User not found',
            success: false
        });
    } catch (err) {
        console.error('Auth check error:', err);
        return res.status(500).json({ 
            message: 'Error checking authentication', 
            success: false 
        });
    }
});

// Utility to clean uploads folder
const cleanUploadsFolder = async () => {
  const uploadDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadDir)) {
    const files = await fs.promises.readdir(uploadDir);
    for (const file of files) {
      await fs.promises.unlink(path.join(uploadDir, file));
    }
  }
};

// Helper to write binary data to file and return URL
const writeFileAndGetUrl = async (data, prefix, ext) => {
  if (!data) return null;
  const filename = `${prefix}-${Date.now()}${Math.floor(Math.random()*10000)}.${ext}`;
  const filePath = path.join(__dirname, 'uploads', filename);
  await fs.promises.writeFile(filePath, data);
  return `/uploads/${filename}`;
};

app.get('/collections', async (req, res) => {
  try {
    await cleanUploadsFolder();
    const result = await pool.query('SELECT * FROM collections ORDER BY created_at DESC');
    const collections = await Promise.all(result.rows.map(async (col) => {
      let thumbnailUrl = null;
      if (col.thumbnail_data) {
        thumbnailUrl = await writeFileAndGetUrl(col.thumbnail_data, `collection-thumb-${col.id}`, 'jpg');
      }
      return {
        ...col,
        thumbnail_url: thumbnailUrl
      };
    }));
    res.json({ 
      collection: collections,
      success: true 
    });
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ 
      message: 'Error fetching collections',
      success: false,
      error: err.message 
    });
  }
});

app.get('/collections/:id/posts', async (req, res) => {
  try {
    await cleanUploadsFolder();
    // First check if the collection exists
    const collectionCheck = await pool.query(
      'SELECT * FROM collections WHERE id = $1',
      [req.params.id]
    );
    if (collectionCheck.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Collection not found',
        success: false 
      });
    }
    // Then fetch the posts
    const result = await pool.query(
      'SELECT * FROM posts WHERE collection_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    // Write files for each post
    const posts = await Promise.all(result.rows.map(async (post) => {
      let thumbnailUrl = null;
      let videoUrl = null;
      if (post.thumbnail_data) {
        thumbnailUrl = await writeFileAndGetUrl(post.thumbnail_data, `post-thumb-${post.id}`, 'jpg');
      }
      if (post.video_data) {
        videoUrl = await writeFileAndGetUrl(post.video_data, `post-video-${post.id}`, 'mp4');
      }
      return {
        ...post,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl
      };
    }));
    // Write collection thumbnail as well
    let collectionThumbUrl = null;
    if (collectionCheck.rows[0].thumbnail_data) {
      collectionThumbUrl = await writeFileAndGetUrl(collectionCheck.rows[0].thumbnail_data, `collection-thumb-${collectionCheck.rows[0].id}`, 'jpg');
    }
    res.json({ 
      posts,
      collection: {
        ...collectionCheck.rows[0],
        thumbnail_url: collectionThumbUrl
      }
    });
  } catch (err) {
    console.error('Error fetching collection posts:', err);
    res.status(500).json({ 
      message: 'Error fetching collection posts',
      success: false,
      error: err.message 
    });
  }
});

app.get('/subscriptionplans', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM subscription_plans ORDER BY id');
        res.json({ plans: result.rows });
    } catch (err) {
        console.error('Error fetching subscription plans:', err);
        res.status(500).json({ message: 'Error fetching subscription plans', success: false });
    }
});

app.post('/subscribe/:planid', authenticateRequest, async (req, res) => {

    const planid = req.params.planid;
    const username = req.session.username;
    const query = 'SELECT subscription_status FROM USERS WHERE username = $1;';
    const result = await pool.query(query, [username]);

    const subscriptionPlan = getSubscription(result.rows[0]);
    const checkPayment = await pool.query(`SELECT * FROM PAYMENTS WHERE planid = $1;`, [planid]);
});

app.get('/test', (req, res) => {
    res.json({ message: 'Server is working', success: true });
});

// Add this endpoint to create an admin user
app.post('/create-admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required',
                success: false
            });
        }

        // Check if admin already exists
        const existingAdmin = await pool.query(
            'SELECT * FROM admin WHERE username = $1',
            [username]
        );

        if (existingAdmin.rows.length > 0) {
            return res.status(400).json({
                message: 'Admin user already exists',
                success: false
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('Generated hash:', hashedPassword);

        // Create admin user
        await pool.query(
            'INSERT INTO admin (username, password) VALUES ($1, $2)',
            [username, hashedPassword]
        );

        return res.status(201).json({
            message: 'Admin user created successfully',
            success: true
        });
    } catch (err) {
        console.error('Error creating admin:', err);
        return res.status(500).json({
            message: 'Error creating admin user',
            success: false,
            error: err.message
        });
    }
});

// 1. GET all posts with file URLs, cleaning uploads first
app.get('/posts', async (req, res) => {
  try {
    await cleanUploadsFolder();
    const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    const posts = await Promise.all(result.rows.map(async (post) => {
      let thumbnailUrl = null;
      let videoUrl = null;
      if (post.thumbnail_data) {
        thumbnailUrl = await writeFileAndGetUrl(post.thumbnail_data, `post-thumb-${post.id}`, 'jpg');
      }
      if (post.video_data) {
        videoUrl = await writeFileAndGetUrl(post.video_data, `post-video-${post.id}`, 'mp4');
      }
      return {
        ...post,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl
      };
    }));
    res.json({ posts, success: true });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Error fetching posts', success: false, error: err.message });
  }
});

// 2. Update /images/:id to write file and return URL
app.get('/images/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT thumbnail_data FROM posts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }
    const url = await writeFileAndGetUrl(result.rows[0].thumbnail_data, `image-${req.params.id}`, 'jpg');
    res.json({ url });
  } catch (err) {
    console.error('Error fetching image:', err);
    res.status(500).json({ message: 'Error fetching image' });
  }
});

// 3. Update /videos/:id to write file and return URL
app.get('/videos/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT video_data FROM posts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }
    const url = await writeFileAndGetUrl(result.rows[0].video_data, `video-${req.params.id}`, 'mp4');
    res.json({ url });
  } catch (err) {
    console.error('Error fetching video:', err);
    res.status(500).json({ message: 'Error fetching video' });
  }
});

// Create a new post
app.post('/posts', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received post request:', {
      body: req.body,
      files: req.files ? Object.keys(req.files) : 'No files'
    });

    const { collection_id, title, description, type } = req.body;
    
    // Validate required fields
    if (!collection_id || !title) {
      console.log('Missing required fields:', { collection_id, title });
      return res.status(400).json({
        message: 'Missing required fields',
        success: false
      });
    }

    // Check if collection exists
    const collectionCheck = await pool.query(
      'SELECT * FROM collections WHERE id = $1',
      [collection_id]
    );

    if (collectionCheck.rows.length === 0) {
      console.log('Collection not found:', collection_id);
      return res.status(404).json({
        message: 'Collection not found',
        success: false
      });
    }

    // Validate files
    if (!req.files || !req.files.image) {
      console.log('No image file provided');
      return res.status(400).json({
        message: 'Thumbnail image is required',
        success: false
      });
    }

    if (type === 'Video' && (!req.files || !req.files.video)) {
      console.log('No video file provided for video type');
      return res.status(400).json({
        message: 'Video file is required for video type',
        success: false
      });
    }
    
    // Read image file if provided
    let thumbnailData = null;
    if (req.files.image) {
      console.log('Processing image file');
      try {
        thumbnailData = await fs.promises.readFile(req.files.image[0].path);
      } catch (err) {
        console.error('Error reading image file:', err);
        return res.status(500).json({
          message: 'Error processing image file',
          success: false
        });
      }
    }

    // Read video file if provided
    let videoData = null;
    if (req.files.video) {
      console.log('Processing video file');
      try {
        videoData = await fs.promises.readFile(req.files.video[0].path);
      } catch (err) {
        console.error('Error reading video file:', err);
        return res.status(500).json({
          message: 'Error processing video file',
          success: false
        });
      }
    }

    console.log('Inserting post with data:', {
      collection_id,
      title,
      type,
      hasThumbnail: !!thumbnailData,
      hasVideo: !!videoData
    });

    // Insert the post with binary data
    const result = await pool.query(
      `INSERT INTO posts (
        collection_id, 
        title, 
        description, 
        thumbnail_data, 
        video_data, 
        type,
        duration
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        collection_id, 
        title, 
        description || '', 
        thumbnailData, 
        videoData, 
        type || 'Video',
        type === 'Video' ? '00:00' : null
      ]
    );

    console.log('Post created successfully:', result.rows[0].id);

    // Clean up uploaded files
    if (req.files) {
      for (const field in req.files) {
        for (const file of req.files[field]) {
          try {
            await fs.promises.unlink(file.path);
          } catch (err) {
            console.error('Error cleaning up file:', err);
          }
        }
      }
    }

    res.status(201).json({
      message: 'Post created successfully',
      success: true,
      post: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({
      message: 'Error creating post',
      success: false,
      error: err.message
    });
  }
});

// Delete post endpoint
app.delete('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if post exists
        const postCheck = await pool.query(
            'SELECT * FROM posts WHERE id = $1',
            [id]
        );

        if (postCheck.rows.length === 0) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            });
        }

        // Delete post (cascade will handle related records)
        await pool.query(
            'DELETE FROM posts WHERE id = $1',
            [id]
        );

        res.json({
            message: 'Post deleted successfully',
            success: true
        });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({
            message: 'Error deleting post',
            success: false,
            error: err.message
        });
    }
});

// Add file upload endpoints
app.post('/upload/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No image file uploaded',
        success: false
      });
    }

    // Return the file path relative to the server
    const filePath = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Image uploaded successfully',
      success: true,
      filePath: filePath
    });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({
      message: 'Error uploading image',
      success: false,
      error: err.message
    });
  }
});

app.post('/upload/video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No video file uploaded',
        success: false
      });
    }

    // Return the file path relative to the server
    const filePath = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Video uploaded successfully',
      success: true,
      filePath: filePath
    });
  } catch (err) {
    console.error('Error uploading video:', err);
    res.status(500).json({
      message: 'Error uploading video',
      success: false,
      error: err.message
    });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create a new collection
app.post('/collections', upload.single('thumbnail'), async (req, res) => {
    try {
        const { title, description, tier, type, price } = req.body;
        
        // Read thumbnail file if provided
        let thumbnailData = null;
        if (req.file) {
            thumbnailData = await fs.promises.readFile(req.file.path);
        }

        const result = await pool.query(
            'INSERT INTO collections (title, description, thumbnail_data, tier, type, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, thumbnailData, tier, type, price]
        );

        // Clean up uploaded file
        if (req.file) {
            await fs.promises.unlink(req.file.path);
        }

        res.json({ collection: result.rows[0] });
    } catch (err) {
        console.error('Error creating collection:', err);
        res.status(500).json({ message: 'Error creating collection' });
    }
});

// Get a single post
app.get('/posts/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Post not found',
        success: false
      });
    }

    res.json({
      post: result.rows[0],
      success: true
    });
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({
      message: 'Error fetching post',
      success: false,
      error: err.message
    });
  }
});

app.listen(PORT, () => {
    console.log(`Server Running on port: ${PORT}`);
})