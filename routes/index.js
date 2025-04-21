var express = require('express');
var router = express.Router();
const user = require('../controllers/user.controller');
const text = require('../controllers/text.controller');
const handleErrorAsync = require('../server/handleErrorAsync');

// user
// 註冊
router.post('/register', handleErrorAsync(user.register));
// 登入
router.post('/login', handleErrorAsync(user.login));

// text
// 單字搜尋
router.get('/searchText', handleErrorAsync(text.searchText));
// 新增文字
router.post('/addText', handleErrorAsync(text.addText));
// 修改單字
router.post('/editText', handleErrorAsync(text.editText));
// 單字是否置頂
router.post('/editTextShowTop', handleErrorAsync(text.editTextShowTop));
// 刪除單個單字文本
router.delete('/deleteOneText', handleErrorAsync(text.deleteOneText));
// 測驗題目
router.get('/textQuiz', handleErrorAsync(text.textQuiz));
// 測驗題目答案驗證
router.get('/answerQuiz', handleErrorAsync(text.answerQuiz));
// 每日測驗題目
router.get('/answerDaily', handleErrorAsync(text.answerDaily));

/* -- ****************************************
  ┌───────────────────────────────────────────┐  
  │             EXTRA SEVER -- Aoi            │
  └───────────────────────────────────────────┘ 
-- **************************************** */
const couponController = require('../controllers/coupon.controller');
const userController = require('../controllers/userFront.controller');
const userBackController = require('../controllers/userBack.controller');
const platformController = require('../controllers/platform.controller');
const productController = require('../controllers/product.controller');
const imageController = require('../controllers/image.controller');
const productFilter = require('../controllers/productFilter.controller');
const cartController = require('../controllers/cart.controller');
const countryController = require('../controllers/country.controller');
const carouselImgController = require('../controllers/carouselImg.controller');
const aboutImgController = require('../controllers/aboutImg.controller');
const mainImgController = require('../controllers/mainImg.controller');
const orderController = require('../controllers/order.controller');
const multer = require('multer');

var upload = multer({
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/gif' ||
      file.mimetype === 'image/jpg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Allowed .jpeg .jpg'));
    }
  },
});

// user
// 註冊
router.post('/registerInfo', handleErrorAsync(userController.register));
// 登入
router.post('/loginInfo', handleErrorAsync(userController.login));
// 變更密碼
router.post('/handPassWord', handleErrorAsync(userController.handPassWord));
// 取得個人資料
router.post('/userinfo', handleErrorAsync(userController.userinfo));
// 更新個人資料
router.post('/uploadUser', handleErrorAsync(userController.uploadUser));
// 更新個人圖片
router.post(
  '/uploadUserImage',
  upload.single('file'),
  userController.uploadUserImage
);

// Platform
// 取得平台匯率
router.post('/platformRate', handleErrorAsync(platformController.platformRate));
// 新增平台匯率
router.post(
  '/createModifyRate',
  handleErrorAsync(platformController.createModifyRate)
);

// 更新平台匯率
router.post(
  '/updateModifyRate',
  handleErrorAsync(platformController.updateModifyRate)
);

// 刪除平台匯率
router.delete(
  '/deleteModifyRate',
  handleErrorAsync(platformController.deleteModifyRate)
);

// cart
// 取得購物車
router.post('/cartData', handleErrorAsync(cartController.cartData));
// 更新購物車
router.post('/uploadCart', handleErrorAsync(cartController.uploadCart));
// 刪除購物車
router.delete('/deleteCart', handleErrorAsync(cartController.deleteCart));

// ProductFilter
// 搜尋分類
router.post('/productFilter', handleErrorAsync(productFilter.productFilter));
// 新增分類
router.post(
  '/createProductFilter',
  handleErrorAsync(productFilter.createProductFilter)
);
// 刪除商品分類
router.delete(
  '/deleteProductFilter',
  handleErrorAsync(productFilter.deleteProductFilter)
);

// Coupon
// 新增優惠卷
router.post('/createCoupon', handleErrorAsync(couponController.createCoupon));
// 取得優惠卷
router.post('/findAllCoupon', handleErrorAsync(couponController.findAllCoupon));
// 搜尋優惠卷
router.post('/searchCoupon', handleErrorAsync(couponController.searchCoupon));
// 取得個人優惠卷
router.post(
  '/findPersonalCoupon',
  handleErrorAsync(couponController.findPersonalCoupon)
);
// 更新優惠卷
router.patch(
  '/updateCoupon/:id',
  handleErrorAsync(couponController.updateCoupon)
);
// 更新優惠卷人數
router.patch(
  '/updateCouponUser/:id',
  handleErrorAsync(couponController.updateCouponUser)
);
// 刪除優惠卷
router.delete(
  '/deleteOneCoupon/:id',
  handleErrorAsync(couponController.deleteOneCoupon)
);
router.delete(
  '/deleteAllCoupon',
  handleErrorAsync(couponController.deleteAllCoupon)
);

