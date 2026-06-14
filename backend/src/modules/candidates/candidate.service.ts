import { Candidate, ICandidate } from '@database/models/candidate.model';
import { Logger } from '@common/logger';
import { NotFoundError, BadRequestError } from '@common/errors';
import { CandidateStatus } from '@common/enums';
import { PAGINATION } from '@common/constants';

const logger = new Logger('CandidateService');

export class CandidateService {
  async createCandidate(candidateData: Partial<ICandidate>): Promise<ICandidate> {
    try {
      logger.info(`Creating candidate: ${candidateData.email}`);

      const candidate = await Candidate.create(candidateData);

      logger.info(`Candidate created: ${candidate._id}`);
      return candidate;
    } catch (error) {
      logger.error('Failed to create candidate', error);
      throw error;
    }
  }

  async getCandidateById(candidateId: string): Promise<ICandidate> {
    try {
      const candidate = await Candidate.findById(candidateId);

      if (!candidate) {
        throw new NotFoundError('Candidate not found');
      }

      return candidate;
    } catch (error) {
      logger.error('Failed to get candidate', error);
      throw error;
    }
  }

  async getCandidateByEmail(email: string): Promise<ICandidate | null> {
    try {
      return await Candidate.findOne({ email: email.toLowerCase() });
    } catch (error) {
      logger.error('Failed to get candidate by email', error);
      throw error;
    }
  }

  async getCandidateByPineconeId(pineconeId: string): Promise<ICandidate | null> {
    try {
      return await Candidate.findOne({ pineconeId });
    } catch (error) {
      logger.error('Failed to get candidate by pineconeId', error);
      throw error;
    }
  }

  async listCandidates(
    filters?: {
      status?: CandidateStatus;
      source?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    candidates: ICandidate[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = filters?.page || PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(filters?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

      const query: any = {};
      if (filters?.status) query.status = filters.status;
      if (filters?.source) query.source = filters.source;

      const total = await Candidate.countDocuments(query);
      const candidates = await Candidate.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return {
        candidates,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to list candidates', error);
      throw error;
    }
  }

  async updateCandidate(candidateId: string, updateData: Partial<ICandidate>): Promise<ICandidate> {
    try {
      logger.info(`Updating candidate: ${candidateId}`);

      const candidate = await Candidate.findByIdAndUpdate(
        candidateId,
        updateData,
        { new: true }
      );

      if (!candidate) {
        throw new NotFoundError('Candidate not found');
      }

      logger.info(`Candidate updated: ${candidateId}`);
      return candidate;
    } catch (error) {
      logger.error('Failed to update candidate', error);
      throw error;
    }
  }

  async updateCandidateStatus(
    candidateId: string,
    status: CandidateStatus,
    reason?: string
  ): Promise<ICandidate> {
    try {
      logger.info(`Updating candidate status to ${status}: ${candidateId}`);

      const updateData: any = { status };

      if (status === CandidateStatus.SELECTED) {
        updateData.selectedAt = new Date();
      } else if (status === CandidateStatus.REJECTED) {
        updateData.rejectedAt = new Date();
        if (reason) {
          updateData.rejectionReason = reason;
        }
      }

      const candidate = await Candidate.findByIdAndUpdate(
        candidateId,
        updateData,
        { new: true }
      );

      if (!candidate) {
        throw new NotFoundError('Candidate not found');
      }

      logger.info(`Candidate status updated: ${candidateId} -> ${status}`);
      return candidate;
    } catch (error) {
      logger.error('Failed to update candidate status', error);
      throw error;
    }
  }

  async deleteCandidate(candidateId: string): Promise<void> {
    try {
      logger.info(`Deleting candidate: ${candidateId}`);

      const result = await Candidate.findByIdAndDelete(candidateId);

      if (!result) {
        throw new NotFoundError('Candidate not found');
      }

      logger.info(`Candidate deleted: ${candidateId}`);
    } catch (error) {
      logger.error('Failed to delete candidate', error);
      throw error;
    }
  }

  async searchCandidates(searchTerm: string): Promise<ICandidate[]> {
    try {
      logger.info(`Searching candidates: ${searchTerm}`);

      const candidates = await Candidate.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { skills: { $regex: searchTerm, $options: 'i' } },
        ],
      });

      return candidates;
    } catch (error) {
      logger.error('Failed to search candidates', error);
      throw error;
    }
  }

  async getCandidatesByStatus(status: CandidateStatus): Promise<ICandidate[]> {
    try {
      return await Candidate.find({ status }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Failed to get candidates by status', error);
      throw error;
    }
  }

  async addRating(
    candidateId: string,
    rating: {
      technicalSkills?: number;
      communication?: number;
      cultureFit?: number;
      overall?: number;
    }
  ): Promise<ICandidate> {
    try {
      logger.info(`Adding rating for candidate: ${candidateId}`);

      const candidate = await Candidate.findByIdAndUpdate(
        candidateId,
        { ratings: rating },
        { new: true }
      );

      if (!candidate) {
        throw new NotFoundError('Candidate not found');
      }

      return candidate;
    } catch (error) {
      logger.error('Failed to add rating', error);
      throw error;
    }
  }
}

export default new CandidateService();
