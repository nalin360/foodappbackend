const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');
// console.log('Secret Key:', secretKey);

const PORT = 5000
// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Create a user schema and model
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema);

// Create a product schema and model
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  reviews: [{
    customerName: String,
    rating: Number,
    comment: String
  }]
});

const Product = mongoose.model('Product', productSchema);

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ---------------------------------------------
function generateToken(user) {
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    return token;
  }

  
// User sign-up endpoint

// const bcrypt = require('bcrypt');

app.post('/signup', async (req, res) => {
  try {
    const { password,  ...userData} = req.body;

    // Validate password field
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ password: hashedPassword, ...userData });
    const savedUser = await newUser.save();
    const token = generateToken(savedUser);
    res.json({ success: true, user: savedUser, token });
  } catch (error) {
    console.log('Signup error:', error);
    res.status(400).json({ success: false, error: 'Failed to sign up. Please try again.' });
  }
});



// User login endpoint
// User login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = generateToken(user);
        res.json({ success: true, message: 'Login successful', token });
      } else {
        res.status(401).json({ success: false, error: 'Invalid username or password' });
      }
    } else {
      res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to login' });
  }
});


// Add to cart endpoint
app.post('/addtocart', async (req, res) => {
  try {
    // Perform necessary operations to add item to the cart
    // You can retrieve user details from req.body and update their cart in the database
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add item to cart' });
  }
});

// Product details endpoint
app.get('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch product details' });
  }
});
// ...

// Products endpoint
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ... Manthan .....
const OrderHistorySchema = new mongoose.Schema({
  
  username: String,
  orders: [{
    id: Number,
    order_date: String,
    productname: String,
    productDesc: String,
    productPrice: Number,
    deliveryStatus: String
  }]
});
const manthan = mongoose.model('orderHistory', OrderHistorySchema);


app.use(express.json());

// Check if 'app' already has the '_router' property
const existingApp = app._router;

// If 'app' is already defined, use it; otherwise, create a new instance
// const server = existingApp ? app : express()

const OrderHistory = mongoose.model('orderHistory', OrderHistorySchema);

// Define the POST route for creating a new order
app.post('/orderHistory', async (req, res) => {
  try {
    // Create a new order based on the request body
    const newOrder = {
      username: req.body.username,
      orders: req.body.orders
    };

    // Save 
    const order = await OrderHistory.create(newOrder);

    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

