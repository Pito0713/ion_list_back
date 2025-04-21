const { successHandler } = require('../server/handle');
const Image = require('../models/image.model');
const request = require('request-promise');
const { appError } = require('../server/appError');

exports.allImage = async (req, res) => {
  try {
    const allImage = await Image.find();
    successHandler(res, 'success', allImage);
  } catch (error) {
    return next(appError(404, 'resource_not_found', next));
  }
};

// 上傳圖片
exports.uploadImage = async (req, res) => {
  try {
    const encode_image = req.file.buffer.toString('base64');
    var imgData = {};
    let options = {
      method: 'POST',
      url: 'https://api.imgur.com/3/image',
      headers: {
        Authorization: 'Client-ID 65c720efa8c8d95',
      },
      formData: {
        image: encode_image,
      },
    };
    await request(options, function (error, response) {
      if (error) throw new Error(error);
      imgurRes = JSON.parse(response.body);
      imgData = {
        imageName: req.file.originalname,
        imageUrl: imgurRes.data.link,
      };
    });
    const newImage = await Image.create(imgData);
    successHandler(res, 'success', newImage);
  } catch (error) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.uploadWebImage = async (req, res) => {
  const { image } = req.body;
  try {
    var imgData = {};
    let options = {
      method: 'POST',
      url: 'https://api.imgur.com/3/image',
      headers: {
        Authorization: 'Client-ID 65c720efa8c8d95',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: { image: image.split(',')[1] },
    };
    await request(options, function (error, response) {
      if (error) throw new Error(error);
      imgurRes = JSON.parse(response.body);
      imgData = {
        imageName: new Date(),
        imageUrl: imgurRes.data.link,
      };
    });
    const newImage = await Image.create(imgData);
    successHandler(res, 'success', newImage);
  } catch (error) {
    return next(appError(400, 'request_failed', next));
  }
};
