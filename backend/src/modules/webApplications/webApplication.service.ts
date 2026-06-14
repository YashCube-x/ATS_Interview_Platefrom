import { WebApplication, IWebApplication, WebAppStatus } from '@database/models/webApplication.model';
import { Logger } from '@common/logger';
import { NotFoundError, BadRequestError } from '@common/errors';
import { uploadToCloudinary } from '@config/cloudinary.config';
import { v4 as uuid } from 'uuid';

const logger = new Logger('WebApplicationService');

export class WebApplicationService {
  /**
   * Submit a new application from the main website.
   * The resume file buffer is optional – if provided it is uploaded to Cloudinary.
   */
  async submitApplication(
    data: {
      fullName: string;
      email: string;
      phone?: string;
      positionApplied: string;
      coverLetter?: string;
    },
    resumeFile?: { buffer: Buffer; originalname: string },
    meta?: { ipAddress?: string; referrerUrl?: string }
  ): Promise<IWebApplication> {
    try {
      logger.info(`New website application from: ${data.email} for ${data.positionApplied}`);

      let resumeUrl: string | undefined;
      let resumeOriginalName: string | undefined;

      if (resumeFile) {
        try {
          logger.info(`Uploading resume to Cloudinary: ${resumeFile.originalname}`);
          const cloudinaryResult = await uploadToCloudinary(
            resumeFile.buffer,
            resumeFile.originalname,
            'ats-website-resumes'
          );
          resumeUrl = cloudinaryResult.url;
          resumeOriginalName = resumeFile.originalname;
          logger.info('Resume uploaded successfully');
        } catch (uploadError) {
          logger.warn('Cloudinary upload failed for website application, storing without resume URL', uploadError);
          resumeUrl = undefined;
          resumeOriginalName = resumeFile.originalname;
        }
      }

      const application = await WebApplication.create({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        positionApplied: data.positionApplied,
        coverLetter: data.coverLetter,
        resumeUrl,
        resumeOriginalName,
        status: 'new',
        ipAddress: meta?.ipAddress,
        referrerUrl: meta?.referrerUrl,
      });

      logger.info(`Website application created: ${application._id}`);
      return application;
    } catch (error) {
      logger.error('Failed to create website application', error);
      throw error;
    }
  }

  /**
   * List all website applications with optional filters.
   */
  async listApplications(filters?: {
    status?: WebAppStatus;
    page?: number;
    limit?: number;
  }): Promise<{ applications: IWebApplication[]; total: number; page: number; limit: number }> {
    try {
      const page = filters?.page || 1;
      const limit = Math.min(filters?.limit || 20, 100);

      const query: any = {};
      if (filters?.status) query.status = filters.status;

      const total = await WebApplication.countDocuments(query);
      const applications = await WebApplication.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('convertedCandidateId', 'name email status');

      return { applications, total, page, limit };
    } catch (error) {
      logger.error('Failed to list website applications', error);
      throw error;
    }
  }

  /**
   * Get a single application by ID.
   */
  async getApplicationById(id: string): Promise<IWebApplication> {
    try {
      const application = await WebApplication.findById(id).populate('convertedCandidateId', 'name email status');
      if (!application) {
        throw new NotFoundError('Web application not found');
      }
      return application;
    } catch (error) {
      logger.error('Failed to get web application', error);
      throw error;
    }
  }

  /**
   * Update the review status of an application.
   */
  async updateStatus(id: string, status: WebAppStatus): Promise<IWebApplication> {
    try {
      logger.info(`Updating web application status: ${id} -> ${status}`);
      const application = await WebApplication.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!application) {
        throw new NotFoundError('Web application not found');
      }
      return application;
    } catch (error) {
      logger.error('Failed to update web application status', error);
      throw error;
    }
  }

  /**
   * Summary counts for the dashboard.
   */
  async getSummary(): Promise<{ total: number; new: number; reviewed: number; converted: number; rejected: number }> {
    try {
      const [total, newCount, reviewed, converted, rejected] = await Promise.all([
        WebApplication.countDocuments(),
        WebApplication.countDocuments({ status: 'new' }),
        WebApplication.countDocuments({ status: 'reviewed' }),
        WebApplication.countDocuments({ status: 'converted' }),
        WebApplication.countDocuments({ status: 'rejected' }),
      ]);
      return { total, new: newCount, reviewed, converted, rejected };
    } catch (error) {
      logger.error('Failed to get web application summary', error);
      throw error;
    }
  }
}

export default new WebApplicationService();
