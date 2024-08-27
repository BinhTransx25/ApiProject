var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

// gọi các model
require('./controllers/users/ModelUser');
require('./controllers/products/ModelProduct');
require('./controllers/categories/ShopCategory/ModelShopCategory');
require('./controllers/categories/ProductCategory/ModelProductCategory');
require('./controllers/order/ModelOrder');
require('./controllers/address/ModelAddress');
require('./controllers/shopowner/ModelShopOwner')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var shopCategoriesRouter = require('./routes/shopCategories');
var productCategoriesRouter = require('./routes/productCategories');
var addressRouter = require('./routes/address');
var ordersRouter = require('./routes/orders');
var cartssRouter = require('./routes/carts');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// kết nối với mongodb
mongoose.connect('mongodb://localhost:27017/XTH')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Thiết lập các route
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/shopCategories', shopCategoriesRouter);
app.use('/productCategories', productCategoriesRouter);
app.use('/addresses', addressRouter);
app.use('/orders', ordersRouter);
app.use('/carts', cartssRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
