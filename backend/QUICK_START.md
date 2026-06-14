# ATS Backend - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
# Edit .env with your credentials (see README.md for detailed setup)
```

### 3. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### 4. Check Health

```bash
curl http://localhost:5000/health
```

You should see:

```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00Z",
    "environment": "development"
  }
}
```

## 🔑 Basic API Workflow

### Step 1: Register as Recruiter

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@company.com",
    "password": "SecurePass123",
    "role": "recruiter"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "63f5a7b9c1d2e3f4g5h6i7j8",
    "name": "John Smith",
    "email": "john@company.com",
    "role": "recruiter",
    "isActive": true,
    "emailVerified": false
  },
  "message": "User registered successfully"
}
```

### Step 2: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "SecurePass123"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

**Save the accessToken** - you'll need it for authenticated requests.

### Step 3: Create a Job

```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Full Stack Engineer",
    "description": "We are looking for an experienced full stack engineer...",
    "requiredSkills": ["Node.js", "React", "MongoDB"],
    "preferredSkills": ["AWS", "Docker"],
    "minimumExperience": 5,
    "educationRequirement": "bachelors",
    "location": "San Francisco, CA",
    "jobType": "full_time",
    "salary": {
      "min": 150000,
      "max": 200000,
      "currency": "USD"
    }
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "63f5a7b9c1d2e3f4g5h6i7j9",
    "title": "Senior Full Stack Engineer",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Job created successfully"
}
```

**Save the job \_id** for next step.

### Step 4: Upload Resume

```bash
curl -X POST http://localhost:5000/api/resumes/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/resume.pdf"
```

Response:

```json
{
  "success": true,
  "data": {
    "candidateId": "63f5a7b9c1d2e3f4g5h6i7k0",
    "fileName": "resume.pdf",
    "fileUrl": "https://res.cloudinary.com/...",
    "parsedData": {
      "name": "Jane Developer",
      "email": "jane@example.com",
      "skills": ["Node.js", "React", "MongoDB"],
      "experience": { "totalYears": 6 }
    },
    "aiSummary": "Jane is an experienced full-stack developer...",
    "pineconeId": "uuid-123..."
  },
  "message": "Resume processed successfully"
}
```

### Step 5: Start Matching

```bash
curl -X POST http://localhost:5000/api/matching/job/63f5a7b9c1d2e3f4g5h6i7j9 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "Matching started",
    "jobId": "63f5a7b9c1d2e3f4g5h6i7j9"
  }
}
```

### Step 6: Get Matching Results

```bash
curl -X GET "http://localhost:5000/api/matching/job/63f5a7b9c1d2e3f4g5h6i7j9/results?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "candidateId": "63f5a7b9c1d2e3f4g5h6i7k0",
        "candidateName": "Jane Developer",
        "candidateEmail": "jane@example.com",
        "finalScore": 87.5,
        "breakdown": {
          "semantic": 85,
          "skills": 90,
          "experience": 85,
          "projects": 75,
          "education": 95
        },
        "matchDetails": {
          "matchedSkills": ["Node.js", "React", "MongoDB"],
          "missingSkills": ["AWS"],
          "meetsExperienceRequirement": true,
          "meetsEducationRequirement": true
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20
    }
  }
}
```

## 🎯 Common Use Cases

### Use Case 1: Quick Candidate Creation

If you want to add a candidate manually without uploading a resume:

```bash
curl -X POST http://localhost:5000/api/candidates \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Engineer",
    "email": "alice@example.com",
    "phone": "+1-555-0100",
    "location": "New York, NY",
    "skills": ["Node.js", "Python", "AWS"],
    "experience": {"totalYears": 8},
    "education": {
      "collegeName": "Stanford",
      "course": "Computer Science",
      "passingYear": 2016
    }
  }'
```

### Use Case 2: Shortlist a Candidate

```bash
curl -X PUT http://localhost:5000/api/candidates/CANDIDATE_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shortlisted"
  }'
```

### Use Case 3: Reject a Candidate

```bash
curl -X PUT http://localhost:5000/api/candidates/CANDIDATE_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "rejectionReason": "Experience doesn't match requirements"
  }'
```

### Use Case 4: Rate a Candidate

```bash
curl -X POST http://localhost:5000/api/candidates/CANDIDATE_ID/rating \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "technicalSkills": 4,
    "communication": 5,
    "cultureFit": 4,
    "overall": 4
  }'
```

## 🐛 Error Handling

All errors follow the standard format:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Detail 1", "Detail 2"]
}
```

### Common Errors

| Status | Error                   | Solution                                           |
| ------ | ----------------------- | -------------------------------------------------- |
| 400    | Missing required fields | Check request body against schema                  |
| 401    | Unauthorized            | Include valid access token in Authorization header |
| 403    | Forbidden               | Check user role permissions                        |
| 404    | Resource not found      | Verify ID exists in database                       |
| 409    | Email already exists    | Use different email for new user                   |
| 500    | Internal server error   | Check server logs                                  |

## 🔄 Token Management

### Access Token Expires

Your access token expires after 7 days. Get a new one using refresh token:

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Change Password

```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "CurrentPassword123",
    "newPassword": "NewPassword123"
  }'
```

## 📱 Postman Collection

Import the provided `postman-collection.json` file for a complete API testing environment.

**Steps:**

1. Open Postman
2. Click "Import"
3. Select `backend/postman-collection.json`
4. Collection is imported with pre-configured variables
5. Update `BASE_URL` and tokens as needed

## 🧪 Integration Testing

### Batch Resume Upload

```bash
# Upload multiple resumes
for resume in resumes/*.pdf; do
  curl -X POST http://localhost:5000/api/resumes/upload \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
    -F "file=@$resume"
done
```

### Bulk Candidate Search

```bash
# Search for candidates with specific skills
curl -X GET "http://localhost:5000/api/candidates/search?term=React" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🆘 Troubleshooting

### "Invalid token" error

- Verify token hasn't expired
- Use refresh token to get new access token
- Check token in Authorization header format: `Bearer <token>`

### "No candidates found" in matching

- Ensure candidates are created with resume uploaded
- Check Pinecone index is properly configured
- Verify resume text was extracted correctly

### File upload fails

- Check file size (max 5MB)
- Verify file format (PDF or DOCX)
- Ensure Cloudinary credentials are correct

### Gemini API errors

- Check API key is valid
- Verify quota hasn't been exceeded
- Review request format

## 📚 Next Steps

1. **Read Full README**: `backend/README.md` for comprehensive documentation
2. **Review Implementation Guide**: `backend/IMPLEMENTATION_GUIDE.md` for detailed module info
3. **Explore API Collection**: Import and test all endpoints in Postman
4. **Setup Database**: Configure MongoDB Atlas
5. **Deploy**: Follow deployment checklist in README

## 📞 Support

For issues:

1. Check error messages carefully
2. Review logs in `logs/` directory
3. Consult README.md and IMPLEMENTATION_GUIDE.md
4. Check Postman collection examples

---

**Happy coding! 🚀**
