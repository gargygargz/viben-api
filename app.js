// const multer = require('multer')
// const upload = multer({ dest: './uploads/' })

// app.post('/', upload.single('myFile'), function (req, res) {
// 	res.send(req.file)
// })

// const cloudinary = require('cloudinary')

// //post route
// app.post('/', upload.single('myFile'), function (req, res) {
// 	cloudinary.uploader.upload(req.file.path, function (result) {
// 		res.send(result)
// 	})
// })

// //using previously generated public id
// var imgUrl = cloudinary.url("dysepgd0ucddso648bit", { width: 150, height: 150, crop: 'crop', gravity: 'face', radius: 'max' });

// // link 2

// const storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, 'uploads')
// 	},
// 	filename: function (req, file, cb) {
// 		console.log(file)
// 		cb(null, file.originalname)
// 	},
// })

// const upload = multer({ storage: storage })

// app.use(express.static('uploads'))