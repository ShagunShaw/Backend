// Here we will write the code for getting our file (image, video, pdf, etc.) from the website 
// and then temporarily store it in our local server

import multer from "multer"

const Storage= multer.diskStorage({         // Here, we had two options: i) diskStorage (used for temporary storage before uploading)    ii) memoryStorage (used when we are directly uploading the file to our Cloudinary and is not saving to a local storage, because when using the memoryStorage, the file gets removed as soon as the request ends, but in diskStorage it stays)
    destination: function (req, file, cb) {
        cb(null, "./public/temp")           // 'cb' is a pre-defined callback function which takes two argument. The 1st argument is generally for handling errors which we are not doing right now so 'null'
    },
    filename: function (req, file, cb) {
        // const encodedFilename= file.originalName  + "-" + Date.now()         // We can also change our filename before uploading it to cloudinary, but we are not doing it now
        // cb(null, encodedFilename)

        cb(null, file.originalname)     // there are many other options for file like 'fieldname', 'filename', etc. Check them out
    }
})


// 'upload' does not require you to explicitly call next(), because it's not an ordinary middleware function, it is multer's middleware which handles the 'next()' internally
export const upload= multer({storage: Storage})