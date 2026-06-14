import multer, { Multer } from 'multer';
import path from 'path';
import { BadRequestError } from '@common/errors';
import { FILE_CONFIG } from '@common/constants';
import { Logger } from '@common/logger';

const logger = new Logger('UploadMiddleware');

const storage = multer.memoryStorage();

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (
    FILE_CONFIG.ALLOWED_RESUME_EXTENSIONS.includes(ext) &&
    FILE_CONFIG.ALLOWED_RESUME_TYPES.includes(mimetype)
  ) {
    cb(null, true);
  } else {
    logger.warn(
      `Invalid file type: ${mimetype}, extension: ${ext}`
    );
    cb(
      new BadRequestError(
        `Invalid file type. Allowed types: ${FILE_CONFIG.ALLOWED_RESUME_EXTENSIONS.join(', ')}`
      )
    );
  }
};

const limits = {
  fileSize: FILE_CONFIG.MAX_RESUME_SIZE,
};

export const resumeUploadMiddleware: Multer = multer({
  storage,
  fileFilter,
  limits,
});

export const validateFileSize = (req: any, res: any, next: any) => {
  if (req.file && req.file.size > FILE_CONFIG.MAX_RESUME_SIZE) {
    return next(
      new BadRequestError(
        `File size exceeds limit of ${FILE_CONFIG.MAX_RESUME_SIZE / 1024 / 1024}MB`
      )
    );
  }
  next();
};

export default resumeUploadMiddleware;
