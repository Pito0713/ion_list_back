const UserBack = require('../models/userBack.model');
const { successHandler } = require('../server/handle');
const { appError } = require('../server/appError');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 後台會員註冊
exports.userBackRegister = async (req, res, next) => {
  try {
    const { account, password } = req.body;
    if (!account && !password && !userName) {
      return next(appError(400, 'data_missing', next));
    }
    const userBackRepeat = await UserBack.findOne({ account });

    if (userBackRepeat) {
      return next(appError(400, 'duplicate_user_account', next));
    }

    // 產生該帳號的token憑證, 用env中的金鑰
    const token = jwt.sign({ account: account }, process.env.JWT_SECRET);
    // 把密碼加密
    const hashedPassword = bcryptjs.hashSync(password, 12);
    await UserBack.create({
      account: account,
      password: hashedPassword,
      token: token,
      permission: 'guest', // 預設權限等級
    });

    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

// 後台會員登入
exports.userBackLogin = async (req, res, next) => {
  try {
    const { account, password } = req.body;
    // 找到帳號 並且順便撈他的password
    const userBack = await UserBack.findOne({ account }).select('+password');

    if (!['', null, undefined].includes(userBack)) {
      // 兩者解密是否對應
      bcryptjs.compare(password, userBack.password).then((result) => {
        if (result) {
          successHandler(res, 'success', { userBack });
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

// 後台會員變更密碼
exports.userBackhandPassWord = async (req, res, next) => {
  try {
    const { oldPassWord, newPassWord, newPassWordAgain } = req.body;
    const data = { oldPassWord, newPassWord, newPassWordAgain };

    // 抓JWT
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    let userBackAccount = await jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      let userAccount = user?.account
      // 查使用者是否為own
      return await UserBack.findOne({ userAccount })
    })

    if (['own'].includes(userBackAccount?.permission)) return next(appError(401, 'do_not_change_main_admin_account', next));

    const userBack = await UserBack.findOne({ token }).select('+password');
    const oldPassWordCorrect = await bcryptjs.compare(
      data.oldPassWord,
      userBack.password
    );
    const newPassWordCorrect = await bcryptjs.compare(
      data.newPassWord,
      userBack.password
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

    await UserBack.findByIdAndUpdate(userBack._id, {
      password: updateNewPassWord,
    });
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.userBackInfo = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = await UserBack.find({ token });
    if (userId) {
      successHandler(res, 'success', userId);
    } else {
      return next(appError(404, 'resource_not_found', next));
    }
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

// 搜尋後台會員
exports.findAllUserBack = async (req, res, next) => {
  try {
    const { id } = req.body;
    const allUserBack = await UserBack.find({});
    if (!['', null, undefined].includes(allUserBack)) {
      let target = allUserBack.filter((item) => {
        if (item._id.toString() !== id && item.permission !== 'own') {
          return {
            id: item.id,
            permission: item.permission,
            account: item.account,
          };
        }
      });
      successHandler(res, 'success', target);
    }
  } catch (err) {
    return next(appError(404, 'resource_not_found', next));
  }
};

// 修改後台會員權限
exports.uploadUserPermission = async (req, res, next) => {
  try {
    const { id, permission } = req.body;
    const editUser = await UserBack.findByIdAndUpdate(id, {
      permission: permission,
    });
    // 抓JWT
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userBackAccount = await jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      let userAccount = user?.account
      // 查使用者是否為own , admin
      return await UserBack.findOne({ userAccount })
    })
    if (!['own', 'admin'].includes(userBackAccount?.permission)) return next(appError(400, 'verification_failed', next));

    successHandler(res, 'success', editUser);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};
