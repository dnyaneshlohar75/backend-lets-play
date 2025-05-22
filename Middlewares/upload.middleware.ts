import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./../Configuration/cloudinary.config";

const storage = new CloudinaryStorage({ cloudinary, params: async (req, file) => ({
    folder: "profile_pictures",
    format: "png",
    public_id: `image_${Date.now()}`,
    upload: file
  }),
});

const upload = multer({ storage });

export default upload;