import { Job, IJob } from '@database/models/job.model';
import { Logger } from '@common/logger';
import { NotFoundError } from '@common/errors';
import { JobStatus } from '@common/enums';
import { PAGINATION } from '@common/constants';

const logger = new Logger('JobService');

export class JobService {
  async createJob(jobData: Partial<IJob>): Promise<IJob> {
    try {
      logger.info(`Creating job: ${jobData.title}`);

      const job = await Job.create(jobData);

      logger.info(`Job created: ${job._id}`);
      return job;
    } catch (error) {
      logger.error('Failed to create job', error);
      throw error;
    }
  }

  async getJobById(jobId: string): Promise<IJob> {
    try {
      const job = await Job.findById(jobId).populate('createdBy', 'name email');

      if (!job) {
        throw new NotFoundError('Job not found');
      }

      return job;
    } catch (error) {
      logger.error('Failed to get job', error);
      throw error;
    }
  }

  async listJobs(
    filters?: {
      status?: JobStatus;
      createdBy?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    jobs: IJob[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = filters?.page || PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(filters?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

      const query: any = {};
      if (filters?.status) query.status = filters.status;
      if (filters?.createdBy) query.createdBy = filters.createdBy;

      const total = await Job.countDocuments(query);
      const jobs = await Job.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return {
        jobs,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to list jobs', error);
      throw error;
    }
  }

  async updateJob(jobId: string, updateData: Partial<IJob>): Promise<IJob> {
    try {
      logger.info(`Updating job: ${jobId}`);

      const job = await Job.findByIdAndUpdate(
        jobId,
        updateData,
        { new: true }
      ).populate('createdBy', 'name email');

      if (!job) {
        throw new NotFoundError('Job not found');
      }

      logger.info(`Job updated: ${jobId}`);
      return job;
    } catch (error) {
      logger.error('Failed to update job', error);
      throw error;
    }
  }

  async updateJobStatus(jobId: string, status: JobStatus): Promise<IJob> {
    try {
      logger.info(`Updating job status to ${status}: ${jobId}`);

      const updateData: any = { status };

      if (status === JobStatus.CLOSED) {
        updateData.closedAt = new Date();
      }

      const job = await Job.findByIdAndUpdate(
        jobId,
        updateData,
        { new: true }
      ).populate('createdBy', 'name email');

      if (!job) {
        throw new NotFoundError('Job not found');
      }

      logger.info(`Job status updated: ${jobId} -> ${status}`);
      return job;
    } catch (error) {
      logger.error('Failed to update job status', error);
      throw error;
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    try {
      logger.info(`Deleting job: ${jobId}`);

      const result = await Job.findByIdAndDelete(jobId);

      if (!result) {
        throw new NotFoundError('Job not found');
      }

      logger.info(`Job deleted: ${jobId}`);
    } catch (error) {
      logger.error('Failed to delete job', error);
      throw error;
    }
  }

  async searchJobs(searchTerm: string): Promise<IJob[]> {
    try {
      logger.info(`Searching jobs: ${searchTerm}`);

      const jobs = await Job.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { requiredSkills: { $regex: searchTerm, $options: 'i' } },
        ],
      }).populate('createdBy', 'name email');

      return jobs;
    } catch (error) {
      logger.error('Failed to search jobs', error);
      throw error;
    }
  }

  async getOpenJobs(): Promise<IJob[]> {
    try {
      return await Job.find({ status: JobStatus.OPEN })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Failed to get open jobs', error);
      throw error;
    }
  }

  async getJobsByRecruiter(recruiterId: string): Promise<IJob[]> {
    try {
      return await Job.find({ createdBy: recruiterId })
        .sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Failed to get jobs by recruiter', error);
      throw error;
    }
  }
}

export default new JobService();
