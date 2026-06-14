# ATS Backend - Implementation Guide

## 📋 Project Structure Complete Overview

```
backend/
├── src/
│   ├── app.ts                    # Express app initialization
│   ├── server.ts                 # Server entry point with service initialization
│   │
│   ├── config/                   # Configuration files
│   │   ├── env.config.ts         # Environment validation (IMPLEMENTED)
│   │   ├── database.config.ts    # MongoDB connection (IMPLEMENTED)
│   │   ├── cloudinary.config.ts  # File upload service (IMPLEMENTED)
│   │   ├── pinecone.config.ts    # Vector database setup (IMPLEMENTED)
│   │   ├── gemini.config.ts      # AI service init (IMPLEMENTED)
│   │   └── gmail.config.ts       # Email intake setup (IMPLEMENTED)
│   │
│   ├── common/                   # Shared utilities
│   │   ├── constants/            # App constants (IMPLEMENTED)
│   │   ├── enums/                # Status & role enums (IMPLEMENTED)
│   │   ├── errors/               # Custom error classes (IMPLEMENTED)
│   │   ├── logger/               # Winston logger (IMPLEMENTED)
│   │   └── responses/            # Response builders (IMPLEMENTED)
│   │
│   ├── middleware/               # Express middleware (ALL IMPLEMENTED)
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── database/                 # Database layer
│   │   └── models/               # Mongoose schemas (ALL IMPLEMENTED)
│   │       ├── user.model.ts
│   │       ├── candidate.model.ts
│   │       ├── job.model.ts
│   │       ├── interview.model.ts
│   │       ├── offer.model.ts
│   │       ├── candidatePortalCredentials.model.ts
│   │       └── matchingResult.model.ts
│   │
│   ├── services/                 # Business logic services
│   │   ├── gemini/               # AI services (IMPLEMENTED)
│   │   ├── pinecone/             # Vector DB (IMPLEMENTED)
│   │   ├── email/                # Email sending (IMPLEMENTED)
│   │   ├── embeddings/           # Vector generation (IMPLEMENTED)
│   │   ├── resumeParsing/        # Resume parsing utils (IMPLEMENTED)
│   │   └── scoring/              # Matching engines (ALL IMPLEMENTED)
│   │
│   ├── modules/                  # Feature modules
│   │   ├── auth/                 # Auth module (IMPLEMENTED)
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   │
│   │   ├── candidates/           # Candidate management (PARTIALLY DONE)
│   │   │   └── candidate.service.ts
│   │   │
│   │   ├── resumes/              # Resume processing (PARTIALLY DONE)
│   │   │   └── resume.service.ts
│   │   │
│   │   ├── jobs/                 # Job management (PARTIALLY DONE)
│   │   │   └── job.service.ts
│   │   │
│   │   ├── matching/             # Matching algorithm (PARTIALLY DONE)
│   │   │   └── matching.service.ts
│   │   │
│   │   ├── interviews/           # Interview scheduling (TO DO)
│   │   ├── candidatePortal/      # Candidate portal (TO DO)
│   │   ├── emails/               # Email notifications (TO DO)
│   │   ├── analytics/            # Analytics (TO DO)
│   │   └── notifications/        # Notifications (TO DO)
│   │
│   └── utils/                    # Helper functions (TO DO)
│
├── .env.example                  # Environment template (IMPLEMENTED)
├── package.json                  # Dependencies (IMPLEMENTED)
├── tsconfig.json                 # TypeScript config (IMPLEMENTED)
├── README.md                      # Full documentation (IMPLEMENTED)
└── postman-collection.json       # API collection (IMPLEMENTED)
```

## 🔧 What Has Been Implemented

### ✅ Core Infrastructure (Complete)

- [x] TypeScript configuration and project setup
- [x] Environment configuration with validation
- [x] MongoDB database models for all entities
- [x] Express middleware stack (auth, RBAC, errors, validation, upload)
- [x] Logger and error handling
- [x] API response standardization
- [x] Enums and constants

### ✅ Service Integrations (Complete)

