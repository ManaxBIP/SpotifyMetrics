var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  var filePath = path.resolve(__dirname, '../routes/html/index.html');
  res.sendFile(filePath);
});

module.exports = router;
