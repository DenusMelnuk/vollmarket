const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const winston = require('winston');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const dotenv = require('dotenv');
dotenv.config();
const { existsSync, mkdirSync } = require('fs');

// Ініціалізація логування
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Ініціалізація додатку
const app = express();
app.use(cors());
app.use(express.json());

// Налаштування статичної папки для зображень
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Налаштування Multer для завантаження файлів
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images are allowed'));
  }
});

// Налаштування Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: (msg) => logger.info(msg),
  }
);

// Налаштування Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_app_password'
  }
});

// Моделі
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user' }
});

const Category = sequelize.define('Category', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT }
});

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false },
  imageUrl: { type: DataTypes.STRING }
});

const Order = sequelize.define('Order', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('reserved', 'completed', 'cancelled'), defaultValue: 'reserved' }
});

// Асоціації
Category.hasMany(Product);
Product.belongsTo(Category);
User.hasMany(Order, { foreignKey: 'userId' });
Product.hasMany(Order, { foreignKey: 'productId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.belongsTo(Product, { foreignKey: 'productId' });

// Мідлвар для перевірки JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Мідлвар для перевірки адмін-прав
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Роути автентифікації
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      username,
      password: hashedPassword,
      email
    });
    
    logger.info(`User registered: ${username}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ 
      id: user.id, 
      username: user.username, 
      role: user.role,
      email: user.email
    }, 'secret_key', { expiresIn: '24h' });
    
    logger.info(`User logged in: ${username}`);
    res.json({ token });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Роути для категорій
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    logger.error(`Categories fetch error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', authenticateToken, isAdmin, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    logger.info(`Category created: ${category.name}`);
    res.status(201).json(category);
  } catch (error) {
    logger.error(`Category creation error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Роути для товарів
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const categoryId = req.query.categoryId;
    
    const where = categoryId ? { categoryId } : {};
    
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [Category],
      limit,
      offset
    });
    
    res.json({
      products: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error(`Products fetch error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: [Category] });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    logger.error(`Product fetch error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      const outputPath = path.join(__dirname, 'uploads', `resized-${req.file.filename}`);
      await sharp(req.file.path)
        .resize(300, 300, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
        .toFile(outputPath);
      
      // Затримка перед видаленням оригінального файлу
      await new Promise(resolve => setTimeout(resolve, 100));
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        logger.warn(`Failed to delete original file ${req.file.path}: ${err.message}`);
      }
      
      imageUrl = `/uploads/resized-${req.file.filename}`;
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      imageUrl,
      categoryId
    });

    logger.info(`Product created: ${product.name}`);
    res.status(201).json(product);
  } catch (error) {
    logger.error(`Product creation error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { name, description, price, stock, categoryId } = req.body;
    let imageUrl = product.imageUrl;

    if (req.file) {
      const outputPath = path.join(__dirname, 'uploads', `resized-${req.file.filename}`);
      await sharp(req.file.path)
        .resize(300, 300, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
        .toFile(outputPath);
      
      // Затримка перед видаленням оригінального файлу
      await new Promise(resolve => setTimeout(resolve, 100));
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        logger.warn(`Failed to delete original file ${req.file.path}: ${err.message}`);
      }
      
      // Видаляємо старе зображення, якщо воно існує
      if (product.imageUrl && existsSync(path.join(__dirname, product.imageUrl))) {
        try {
          await fs.unlink(path.join(__dirname, product.imageUrl));
        } catch (err) {
          logger.warn(`Failed to delete old image ${product.imageUrl}: ${err.message}`);
        }
      }

      imageUrl = `/uploads/resized-${req.file.filename}`;
    }

    await product.update({
      name,
      description,
      price,
      stock,
      imageUrl,
      categoryId
    });

    logger.info(`Product updated: ${product.name}`);
    res.json(product);
  } catch (error) {
    logger.error(`Product update error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Видаляємо зображення, якщо воно існує
    if (product.imageUrl && existsSync(path.join(__dirname, product.imageUrl))) {
      try {
        await fs.unlink(path.join(__dirname, product.imageUrl));
      } catch (err) {
        logger.warn(`Failed to delete image ${product.imageUrl}: ${err.message}`);
      }
    }

    await product.destroy();
    logger.info(`Product deleted: ${product.name}`);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    logger.error(`Product deletion error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Роути для замовлень
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findByPk(productId);
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });
    
    await product.update({ stock: product.stock - quantity });
    
    const order = await Order.create({
      userId: req.user.id,
      productId,
      quantity,
      status: 'reserved'
    });
    
    await transporter.sendMail({
      from: 'your_email@gmail.com',
      to: req.user.email,
      subject: 'Order Confirmation',
      text: `Your order for ${product.name} (Quantity: ${quantity}) has been reserved.`
    });
    
    await transporter.sendMail({
      from: 'your_email@gmail.com',
      to: 'owner_email@example.com',
      subject: 'New Order Placed',
      text: `New order for ${product.name} (Quantity: ${quantity}) by ${req.user.username}.`
    });
    
    logger.info(`Order created: ${order.id}`);
    res.status(201).json({ message: 'Order placed successfully' });
  } catch (error) {
    logger.error(`Order creation error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/orders', authenticateToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['username', 'email'] },
        { model: Product, attributes: ['name', 'price'] }
      ]
    });
    res.json(orders);
  } catch (error) {
    logger.error(`Orders fetch error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Ініціалізація бази даних та запуск сервера
sequelize.sync({ force: false }).then(() => {
  app.listen(3000, () => {
    logger.info('Server is running on port 3000');
    console.log('Server is running on port 3000');
  });
}).catch(error => {
  logger.error(`Database initialization error: ${error.message}`);
  console.error('Database initialization error:', error);
});