- [x] Gemini AI integration for resume parsing
- [x] Pinecone vector database setup
- [x] Cloudinary file upload
- [x] SMTP email service
- [x] Gmail API configuration
- [x] Embeddings generation

### ✅ Matching Engine (Complete)

- [x] Skill scoring algorithm
- [x] Experience scoring algorithm
- [x] Education level scoring
- [x] Project keyword matching
- [x] Semantic similarity scoring (Pinecone)
- [x] Final score calculation with weights

### ✅ Modules (Partially Implemented)

- [x] Authentication module (register, login, tokens, profile)
- [x] Candidate service (CRUD, search, status updates)
- [x] Job service (CRUD, search, filter)
- [x] Resume service (upload, parse, embed, store)
- [x] Matching service (score calculation, ranking)

## 📋 What Needs to Be Implemented (Next Steps)

### 1. Complete Candidate Module (1-2 hours)

**Files to create:**

- `src/modules/candidates/candidate.controller.ts`
- `src/modules/candidates/candidate.routes.ts`
- `src/modules/candidates/candidate.validation.ts`
- `src/modules/candidates/candidate.repository.ts`

**Tasks:**

```typescript
// candidate.controller.ts should implement:
- listCandidates() - GET /api/candidates
- getCandidateById() - GET /api/candidates/:id
- createCandidate() - POST /api/candidates
- updateCandidate() - PUT /api/candidates/:id
- updateCandidateStatus() - PUT /api/candidates/:id/status
- deleteCandidate() - DELETE /api/candidates/:id
- searchCandidates() - GET /api/candidates/search?term=...
- rateCandidatecandidate() - POST /api/candidates/:id/rating
```

### 2. Complete Resume Module (1-2 hours)

**Files to create:**

- `src/modules/resumes/resume.controller.ts`
- `src/modules/resumes/resume.routes.ts`
- `src/modules/resumes/resume.validation.ts`

**Tasks:**

```typescript
// resume.controller.ts should implement:
- uploadResume() - POST /api/resumes/upload
  - Use multer middleware
  - Call ResumeService.uploadAndParseResume()
  - Return candidate data and URLs

- getResumeInfo() - GET /api/resumes/:id
  - Get resume text and parsed data

- reprocessResume() - POST /api/resumes/:id/reprocess
  - Allow re-uploading and parsing
```

### 3. Complete Job Module (1-2 hours)

**Files to create:**

- `src/modules/jobs/job.controller.ts`
- `src/modules/jobs/job.routes.ts`
- `src/modules/jobs/job.validation.ts`

**Tasks:**

```typescript
// job.controller.ts should implement:
- createJob() - POST /api/jobs
- listJobs() - GET /api/jobs
- getJobById() - GET /api/jobs/:id
- updateJob() - PUT /api/jobs/:id
- updateJobStatus() - PUT /api/jobs/:id/status
- deleteJob() - DELETE /api/jobs/:id
- searchJobs() - GET /api/jobs/search?term=...
```

### 4. Complete Matching Module (1-2 hours)

**Files to create:**

- `src/modules/matching/matching.controller.ts`
- `src/modules/matching/matching.routes.ts`

**Tasks:**

```typescript
// matching.controller.ts should implement:
- triggerMatching() - POST /api/matching/job/:jobId
  - Call MatchingService.matchCandidatesToJob()
  - Kick off async matching process
  - Return status

- getMatchingResults() - GET /api/matching/job/:jobId/results
  - Paginate results
  - Include score breakdown
  - Sort by score descending

- getTopCandidates() - GET /api/matching/job/:jobId/top?n=10
  - Get top N candidates
```

### 5. Create Interviews Module (1-2 hours)

**Files to create:**

- `src/modules/interviews/interview.controller.ts`
- `src/modules/interviews/interview.service.ts`
- `src/modules/interviews/interview.routes.ts`
- `src/modules/interviews/interview.validation.ts`

**Tasks:**

