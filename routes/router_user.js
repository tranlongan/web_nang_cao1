const express = require('express');
const router = express.Router();
const controller = require('../controller/controller_user.js');

/* GET users listing. */
router.get('/', controller.loadLogin);
// đăng ký tài khoản - của bên user
router.post('/registerAccountUser', controller.registerAccountUser);
// đăng nhập - của bên user
router.post('/loginAccountUser', controller.loginAccountUser);
// load home của user
router.get('/homeUser', controller.homeUser);
//phân trang
// router.post('/pagination', controller.pagination);
// trang phân trang :v
router.get('/user/pagePagination' ,controller.pagination);
// thêm số sản phẩm mà user muốn hiển thị vào cookie
router.post('/insertNumberPageToCookie', controller.insertNumberPageToCookie);
// tìm kiếm sản phẩm theo tên sản phẩm hoặc tên danh mục
router.get('/user/pageSearchProduct', controller.pageSearchProduct);
// tìm sản phẩm theo mức tiền
router.get('/searchProductByMoney', controller.searchProductByMoney);

module.exports = router;
