var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  var filePath = path.resolve(__dirname, '../routes/html/login.html');
  res.sendFile(filePath);
});

var routesPath = path.join(__dirname, '../routes');
var publicPath = path.join(__dirname, '../public');
router.use(express.static(routesPath));
router.use(express.static(publicPath));

module.exports = router;