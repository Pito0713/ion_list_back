const UserFront = require('../models/userFront.model');
const Image = require('../models/image.model');
const { successHandler } = require('../server/handle');
const { appError } = require('../server/appError');
const bcryptjs = require('bcryptjs');
const request = require('request-promise');
const jwt = require('jsonwebtoken');

// 註冊
exports.register = async (req, res, next) => {
  try {
    const {
      account,
      password,
      userName,
      birth,
      mail,
      phone,
      address,
      city,
      town,
    } = req.body;

    if (!account && !password && !userName) {
      return next(appError(400, 'data_missing', next));
    }

    const userRepeat = await UserFront.findOne({ account });
    if (userRepeat) {
      return next(appError(400, 'duplicate_user_account', next));
    }
    // 產生該帳號的token憑證, 用env中的金鑰
    const token = jwt.sign({ account: account }, process.env.JWT_SECRET);

    await UserFront.create({
      account: account,
      password: bcryptjs.hashSync(password, 12), // 把密碼加密
      token: token,
      userName: userName,
      birth: birth,
      phone: phone,
      address: address,
      mail: mail,
      photo: null,
      city: city,
      town: town,
      coupon: null,
    });

    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { account, password } = req.body;
    // 找到帳號 並且順便撈他的password
    const user = await UserFront.findOne({ account }).select('+password');

    if (!['', null, undefined].includes(user)) {
      // 兩者解密是否對應
      bcryptjs.compare(password, user.password).then((result) => {
        if (result) {
          successHandler(res, 'success', { user });
        } else {
          return next(appError(400, 'password_error', next));
        }
      });
    } else {
      return next(appError(404, 'account_not_found', next));
    }
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

// 變更密碼
exports.handPassWord = async (req, res, next) => {
  try {
    const { oldPassWord, newPassWord, newPassWordAgain, token } = req.body;
    const data = { oldPassWord, newPassWord, newPassWordAgain, token };

    const user = await UserFront.findOne({ token }).select('+password');
    const oldPassWordCorrect = await bcryptjs.compare(
      data.oldPassWord,
      user.password
    );
    const newPassWordCorrect = await bcryptjs.compare(
      data.newPassWord,
      user.password
    );

    const updateNewPassWord = bcryptjs.hashSync(data.newPassWord, 12);

    // 原先密碼檢查
    if (!oldPassWordCorrect) {
      return next(appError(400, 'oldPassword_failed', next));
    }
    // 新密碼檢查
    if (newPassWordCorrect) {
      return next(
        appError(400, 'oldPassword_and_newPassword_are_the_same', next)
      );
    }
    // 新密碼重複輸入錯誤
    if (newPassWord !== newPassWordAgain) {
      return next(appError(400, 'newPassword_failed', next));
    }

    await UserFront.findByIdAndUpdate(user._id, {
      password: updateNewPassWord,
    });
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

// 取得個人資料
exports.userinfo = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = await UserFront.find({ token });
    if (userId) {
      successHandler(res, 'success', [
        {
          coupon: userId[0].coupon,
          _id: userId[0]._id,
          account: userId[0].account,
          token: userId[0].token,
          createdAt: userId[0].createdAt,
          birth: userId[0].birth,
          mail: userId[0].mail,
          phone: userId[0].phone,
          userName: userId[0].userName,
          address: userId[0].address,
          photo: userId[0].photo,
          city: userId[0].city,
          town: userId[0].town,
          id: userId[0].id
        }
      ]);
    } else {
      return next(appError(404, 'resource_not_found', next));
    }
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

// 更新個人資料
exports.uploadUser = async (req, res, next) => {
  try {
    const { userName, birth, phone, address, mail, photo, token, city, town } =
      req.body;
    const userId = await UserFront.find({ token });

    if (!token && !userName) {
      return next(appError(400, 'data_missing', next));
    }

    const editUser = await UserFront.findByIdAndUpdate(userId[0]._id, {
      userName: userName,
      birth: birth,
      phone: phone,
      address: address,
      mail: mail,
      photo: photo,
      token: token,
      city: city,
      town: town,
    });

    successHandler(res, 'success', editUser);
  } catch (err) {
    return next(appError(404, 'resource_not_found', next));
  }
};

// 更新個人圖片
exports.uploadUserImage = async (req, res) => {
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
    successHandler(res, 'success', imgData);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};
