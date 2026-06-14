# ATS Backend - Complete Documentation

## 🎯 Project Overview

This is a production-ready backend for an AI-powered Applicant Tracking System (ATS) with:
- Resume parsing and AI-powered candidate profiling
- Semantic search using Pinecone
- Intelligent candidate-to-job matching
- Candidate portal with role-based access control
- Email integration and notifications
- RESTful API with comprehensive security

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas + Mongoose
- **Vector DB**: Pinecone (semantic search)
- **AI**: Google Gemini API
- **File Upload**: Cloudinary
- **Email**: SMTP + Nodemailer
- **Email Intake**: Gmail API
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting, bcrypt

### Folder Structure

```
src/
├── app.ts                      # Express app setup
├── server.ts                   # Server entry point
│
├── config/                     # Configuration files
│   ├── env.config.ts          # Environment validation
│   ├── database.config.ts      # MongoDB connection
│   ├── cloudinary.config.ts    # Cloudinary setup
│   ├── pinecone.config.ts      # Pinecone setup
│   ├── gemini.config.ts        # Gemini AI setup
│   └── gmail.config.ts         # Gmail API setup
│
├── common/                     # Shared utilities
│   ├── constants/              # App constants
│   ├── enums/                  # Enums (roles, statuses)
│   ├── errors/                 # Custom error classes
│   ├── logger/                 # Winston logger
│   └── responses/              # Response builders
│
├── middleware/                 # Express middleware
│   ├── auth.middleware.ts      # JWT authentication
│   ├── role.middleware.ts      # RBAC
│   ├── error.middleware.ts     # Error handling
│   ├── upload.middleware.ts    # File upload
│   └── validation.middleware.ts # Zod validation
│
├── database/                   # Database models
│   └── models/
│       ├── user.model.ts
│       ├── candidate.model.ts
│       ├── job.model.ts
│       ├── interview.model.ts
│       ├── offer.model.ts
│       ├── candidatePortalCredentials.model.ts
│       └── matchingResult.model.ts
│
├── services/                   # Business logic services
│   ├── gemini/                 # AI resume parsing
│   ├── pinecone/               # Vector search
│   ├── email/                  # Email sending
│   ├── embeddings/             # Embedding generation
│   ├── resumeParsing/          # Resume text extraction
│   └── scoring/                # Matching engines
│       ├── skillScore.engine.ts
│       ├── experienceScore.engine.ts
│       ├── educationScore.engine.ts
│       ├── projectScore.engine.ts
│       ├── semanticScore.engine.ts
│       └── finalScore.engine.ts
│
├── modules/                    # Feature modules
│   ├── auth/                   # Authentication
│   ├── candidates/             # Candidate management
│   ├── resumes/                # Resume processing
│   ├── jobs/                   # Job management
│   ├── matching/               # Candidate-job matching
│   ├── interviews/             # Interview scheduling
│   ├── candidatePortal/        # Candidate portal
│   ├── emails/                 # Email notifications
│   ├── analytics/              # Analytics
│   └── notifications/          # Notifications
│
└── utils/                      # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account
- Google Cloud account (Gemini API, Gmail API)
- Pinecone account
- Cloudinary account

### Environment Setup

1. **Clone and install dependencies**:
```bash
cd backend
npm install
```

2. **Create `.env` file** from `.env.example`:
```bash
cp .env.example .env
```

3. **Configure environment variables** (detailed instructions below)

### Environment Variables Setup

#### Database
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ats_db
```

#### JWT Configuration
```env
JWT_SECRET=your_very_secure_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d
```

#### Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Get your API key
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_NAME=gemini-1.5-flash
```

#### Pinecone Setup
1. Create account at [Pinecone](https://www.pinecone.io)
2. Create serverless index with dimension 768
```env
PINECONE_API_KEY=your_api_key
PINECONE_INDEX_NAME=ats-index
PINECONE_ENVIRONMENT=us-east-1-aws
```

#### Cloudinary Setup
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get credentials from dashboard
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Gmail API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth2 credentials (Desktop app)
3. Get refresh token using OAuth2 flow
```env
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
GMAIL_REDIRECT_URI=http://localhost:5000/api/auth/gmail/callback
GMAIL_USER_EMAIL=careers@company.com
```

#### SMTP Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password  # NOT your regular password
```

