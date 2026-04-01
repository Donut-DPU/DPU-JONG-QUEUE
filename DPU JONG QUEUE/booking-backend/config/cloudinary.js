const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dde6rwcip',
  api_key: '375148999593291',
  api_secret: 'EKCNqvf-_ccd3s5aT1ouX693kAA'
});

module.exports = cloudinary;