// Product
// 搜尋全部商品
router.post('/allProduct', handleErrorAsync(productController.allProduct));
// 新增商品
router.post('/addProduct', handleErrorAsync(productController.addProduct));
// 更新商品
router.post(
  '/uploadProduct',
  handleErrorAsync(productController.uploadProduct)
);
// 刪除商品
router.delete(
  '/deleteProductOne/:id',
  handleErrorAsync(productController.deleteProductOne)
);
// 刪除商品分類
router.delete(
  '/deleteProductCategory',
  handleErrorAsync(productController.deleteProductCategory)
);
// 取得商品資料
router.post(
  '/productDatabase',
  handleErrorAsync(productController.productDatabase)
);

// img
router.get('/allImage', handleErrorAsync(imageController.allImage));
// 上傳圖片
router.post('/uploadImage', upload.single('file'), imageController.uploadImage);

// 更新網頁圖片
router.post(
  '/uploadWebImage',
  handleErrorAsync(imageController.uploadWebImage)
);

// country
router.post('/addCountry', handleErrorAsync(countryController.create));
router.get('/allCountry', handleErrorAsync(countryController.allCountry));

// Carousel
router.post(
  '/createCarouselImg',
  handleErrorAsync(carouselImgController.createCarouselImg)
);
router.get(
  '/findAllCarouselImg',
  handleErrorAsync(carouselImgController.findAllCarouselImg)
);
router.patch(
  '/uploadCarouselImg',
  handleErrorAsync(carouselImgController.uploadCarouselImg)
);
router.delete(
  '/deleteOneCarouselImg/:id',
  handleErrorAsync(carouselImgController.deleteOneCarouselImg)
);
// 取得啟動輪播圖
router.get(
  '/findActiveCarouselImg',
  handleErrorAsync(carouselImgController.findActiveCarouselImg)
);

// About
// 新增關於照片
router.post(
  '/createAboutImg',
  handleErrorAsync(aboutImgController.createAboutImg)
);
// 取得關於照片
router.get(
  '/findAllAboutImg',
  handleErrorAsync(aboutImgController.findAllAboutImg)
);
// 更新關於照片
router.patch(
  '/uploadAboutImg',
  handleErrorAsync(aboutImgController.uploadAboutImg)
);
// 刪除關於照片
router.delete(
  '/deleteOneAboutImg/:id',
  handleErrorAsync(aboutImgController.deleteOneAboutImg)
);
// 取得啟動關於圖片
router.get(
  '/findActiveAboutImg',
  handleErrorAsync(aboutImgController.findActiveAboutImg)
);

// Main
// 新增大綱照片
router.post(
  '/createMainImg',
  handleErrorAsync(mainImgController.createMainImg)
);
// 取得大綱照片
router.get(
  '/findAllMainImg',
  handleErrorAsync(mainImgController.findAllMainImg)
);

// 更新大綱照片
router.patch(
  '/uploadMainImg',
  handleErrorAsync(mainImgController.uploadMainImg)
);

// 刪除大綱照片
router.delete(
  '/deleteOneMainImg/:id',
  handleErrorAsync(mainImgController.deleteOneMainImg)
);

// 取得啟動主要圖片
router.get(
  '/findActiveMainImg',
  handleErrorAsync(mainImgController.findActiveMainImg)
);

// userBack
// 後台會員註冊
router.post(
  '/userBackRegister',
  handleErrorAsync(userBackController.userBackRegister)
);

// 後台會員登入
router.post(
  '/userBackLogin',
  handleErrorAsync(userBackController.userBackLogin)
);

// 後台會員變更密碼
router.post(
  '/userBackhandPassWord',
  handleErrorAsync(userBackController.userBackhandPassWord)
);

// 後台會員取得個人資料
router.get('/userBackInfo', handleErrorAsync(userBackController.userBackInfo));

// 搜尋後台會員
router.post(
  '/findAllUserBack',
  handleErrorAsync(userBackController.findAllUserBack)
);

// 修改後台會員權限
router.patch(
  '/uploadUserPermission',
  handleErrorAsync(userBackController.uploadUserPermission)
);

// order
// 創建訂單
router.post('/createOrder', handleErrorAsync(orderController.createOrder));
// 搜尋訂單
router.post('/searchOrder', handleErrorAsync(orderController.searchOrder));
// 刪除訂單
router.delete(
  '/deleteOneOrder/:id',
  handleErrorAsync(orderController.deleteOneOrder)
);


module.exports = router;
