import { v2 as cloudinary } from 'cloudinary';
import { Logger } from '@common/logger';
import { envConfig } from './env.config';

const logger = new Logger('CloudinaryConfig');

export const initCloudinary = (): void => {
  try {
    cloudinary.config({
      cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
      api_key: envConfig.CLOUDINARY_API_KEY,
      api_secret: envConfig.CLOUDINARY_API_SECRET,
    });
    logger.info('Cloudinary configured successfully');
  } catch (error) {
    logger.error('Failed to configure Cloudinary', error);
    throw error;
  }
};

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'ats-resumes'
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: `${folder}/${fileName}`,
        resource_type: 'auto',
        folder,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload failed', error);
          reject(error);
        } else {
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Deleted file from Cloudinary: ${publicId}`);
  } catch (error) {
    logger.error('Failed to delete file from Cloudinary', error);
    throw error;
  }
};

export default {
  initCloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