```typescript
// interview.service.ts should implement:
- scheduleInterview()
- getInterviewById()
- listInterviews()
- updateInterview()
- cancelInterview()
- rescheduleInterview()
- addFeedback()

// interview.controller.ts should expose:
- POST /api/interviews
- GET /api/interviews/:id
- GET /api/interviews/candidate/:candidateId
- GET /api/interviews/job/:jobId
- PUT /api/interviews/:id
- PUT /api/interviews/:id/reschedule
- POST /api/interviews/:id/feedback
```

### 6. Create Offers Module (1 hour)

**Files to create:**

- `src/modules/offers/offer.controller.ts`
- `src/modules/offers/offer.service.ts`
- `src/modules/offers/offer.routes.ts`

**Tasks:**

```typescript
// offer.service.ts should implement:
- createOffer()
- getOfferById()
- listOffers()
- updateOfferStatus()
- acceptOffer()
- declineOffer()

// offer.controller.ts should expose:
- POST /api/offers
- GET /api/offers/:id
- GET /api/offers/candidate/:candidateId
- PUT /api/offers/:id/status
- POST /api/offers/:id/accept
- POST /api/offers/:id/decline
```

### 7. Create Candidate Portal Module (2-3 hours)

**Files to create:**

- `src/modules/candidatePortal/portal.controller.ts`
- `src/modules/candidatePortal/portal.service.ts`
- `src/modules/candidatePortal/portal.routes.ts`
- `src/modules/candidatePortal/portal.validation.ts`

**Tasks:**

```typescript
// portal.service.ts should implement:
-createPortalCredentials() - // When candidate is selected
  portalLogin() - // Custom auth for candidates
  getPortalProfile() -
  getApplicationStatus() -
  getScheduledInterviews() -
  getOfferDetails() -
  resetPortalPassword() -
  // portal.controller.ts should expose:
  POST / api / portal / login -
  GET / api / portal / profile -
  GET / api / portal / status -
  GET / api / portal / interviews -
  GET / api / portal / offer -
  POST / api / portal / reset -
  password -
  GET / api / portal / onboarding -
  tasks;
```

### 8. Create Notification & Email Module (1-2 hours)

**Files to create:**

- `src/modules/emails/email.controller.ts`
- `src/modules/emails/email.service.ts`
- `src/modules/emails/email.routes.ts`
- `src/modules/notifications/notification.model.ts`
- `src/modules/notifications/notification.service.ts`

**Tasks:**

```typescript
// email.service.ts should implement:
-sendShortlistNotification() -
  sendRejectionEmail() -
  sendInterviewScheduledEmail() -
  sendOfferEmail() -
  sendPortalCredentials() -
  // notification.service.ts should implement:
  createNotification() -
  getNotifications() -
  markAsRead() -
  deleteNotification() -
  // email.controller.ts should expose (admin only):
  POST / api / emails / send -
  test -
  GET / api / emails / templates;
```

### 9. Create Analytics Module (1 hour)

**Files to create:**

- `src/modules/analytics/analytics.controller.ts`
- `src/modules/analytics/analytics.service.ts`
- `src/modules/analytics/analytics.routes.ts`

**Tasks:**

```typescript
// analytics.service.ts should implement:
-getDashboardStats() -
  getJobStats() -
  getCandidateStats() -
  getConversionFunnelStats() -
  getSourceStats() -
  // analytics.controller.ts should expose:
  GET / api / analytics / dashboard -
  GET / api / analytics / jobs -
  GET / api / analytics / candidates -
  GET / api / analytics / funnel -
  GET / api / analytics / sources;
```

### 10. Create Routes Index (30 minutes)

**File to create:**

- `src/routes/index.ts`

**Tasks:**

```typescript
// src/routes/index.ts should:
- Import all route files
- Register routes at appropriate paths
- Example structure:
  router.use('/api/auth', authRoutes);
  router.use('/api/candidates', candidateRoutes);
  router.use('/api/resumes', resumeRoutes);
  router.use('/api/jobs', jobRoutes);
  router.use('/api/matching', matchingRoutes);
  router.use('/api/interviews', interviewRoutes);
  router.use('/api/offers', offerRoutes);
  router.use('/api/portal', portalRoutes);
  router.use('/api/emails', emailRoutes);
  router.use('/api/analytics', analyticsRoutes);
```

