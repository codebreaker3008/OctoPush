# AI Code Review Mentor

A full-stack application that provides intelligent, educational code reviews for developers. Users can submit code, receive automated analysis, and get learning recommendations. The project leverages **React** for the frontend, **Node.js + Express** for the backend, and **MongoDB** for data storage. It also includes optional **Maestro Distributed Computing** support for enhanced analysis.

---

## Features

- Multi-language code analysis: JavaScript, Python, Java, C++
- AI-driven code review with detailed issue explanations
- Learning paths and recommendations based on code quality
- Metrics: complexity, maintainability, technical debt, and overall score
- Mark issues as resolved directly from the frontend
- Maestro-powered distributed computing (optional)
- Real-time feedback on code submission

---

## Demo

<img width="1919" height="997" alt="Screenshot 2025-09-28 143217" src="https://github.com/user-attachments/assets/cce51e08-0eb2-412e-a5df-3231533d5dd2" />
<img width="1005" height="878" alt="Screenshot 2025-09-28 143244" src="https://github.com/user-attachments/assets/0b21117a-0000-4950-a697-56e3f7e7ee6f" />
<img width="960" height="450" alt="Screenshot 2025-09-28 143255" src="https://github.com/user-attachments/assets/db3b400d-5ceb-469f-b43b-a37e81fcc147" />
<img width="452" height="354" alt="Screenshot 2025-09-28 143314" src="https://github.com/user-attachments/assets/b67a14b7-e73e-44ca-9b48-e2390b0ac1b0" />
<img width="506" height="437" alt="Screenshot 2025-09-28 143319" src="https://github.com/user-attachments/assets/8a277d6f-63c9-4d98-8d80-0ee1c8807951" />
<img width="1916" height="1000" alt="Screenshot 2025-09-28 143205" src="https://github.com/user-attachments/assets/b90d163f-9b1c-46eb-b5c5-bec71acbbef7" />

---

## Project Structure

### Backend

- **Express server** with REST API endpoints
- MongoDB schemas:
  - `User.js`: User authentication and management
  - `CodeReview.js`: Code submission, analysis, and metrics

- API Endpoints:
  - `POST /review/analyze` – submit code for analysis
  - `GET /review/results/:reviewId` – poll for analysis results
  - `PUT /review/resolve-issue/:reviewId/:issueId` – mark an issue as resolved

### Frontend

- **React** with Tailwind CSS for styling
- Components:
  - `Review.js` – main interface for code submission and result display
  - Dynamic tabs: Issues, Learning Path, Metrics
  - Maestro-powered visual banner when distributed computing is used

---

## Installation

1. **Clone the repository**

git clone https://github.com/yourusername/ai-code-review-mentor.git
cd ai-code-review-mentor
Install dependencies


# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
Environment Variables

Create a .env file in the backend folder with the following:

env

MONGO_URI=your_mongodb_connection_string
PORT=5000
Note: If MAESTRO_DB_CONNECTION and MAESTRO_SERVICE_TOKEN are not set, the app will work locally using your MongoDB.

Run the app



# Backend
cd backend
npm run dev

# Frontend
cd ../frontend
npm start
Usage
Open the frontend at http://localhost:3000

Submit your code along with the project title and programming language

Wait for the analysis to complete

View issues, learning paths, and code metrics

Mark issues as resolved directly in the interface

If Maestro is active, a special banner will indicate distributed processing

Maestro Integration
The project supports optional Maestro-powered distributed computing. When enabled, you will see:

Maestro DB Connection available: true

Maestro Service Token available: true

Banner in the frontend: “⚡ Powered by Maestro Distributed Computing”

Debugging Maestro Integration

Add the following to your backend to check availability:

Tech Stack
Frontend: React.js, Tailwind CSS, Lucide Icons

Backend: Node.js, Express.js, Mongoose

Database: MongoDB (Atlas or Maestro DB)

Contribution
Fork the repo

Create a feature branch: git checkout -b feature-name

Commit your changes: git commit -m "Description"

Push to the branch: git push origin feature-name

Create a Pull Request

License
MIT License © 2025 Ayush Kumar

Acknowledgements
Inspired by modern AI-assisted code review tools

Maestro for distributed computing support

Tailwind CSS and Lucide Icons for UI components
