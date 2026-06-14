import { Candidate } from '@database/models/candidate.model';
import { Job } from '@database/models/job.model';
import { Interview } from '@database/models/interview.model';
import { MatchingResult } from '@database/models/matchingResult.model';
import { CandidateStatus, JobStatus } from '@common/enums';

export class AnalyticsService {
  async getDashboard() {
    const [
      totalCandidates,
      totalJobs,
      openJobs,
      selectedCandidates,
      shortlistedCandidates,
      rejectedCandidates,
      upcomingInterviews,
    ] = await Promise.all([
      Candidate.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ status: JobStatus.OPEN }),
      Candidate.countDocuments({ status: CandidateStatus.SELECTED }),
      Candidate.countDocuments({ status: CandidateStatus.SHORTLISTED }),
      Candidate.countDocuments({ status: CandidateStatus.REJECTED }),
      Interview.countDocuments({ scheduledDate: { $gte: new Date() } }),
    ]);

    return {
      totalCandidates,
      totalJobs,
      openJobs,
      selectedCandidates,
      shortlistedCandidates,
      rejectedCandidates,
      upcomingInterviews,
    };
  }

  async getJobAnalytics() {
    const byStatus = await Job.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const topMatchedJobs = await MatchingResult.aggregate([
      { $group: { _id: '$jobId', averageScore: { $avg: '$finalScore' }, candidates: { $sum: 1 } } },
      { $sort: { averageScore: -1 } },
      { $limit: 10 },
    ]);

    return { byStatus, topMatchedJobs };
  }

  async getCandidateAnalytics() {
    const byStatus = await Candidate.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const bySource = await Candidate.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const topSkills = await Candidate.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    return { byStatus, bySource, topSkills };
  }
}

export default new AnalyticsService();