### 11. Integrate Routes into App (15 minutes)

**In src/app.ts:**

```typescript
// After middleware setup, add:
import routes from "@routes/index";
app.use(routes);
```

## 🎯 Implementation Order (Recommended)

1. **Phase 1** (Complete the fundamentals):
   - Complete Candidate, Resume, and Job modules
   - Create Routes index
   - Integrate into app.ts

2. **Phase 2** (Add interactivity):
   - Complete Matching module
   - Create Interviews module
   - Create Offers module

3. **Phase 3** (Enable portal access):
   - Create Candidate Portal module
   - Create Notification module
   - Add email triggers on status changes

4. **Phase 4** (Advanced features):
   - Create Analytics module
   - Add Gmail intake
   - Add batch operations

## 🛠️ Coding Patterns to Follow

### 1. Controllers Pattern

```typescript
export class MyController {
  async myAction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Your logic
      res.json(ResponseBuilder.success(data, "Success message"));
    } catch (error) {
      next(error);
    }
  }
}
```

### 2. Service Pattern

```typescript
export class MyService {
  async myMethod(params): Promise<Result> {
    try {
      logger.info("Starting operation...");
      // Your logic
      logger.info("Operation completed");
      return result;
    } catch (error) {
      logger.error("Operation failed", error);
      throw error;
    }
  }
}
```

### 3. Validation Pattern

```typescript
import { z } from "zod";

export const mySchema = z.object({
  field1: z.string().min(3),
  field2: z.number().positive(),
});

// In routes:
router.post("/endpoint", validateRequest(mySchema), controller.method);
```

### 4. Routes Pattern

```typescript
const router = Router();

router.get(
  "/",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  controller.list.bind(controller),
);

router.post(
  "/",
  authMiddleware,
  validateRequest(schema),
  controller.create.bind(controller),
);

export default router;
```

## 📊 Testing Workflow

### 1. Authentication

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Pass123","role":"recruiter"}'

# Login - save the accessToken
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Pass123"}'

# Use token in header for next requests
# Authorization: Bearer <YOUR_TOKEN>
```

### 2. Create a Job

```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Senior Dev",
    "description":"...",
    "requiredSkills":["Node.js","React"],
    "minimumExperience":3,
    "status":"open"
  }'
```

### 3. Upload Resume

```bash
# This will create a candidate and embed in Pinecone
curl -X POST http://localhost:5000/api/resumes/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@resume.pdf"
```

### 4. Start Matching

```bash
curl -X POST http://localhost:5000/api/matching/job/<JOB_ID> \
  -H "Authorization: Bearer <TOKEN>"

# Get results
curl -X GET http://localhost:5000/api/matching/job/<JOB_ID>/results \
  -H "Authorization: Bearer <TOKEN>"
```

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] MongoDB Atlas connection tested
- [ ] Gemini API quota verified
- [ ] Pinecone index created and accessible
- [ ] Cloudinary account setup complete
- [ ] Gmail API credentials obtained
- [ ] SMTP configuration tested
- [ ] All routes implemented and tested
- [ ] Rate limiting configured appropriately
- [ ] CORS origins updated for production
- [ ] Error logging configured
- [ ] Security headers reviewed (Helmet)
- [ ] JWT secrets are strong and unique
- [ ] Database backup strategy in place
- [ ] Load testing completed
- [ ] API documentation finalized

## 📚 Additional Resources

- API Response Examples
- Database Index Optimization
- Performance Tuning Guide
- Scaling Considerations
- Disaster Recovery Plan

## 🆘 Troubleshooting Common Issues

### Issue: "Gemini API rate limit exceeded"

**Solution**: Implement request queuing and retry logic with exponential backoff

### Issue: "Pinecone dimension mismatch"

**Solution**: Ensure all embeddings are 768 dimensions; verify embedding service

### Issue: "Candidate portal login fails"

**Solution**: Verify CandidatePortalCredentials record exists; check bcrypt hashing

### Issue: "Email not sending"

**Solution**: Check SMTP credentials; verify Gmail app password; check CORS for email links

---

**Estimated Total Time to Complete**: 12-15 hours of development
