AI Personal Trainer & Fitness Tracker 🏋️‍♂️🤖

A cross-platform fitness application designed to democratize personal training. By integrating Google's Gemini LLM, this application generates real-time, hyper-personalized workout plans and nutrition advice tailored to specific user metrics and goals.

🚀 Features

AI-Powered Coaching: Utilizes the Gemini Large Language Model to act as an interactive personal trainer, adjusting advice based on user feedback and progress.

Dynamic Workout Plans: Generates routines instantly based on available equipment, time constraints, and muscle focus.

Smart Nutrition Tracking: Provides meal suggestions and macro breakdowns aligned with the user's weight loss goals.

Cross-Platform Experience: * Web Dashboard: Responsive interface built with React, TypeScript, and ChakraUI for detailed analytics.

iOS Companion App: Native performance optimized with Swift for on-the-go tracking.

Real-Time Analytics: Visualizes progress over time (weight, reps, consistency).

🛠️ Tech Stack

Component

Technology

Frontend (Web)

React, TypeScript, ChakraUI

Mobile (iOS)

Swift, SwiftUI

AI / ML

Google Gemini API (Generative AI)

Backend/API

Node.js (Middleware for API security)

State Management

React Query / SwiftData

🧠 AI Integration Logic

This project leverages prompt engineering to turn raw user data into actionable fitness advice.

User Input: User inputs stats (e.g., "Male, 190lbs, goal: lose 10lbs, knee injury").

Context Construction: The app constructs a context-rich prompt for the Gemini API.

Generative Output: Gemini returns a structured JSON response containing specific exercises, sets, reps, and safety tips tailored to the injury.

Rendering: The frontend parses this JSON to render interactive checklists and charts.

📂 Project Structure

├── /web-client          # TypeScript & React web application
│   ├── /src
│   │   ├── /components  # ChakraUI reusable components
│   │   └── /api         # Gemini API integration logic
│   └── package.json
│
├── /ios-app             # Native Swift iOS application
│   ├── /Views           # SwiftUI Views
│   └── /Models          # Data models for workouts
│
└── README.md


🏁 Getting Started

Prerequisites

Node.js (v18+)

Xcode (for iOS build)

Google Gemini API Key

Web Client Setup

Navigate to the web directory:

cd web-client


Install dependencies:

npm install


Create a .env file and add your API key:

REACT_APP_GEMINI_API_KEY=your_api_key_here


Start the development server:

npm run start


iOS App Setup

Open /ios-app/FitnessTracker.xcodeproj in Xcode.

Update the Config.swift file with your API credentials.

Build and run on a simulator or physical device.

Contributions are welcome! Please open an issue to discuss proposed changes or submit a Pull Request.

Fork the repository.

Create your feature branch (git checkout -b feature/AmazingFeature).

Commit your changes (git commit -m 'Add some AmazingFeature').

Push to the branch (git push origin feature/AmazingFeature).

Open a Pull Request.

📬 Contact

Aarush Pathuri GitHub | Email
