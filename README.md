<h1 align="center">🤖 ATS Interview Platform</h1>

<p align="center">
  <b>AI-Powered Applicant Tracking System & Smart Interview Management Platform</b><br/>
  Built with Node.js · TypeScript · React · MongoDB · Gemini AI · Pinecone
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Gemini_AI-1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
  <img src="https://img.shields.io/badge/Pinecone-Vector_DB-00A3E0?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge"/>
</p>

---

## 📖 About The Project

**ATS Interview Platform** is a full-stack, AI-powered Applicant Tracking System that streamlines the entire hiring lifecycle — from job posting and resume parsing to candidate matching, interview scheduling, and automated email communication.

Built for modern HR teams and recruiters, this platform leverages **Google Gemini AI**, **Pinecone vector search**, and **semantic embeddings** to intelligently rank and match candidates based on job requirements.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Auth System** | JWT-based auth with access & refresh tokens |
| 📋 **Job Management** | Create and manage job postings with rich descriptions |
| 📄 **Resume Parsing** | AI-powered PDF/DOCX resume parsing (Gemini AI) |
| 🎯 **Smart Matching** | Semantic + skill-based candidate-job matching via Pinecone |
| 👥 **Candidate Portal** | Dedicated portal for candidates to apply and track status |
| 📅 **Interview Scheduling** | Schedule interviews with Google Calendar integration |
| 📧 **Email Automation** | Gmail API + SMTP for automated candidate communications |
| 🌐 **Web Applications** | Manage web-based job applications |
| 📊 **Analytics Dashboard** | Recruitment analytics and insights |
| 🔔 **Notifications** | Real-time in-app notification system |
| 🤖 **Ollama Integration** | Local LLM support via Ollama for offline AI tasks |
| ☁️ **Cloud Storage** | Cloudinary integration for resume & media storage |

---

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Vector DB:** Pinecone (semantic search)
- **AI Services:** Google Gemini 1.5 Flash, Ollama (local LLM)
- **Auth:** JWT (access + refresh tokens), bcryptjs
- **Email:** Nodemailer, Gmail API (OAuth2)
- **Calendar:** Google Calendar API
- **Storage:** Cloudinary
- **Validation:** Zod
- **Logging:** Winston
- **Security:** Helmet, express-rate-limit, CORS

### Frontend
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

---

## 📁 Project Structure

```
ATS_Plateform/
├── backend/                     # Node.js + Express API Server
│   ├── src/
│   │   ├── config/              # App configuration (DB, Gemini, Pinecone, etc.)
│   │   ├── common/              # Shared utilities (logger, error handler)
│   │   ├── database/            # MongoDB connection & seed scripts
│   │   ├── middleware/          # Auth, validation, rate-limiting middleware
│   │   ├── modules/             # Feature modules (REST API)
│   │   │   ├── auth/            # Authentication & authorization
│   │   │   ├── candidates/      # Candidate management
│   │   │   ├── jobs/            # Job postings
│   │   │   ├── resumes/         # Resume upload & parsing
│   │   │   ├── interviews/      # Interview scheduling
│   │   │   ├── matching/        # AI-based candidate-job matching
│   │   │   ├── emails/          # Email management
│   │   │   ├── analytics/       # Recruitment analytics
│   │   │   ├── notifications/   # Notification system
│   │   │   ├── candidatePortal/ # Candidate self-service portal
│   │   │   └── webApplications/ # Web application handling
│   │   ├── services/            # External service integrations
│   │   │   ├── gemini/          # Google Gemini AI service
│   │   │   ├── ollama/          # Ollama local LLM service
│   │   │   ├── pinecone/        # Pinecone vector DB service
│   │   │   ├── embeddings/      # Embedding generation
│   │   │   ├── resumeParsing/   # Resume parser
│   │   │   ├── scoring/         # Candidate scoring engine
│   │   │   ├── email/           # Email service (SMTP)
│   │   │   ├── gmail/           # Gmail OAuth2 service
│   │   │   └── googleCalendar/  # Google Calendar integration
│   │   ├── routes/              # API route definitions
│   │   ├── utils/               # Helper utilities
│   │   ├── app.ts               # Express app factory
│   │   └── server.ts            # Server entry point
│   ├── .env.example             # Environment variable template
│   ├── openapi.yaml             # OpenAPI/Swagger spec
│   ├── postman-collection.json  # Postman API collection
│   └── package.json
│
└── Client/                      # React + Vite Frontend
    ├── src/
    │   ├── api/                 # API service layer (Axios)
    │   ├── components/          # Reusable UI components
    │   ├── context/             # React context providers
    │   ├── hooks/               # Custom React hooks
    │   ├── pages/               # Route-level page components
    │   │   ├── auth/            # Login, Register pages
    │   │   ├── dashboard/       # Main dashboard
    │   │   ├── candidates/      # Candidate management UI
    │   │   ├── jobs/            # Job listing UI
    │   │   ├── resumes/         # Resume viewer
    │   │   ├── interviews/      # Interview management UI
    │   │   ├── matching/        # AI matching UI
    │   │   ├── emails/          # Email UI
    │   │   ├── analytics/       # Analytics charts
    │   │   ├── portal/          # Candidate portal
    │   │   └── webApplications/ # Web application management
    │   ├── routes/              # Route definitions
    │   ├── types/               # TypeScript type definitions
    │   └── utils/               # Frontend utilities
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** v20.x or higher → [Download](https://nodejs.org/)
- **npm** v9.x or higher (comes with Node.js)
- **Git** → [Download](https://git-scm.com/)
- **MongoDB Atlas** account → [Sign Up](https://www.mongodb.com/atlas)
- **Pinecone** account → [Sign Up](https://www.pinecone.io/)
- **Google Cloud** project with Gemini API & Gmail API enabled
- **Cloudinary** account → [Sign Up](https://cloudinary.com/)
- *(Optional)* **Ollama** for local LLM → [Download](https://ollama.com/)

---

### ⚡ Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/YashCube-x/ATS_Interview_Platefrom.git
cd ATS_Interview_Platefrom
```

