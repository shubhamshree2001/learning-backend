import multer from 'multer';

//we can also use memory storage but it gets full very fast 
//we are doing this to store file locally before uploading it to cloudinary
const storage = multer.diskStorage({
    // the file here which is under multer, req we can get which has body and params 
    // but multer has the file access 
    //cb is callback function
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) { 
        // we can customize the file name before keeping it to local server
        cb(null, file.originalname);
    }
});

const  upload = multer({ storage: storage });

export { upload };