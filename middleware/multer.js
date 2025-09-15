import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Recreate __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "utils", "image"));
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const cleanFileName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${timestamp}-${cleanFileName}`);
  },
});

const fileFilter = function (req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".jpeg" && ext !== ".jpg" && ext !== ".png") {
    return cb(new Error("File type is not supported"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
