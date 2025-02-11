import multer from "multer";
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

// S3 클라이언트 설정
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const storage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        try {
            const safeFileName = file.originalname
                .replace(/\s+/g, "-")
                .replace(/[^a-zA-Z0-9.\-_]/g, "");
            const uniqueFileName = `${Date.now()}-${safeFileName}`;
            cb(null, `uploads/${uniqueFileName}`);
        } catch (error) {
            console.error("key 함수 오류:", error);
            cb(error);
        }
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.mimetype)) {
            console.log("허용되지 않은 파일 타입입니다:", file.mimetype);
            return cb(new Error("Invalid file type"));
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});

const generateCloudFrontUrl = (key) => {
    const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
    if (!cloudFrontDomain) {
        console.error("CLOUDFRONT_DOMAIN 이 설정되지 않았습니다.");
        return null;
    }
    return `${cloudFrontDomain}/${key}`;
};

export { upload, generateCloudFrontUrl, };