#### Frontend Configuration
```env
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

#### Matching Engine Weights
```env
SEMANTIC_WEIGHT=0.4      # Pinecone semantic match
SKILL_WEIGHT=0.3         # Skill match score
EXPERIENCE_WEIGHT=0.15   # Experience match
PROJECT_WEIGHT=0.1       # Project keywords match
EDUCATION_WEIGHT=0.05    # Education level match
```

### Running the Server

**Development mode with hot reload**:
```bash
npm run dev
```

**Production build**:
```bash
npm run build
npm start
```

**Check health**:
```bash
curl http://localhost:5000/health
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/profile` - Get user profile

### Candidates (Recruiter)
- `GET /api/candidates` - List candidates
- `GET /api/candidates/:id` - Get candidate details
- `POST /api/candidates` - Create candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate
- `PUT /api/candidates/:id/status` - Update candidate status

### Resumes
- `POST /api/resumes/upload` - Upload and parse resume
- `GET /api/resumes/:id` - Get resume info
- `POST /api/resumes/process` - Process uploaded resume

### Jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `PUT /api/jobs/:id/status` - Update job status

### Matching & Ranking
- `POST /api/matching/job/:jobId` - Start matching for job
- `GET /api/matching/job/:jobId/results` - Get matching results
- `GET /api/matching/job/:jobId/results?page=1&limit=20` - Paginated results

### Interviews
- `POST /api/interviews` - Schedule interview
- `GET /api/interviews/:id` - Get interview details
- `PUT /api/interviews/:id` - Update interview
- `GET /api/interviews/candidate/:candidateId` - Get candidate's interviews

### Offers
- `POST /api/offers` - Create offer
- `GET /api/offers/:id` - Get offer details
- `PUT /api/offers/:id/status` - Update offer status

### Candidate Portal
- `POST /api/portal/login` - Candidate portal login
- `GET /api/portal/profile` - Get candidate profile
- `GET /api/portal/status` - Get candidacy status
- `GET /api/portal/interviews` - Get scheduled interviews
- `GET /api/portal/offer` - Get offer details
- `POST /api/portal/reset-password` - Reset password

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/jobs` - Job statistics
- `GET /api/analytics/candidates` - Candidate statistics

## 🔐 Security

### Implemented Security Features
1. **JWT Authentication** - Access and refresh tokens
2. **Password Hashing** - bcrypt with 10 rounds
3. **RBAC** - Role-based access control (Admin, Recruiter, Candidate)
4. **Helmet** - HTTP headers security
5. **CORS** - Cross-origin resource sharing
6. **Rate Limiting** - Prevent brute force attacks
7. **Input Validation** - Zod schema validation
8. **Environment Variables** - No hardcoded secrets
9. **Error Handling** - No sensitive info in logs

### RBAC Permissions
| Permission | Admin | Recruiter | Candidate |
|-----------|-------|-----------|-----------|
| User Management | ✓ | ✗ | ✗ |
| Job CRUD | ✓ | ✓ | ✗ |
| Resume Upload | ✓ | ✓ | ✗ |
| Candidate Shortlist | ✓ | ✓ | ✗ |
| Interview Schedule | ✓ | ✓ | ✗ |
| Portal Access | ✗ | ✗ | ✓ (after selection) |
| Offer Accept/Decline | ✗ | ✗ | ✓ (after selection) |

## 📊 Candidate Matching Algorithm

The matching engine scores candidates using a weighted hybrid approach:

```
Final Score = (Semantic × 0.4) + (Skills × 0.3) + (Experience × 0.15) + (Projects × 0.1) + (Education × 0.05)
```

### Scoring Components

1. **Semantic Score (40%)** - Pinecone-based similarity
   - Compares resume text with job description
   - Uses cosine similarity (0-100)

2. **Skill Score (30%)** - Exact skill matching
   - Checks required skills match
   - Bonus for preferred skills
   - Scale: 0-100

