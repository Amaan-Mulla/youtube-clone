import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const removeLocalFile = async (localFilePath) => {
    if (!localFilePath) return;

    try {
        await fs.promises.unlink(localFilePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error(
                `Local upload cleanup failed: ${error.message}`
            );
        }
    }
};

// this function uploads a file to cloudinary and returns the response
const uploadCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null

    // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto"
    })
    // file has been uploaded successfully
        // console.log("file is uploaded on cloudinary", response.url);
        await removeLocalFile(localFilePath);
        return response;
    } catch (error) {
        console.log("Cloudinary upload error:", error);

        await removeLocalFile(localFilePath);

        return null;
    }
}


const deleteCloudinary = async (publicId, resourceType) => {
    try {
        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        return response;
    } catch (error) {
        console.error(
            `Cloudinary cleanup failed for ${publicId}: ${error.message}`
        );
        return null;
    }
};

export { uploadCloudinary, deleteCloudinary, removeLocalFile };
