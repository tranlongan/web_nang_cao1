// database: db_web_nang_cao
const connection = require('../db');
// database: don_vi_hanh_chinh
const connection1 = require('../db1');
const multer = require('multer');
const path = require('path');
const util = require('util');
const query = util.promisify(connection.query).bind(connection);
const query1 = util.promisify(connection1.query).bind(connection1);

// ********************************************************************************************************************
// set up cho việc upload ảnh
// cho biết toàn bộ thông tin về file ảnh
const storage = multer.diskStorage({
    destination: 'public/upload/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// tạo ra function upload
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image');

// tạp ra function kiểm tra có phải là ảnh ko
function checkFileType(file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Only image');
    }
};
// Kết thúc phần set up ảnh
// ********************************************************************************************************************
// phần cho user
const loadLogin = (req, res) => {
    res.render('login_user');
}

// Đăng ký tài khoản user
const registerAccountUser = (req, res) => {
    upload(req, res, (err) => {
        const {dk_username_user, nameAccount_user, dk_password_user, dk_password_user1} = req.body;
        if (dk_username_user === '' || nameAccount_user === '' || dk_password_user === '' || dk_password_user1 === '') {
            res.json({
                msg: 'Important items must not be left blank'
            })
        } else {
            if (dk_password_user != dk_password_user1) {
                res.json({
                    msg: 'The two passwords are not the same'
                })
            } else {
                const sql = `INSERT INTO account_user (id, username_user, name_user, password_user) VALUES (null, '${dk_username_user}', '${nameAccount_user}','${dk_password_user}')`;
                connection.query(sql, (err, result) => {
                    res.json({
                        msg: 'Sign up success'
                    })
                })
            }
        }
    })
}

// Đăng nhập user
const loginAccountUser = async (req, res) => {
    upload(req, res, async (err) => {
        try {
            const {dn_username_user, dn_password_user} = req.body;
            if (dn_username_user === '' || dn_password_user === '') {
                res.json({
                    msg: 'account error'
                })
            } else {
                const result_id_account = await query(`SELECT id FROM account_user WHERE username_user = '${dn_username_user}' AND password_user = '${dn_password_user}'`);
                const result = await query(`SELECT 1 as v FROM account_user WHERE username_user = '${dn_username_user}' AND password_user = '${dn_password_user}'`);
                if (result[0] == undefined) {
                    res.json({
                        msg: 'account error1'
                    })
                } else {
                    if (result[0].v == 1) {
                        res.json({msg: 'login success', rl: result_id_account});
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }

    })
}

// load home của user
const homeUser = async (req, res) => {
    const number_limit = 3;
    const id_user = req.query.id_user;

    // dùng để đếm số trang
    const count_page = await query(`SELECT * FROM page`);

    // dùng để lấy dữ liệu danh mục
    const result_category = await query(`SELECT * FROM danh_muc`);

    // dùng để lấy name account
    const result_account = await query(`SELECT * FROM account_user WHERE id = '${id_user}'`);
    // dùng để đếm số lượng sản phẩm
    const count_number_product = await query(`SELECT * FROM san_pham`);
    // Nếu không tồn tại cookie number_page thì mặc định sẽ là hiển thị 3 sản phẩm
    if (req.cookies.number_page == undefined) {
        const milestones = Math.ceil(((count_number_product.length) / number_limit));
        if (milestones <= parseInt(count_page.length)) {
            // dùng để in ra số trang vừa đủ
            const pages = await query(`SELECT * FROM page LIMIT ${milestones}`);
            // dùng để in ra 4 sản phẩm đầu tiên, tương tự như page 1
            const result_4_product = await query(`SELECT * FROM san_pham LIMIT ${number_limit}`);
            res.render('user/homeUser', {
                pages,
                result: result_category,
                result1: result_4_product,
                id_user,
                result_account
            });
        } else {
            console.log('Ko đủ chỗ trống');
        }
    }
    // Trường hợp đã tồn tại cookie number_page
    if (req.cookies.number_page != undefined) {
        const data_of_number_page_cookie = req.cookies.number_page;
        const number_limit_of_cookie = data_of_number_page_cookie.numberPage;

        const milestones = Math.ceil(((count_number_product.length) / number_limit_of_cookie));
        if (milestones <= parseInt(count_page.length)) {
            // dùng để in ra số trang vừa đủ
            const pages = await query(`SELECT * FROM page LIMIT ${milestones}`);
            // dùng để in ra 4 sản phẩm đầu tiên, tương tự như page 1
            const result_4_product = await query(`SELECT * FROM san_pham LIMIT ${number_limit_of_cookie}`);
            res.render('user/homeUser', {
                pages,
                result: result_category,
                result1: result_4_product,
                id_user,
                result_account
            })
        } else {
            console.log('Ko đủ chỗ trống');
        }
    }
}


// phân trang
const pagination = async (req, res) => {
    const {page = 1, limit = 3, id_user} = req.query;
    const page1 = req.query.page;
    try {
        // dùng để lấy name account
        const result_account = await query(`SELECT * FROM account_user WHERE id = '${id_user}'`);

        // dùng để lấy dữ liệu danh mục
        const result_category = await query(`SELECT * FROM danh_muc`);
        // dùng để đếm số lượng sản phẩm
        const count_number_product = await query(`SELECT * FROM san_pham`);
        const milestones = Math.ceil(((count_number_product.length) / limit));
        // dùng để đếm số trang
        const count_page = await query(`SELECT * FROM page`);

        if (req.cookies.number_page == undefined) {
            if (milestones <= parseInt(count_page.length)) {
                // dùng để in ra số trang vừa đủ
                const pages = await query(`SELECT * FROM page LIMIT ${milestones}`);

                const sanpham = await query(`SELECT * FROM san_pham LIMIT ${limit} OFFSET ${(page1 - 1) * limit}`);
                res.render('user/pagePagination', {
                    id_user, sanpham, result_account,
                    result_category, pages
                })
            }
        }
        if (req.cookies.number_page != undefined) {
            const number_limit_of_cookie = req.cookies.number_page.numberPage;

            const milestones1 = Math.ceil(((count_number_product.length) / number_limit_of_cookie));
            // dùng để in ra số trang vừa đủ
            const pages = await query(`SELECT * FROM page LIMIT ${milestones1}`);
            const sanpham = await query(`SELECT * FROM san_pham LIMIT ${number_limit_of_cookie} OFFSET ${(page1 - 1) * number_limit_of_cookie}`);
            res.render('user/pagePagination', {
                id_user, sanpham, result_account,
                result_category, pages
            })
        }
    } catch (error) {
        console.error(error);
    }
}

// thêm số sản phẩm hiển thị vào cookie
const insertNumberPageToCookie = (req, res) => {
    const {data_select_number_page} = req.body;
    const id_user = req.query.id_user;
    let number_page = {
        idUser: id_user,
        numberPage: data_select_number_page
    }
    // lưu cookie trong vòng 12 giờ
    res.cookie('number_page', number_page, {maxAge: 12 * 60 * 60 * 1000});
    res.json({
        msg: 'ok'
    })
}

// Tìm kiếm sản phẩm
const pageSearchProduct = async (req, res) => {
    try {
        const {id_user, search, head, tail, distinguish} = req.query;
        let check;
        // dùng để lấy name account
        const result_account = await query(`SELECT * FROM account_user WHERE id = '${id_user}'`);
        const find = await query(`SELECT * FROM san_pham WHERE name_product LIKE '%${search}%' OR name_category LIKE '%${search}%'`);
        // load những nội dung khi tìm kiếm qua thanh tìm kiếm
        if (distinguish === "searchByInput") {
            check = distinguish;
            const result_search = await query(`SELECT * FROM san_pham WHERE name_product LIKE '%${search}%' OR cost LIKE '%${search}%' OR name_category LIKE '%${search}%'`);
            res.render('user/pageSearch', {result_search, id_user, result_account, find, head, tail, check});
            console.log(find);
        }
        // load những nội dung khi lựa chọn mức giá
        if (distinguish === "searchByButton") {
            if (head === '0' || tail === '0') {
                if (tail === '0') {
                    const result_search = await query(`SELECT * FROM san_pham WHERE  cost > '${head}'`);
                    check = "searchByButton";
                    res.render('user/pageSearch', {
                        id_user, result_account, check,
                        result_search, head, tail
                    });
                }
                if (head === '0') {
                    const result_search = await query(`SELECT * FROM san_pham WHERE cost < '${tail}'`);
                    check = "searchByButton";
                    res.render('user/pageSearch', {
                        id_user, result_account, check,
                        result_search, head, tail
                    })
                }
            }
            if (head === tail) {
                const result_search = await query(`SELECT * FROM san_pham WHERE cost = '${head}'`);
                check = "searchByButton";
                res.render('user/pageSearch', {
                    id_user, result_account, check,
                    result_search, head, tail
                })
            }
            if (head != '0' && tail != '0') {
                const result_search = await query(`SELECT * FROM san_pham WHERE (cost > '${head}' AND cost < '${tail}')`);
                check = "searchByButton";
                res.render('user/pageSearch', {
                    id_user, result_account, check,
                    result_search, head, tail
                })
            }
        }
    } catch (e) {
        console.error(e)
    }

}

// Tìm kiếm theo giá tiền
const searchProductByMoney = async (req, res) => {
    try {
    } catch (e) {
        console.log(e);
    }
}
module.exports = {
    loadLogin, registerAccountUser, loginAccountUser, homeUser, pagination, insertNumberPageToCookie, pageSearchProduct,
    searchProductByMoney
}