3. **Experience Score (15%)** - Years of experience match
   - Full score if meets minimum requirement
   - Bonus if exceeds preferred years
   - Scale: 0-100

4. **Project Score (10%)** - Keyword/project match
   - Checks for project keywords in resume
   - Looks for project-related terms
   - Scale: 0-100

5. **Education Score (5%)** - Degree level match
   - Checks education hierarchy (High School < Bachelor's < Master's < PhD)
   - Scale: 0-100

## 🔄 Resume Processing Flow

1. **File Upload**
   - Candidate uploads PDF/DOCX resume
   - File validation and size check
   - Upload to Cloudinary

2. **Text Extraction**
   - PDF: pdf-parse library
   - DOCX: mammoth library
   - Clean and normalize text

3. **AI Parsing**
   - Send to Gemini API
   - Extract structured data:
     - Name, email, phone, location
     - Companies history
     - Education details
     - Skills array
   - Generate AI summary

4. **Embedding & Storage**
   - Generate text embedding
   - Store in Pinecone
   - Save metadata in MongoDB
   - Link resume URL from Cloudinary

5. **Candidate Creation**
   - Create/update candidate record
   - Set initial status: APPLIED
   - Store parsed fields

## 📧 Email Notifications

### Automated Emails
- **Shortlist Notification** - When candidate is shortlisted
- **Rejection Email** - When candidate is rejected
- **Interview Scheduled** - Interview confirmation
- **Offer Letter** - Offer details and acceptance link
- **Portal Credentials** - Login details for candidate
- **Password Reset** - Reset link for portal

## 🧪 Testing the API

### Using cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Recruiter",
    "email": "recruiter@company.com",
    "password": "SecurePass123",
    "role": "recruiter"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@company.com",
    "password": "SecurePass123"
  }'

# Get Profile (with token)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman
See `postman-collection.json` for complete collection

## 🚨 Error Handling

All errors follow standardized format:
```json
{
  "success": false,
  "error": "Error message",
  "details": ["Detailed error 1", "Detailed error 2"]
}
```

### Common HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 📝 Implementation Roadmap

### Phase 1: Core (✓ Complete)
- [x] User authentication & RBAC
- [x] Database models
- [x] JWT token management
- [x] Error handling
- [x] Config management

### Phase 2: Resume Processing (Implement Next)
- [ ] Resume upload endpoint
- [ ] File parsing logic
- [ ] Gemini integration
- [ ] Cloudinary upload
- [ ] Candidate creation

### Phase 3: Job & Matching (Implement Next)
- [ ] Job CRUD operations
- [ ] Gemini job parsing
- [ ] Pinecone embedding
- [ ] Matching algorithm
- [ ] Score calculation

### Phase 4: Candidate Actions (Implement Next)
- [ ] Shortlist/Reject endpoints
- [ ] Status update logic
- [ ] Email notifications
- [ ] Interview scheduling

### Phase 5: Candidate Portal (Implement Next)
- [ ] Portal authentication
- [ ] Portal credential creation
- [ ] Status view
- [ ] Interview details view
- [ ] Offer acceptance

### Phase 6: Advanced Features (Implement Later)
- [ ] Gmail email intake
- [ ] Analytics dashboard
- [ ] Bulk operations
- [ ] Advanced filtering
- [ ] Export to CSV

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Check connection string format
- Verify IP whitelist in MongoDB Atlas
- Ensure username/password don't have special chars

### Gemini API Errors
- Verify API key is valid
- Check quota limits
- Review request payload format

### Pinecone Errors
- Verify index dimension (should be 768)
- Check API key permissions
- Ensure index exists

### Email Send Failures
- Check SMTP credentials
- Verify Gmail app password (not regular password)
- Enable "Less secure app access" if using Gmail

### File Upload Issues
- Check file size limits (5MB default)
- Verify supported formats (PDF, DOCX)
- Check Cloudinary API credentials

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Google Generative AI](https://ai.google.dev/)
- [JWT.io](https://jwt.io/)

## 📄 License

MIT License

## 👥 Support

For issues and questions, contact the development team.
