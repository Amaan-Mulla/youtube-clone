import multer from 'multer';
import path from 'path';

// Set up multer storage configuration 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp'); // specify the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1E9);

        const extension = path.extname(file.originalname);

        cb(
            null,
            file.fieldname + "-" + uniqueSuffix + extension
        );
    }
});

export const upload = multer({ 
    storage: storage 
}); // create a multer instance with the specified storage configuration