---

#### 2. Setup the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy the environment template
copy .env.example .env   # Windows
# or
cp .env.example .env     # Mac/Linux
```

Now open the `.env` file and fill in your credentials (see [Environment Variables](#-environment-variables) section).

```bash
# Start the backend development server
npm run dev
```

The backend will start at: **http://localhost:5000**

---

#### 3. Setup the Frontend

Open a **new terminal window** and run:

```bash
# Navigate to the Client directory
cd Client

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will start at: **http://localhost:3000** (or the port shown in terminal)

---

#### 4. Seed the Database (Optional)

To populate the database with sample data:

```bash
# From the backend directory
npm run seed
```

---

### 🌍 Environment Variables

Create a `.env` file in the `backend/` directory using `backend/.env.example` as the template.

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default: 5000) | ✅ |
| `NODE_ENV` | Environment (`development`/`production`) | ✅ |
| `MONGODB_URI` | MongoDB connection string (Atlas URI) | ✅ |
| `JWT_SECRET` | Secret key for JWT access tokens | ✅ |
| `JWT_REFRESH_SECRET` | Secret key for JWT refresh tokens | ✅ |
| `JWT_EXPIRY` | JWT expiry (e.g., `7d`) | ✅ |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry (e.g., `30d`) | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `GEMINI_MODEL_NAME` | Gemini model (e.g., `gemini-1.5-flash`) | ✅ |
| `PINECONE_API_KEY` | Pinecone vector DB API key | ✅ |
| `PINECONE_INDEX_NAME` | Pinecone index name (e.g., `ats-index`) | ✅ |
| `PINECONE_ENVIRONMENT` | Pinecone environment region | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `GMAIL_CLIENT_ID` | Google OAuth2 Client ID | ✅ |
| `GMAIL_CLIENT_SECRET` | Google OAuth2 Client Secret | ✅ |
| `GMAIL_REFRESH_TOKEN` | Gmail OAuth2 refresh token | ✅ |
| `SMTP_HOST` | SMTP host (e.g., `smtp.gmail.com`) | ✅ |
| `SMTP_PORT` | SMTP port (e.g., `587`) | ✅ |
| `SMTP_USER` | SMTP email address | ✅ |
| `SMTP_PASS` | SMTP password or app password | ✅ |
| `FRONTEND_URL` | Frontend URL (e.g., `http://localhost:3000`) | ✅ |
| `CORS_ORIGIN` | Allowed CORS origin | ✅ |
| `SEMANTIC_WEIGHT` | Weight for semantic score in matching | ⚙️ Optional |
| `SKILL_WEIGHT` | Weight for skill score in matching | ⚙️ Optional |
| `EXPERIENCE_WEIGHT` | Weight for experience score | ⚙️ Optional |

> 💡 Refer to `backend/.env.example` for the full list with default values.

---

## 📡 API Documentation

- **OpenAPI Spec:** `backend/openapi.yaml`
- **Postman Collection:** `backend/postman-collection.json` — import directly into Postman
- **Health Check:** `GET http://localhost:5000/health`

---

## 🧠 AI Matching Engine

The matching engine scores candidates against job postings using a **weighted multi-factor scoring model**:

| Factor | Default Weight |
|---|---|
| 🔍 Semantic Similarity | 40% |
| 🛠️ Skill Match | 30% |
| 💼 Experience | 15% |
| 📂 Projects | 10% |
| 🎓 Education | 5% |

Semantic similarity is computed using **Gemini embeddings** stored in **Pinecone** (vector database), enabling fast and accurate semantic candidate search even at scale.

---

## 📧 Email Automation

The platform supports two email delivery methods:
- **Gmail OAuth2 API** — for sending from a Gmail account securely
- **SMTP (Nodemailer)** — as a fallback / alternative

Automated emails are sent for:
- Application received confirmation
- Interview invitations
- Status updates

---

## 📜 Available Scripts

### Backend (`/backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production build |
| `npm run seed` | Seed the database with sample data |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |

### Frontend (`/Client`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👨‍💻 Author

**YashCube-x**  
GitHub: [@YashCube-x](https://github.com/YashCube-x)

---

<p align="center">
  Made with ❤️ and AI — Powered by Gemini, Pinecone & MongoDB
</p>
