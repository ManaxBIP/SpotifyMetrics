var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  var filePath = path.resolve(__dirname, '../routes/html/login.html');
  res.sendFile(filePath);
});

router.get('/login.css', function(req, res, next) {
  var cssPath = path.resolve(__dirname, '../routes/stylesheets/login.css');
  res.sendFile(cssPath);
});

router.get('/login.js', function(req, res, next) {
  var cssPath = path.resolve(__dirname, '../routes/js/login.js');
  res.sendFile(cssPath);
});

module.exports = router;
