
---

# **AI Personal Trainer & Fitness Tracker** 🏋️‍♂️🤖

A cross-platform fitness platform built to democratize personal training through real-time, hyper-personalized coaching powered by **Google Gemini**.

This application combines intelligent workout generation, adaptive nutrition guidance, and real-time progress tracking—all wrapped in a seamless web and iOS experience.

---

## 🚀 **Features**

### **🧠 AI-Powered Coaching**

Harnesses Gemini’s LLM to act as an interactive personal trainer—adjusting workouts and nutrition advice based on user metrics, injuries, preferences, and performance.

### **💪 Dynamic Workout Plans**

Generates tailored routines instantly based on:

* Available equipment
* Time constraints
* Muscle group selection
* Safety considerations (e.g., injuries)

### **🥗 Smart Nutrition Tracking**

Recommends meals and provides macro breakdowns aligned with user goals (fat loss, muscle gain, recomposition).

### **🌐 Cross-Platform Experience**

* **Web Dashboard:** React + TypeScript + ChakraUI interface featuring analytics, charts, and plan customization.
* **iOS App:** Swift + SwiftUI companion app optimized for quick logging and real-time coaching.

### **📊 Real-Time Analytics**

Visualizes progress for:

* Weight
* Reps & volume
* Workout frequency & consistency
* Estimated calories and macros

---

## 🛠️ **Tech Stack**

| Component            | Technology                                           |
| -------------------- | ---------------------------------------------------- |
| **Web Frontend**     | React, TypeScript, ChakraUI                          |
| **iOS Mobile App**   | Swift, SwiftUI                                       |
| **AI Layer**         | Google Gemini API                                    |
| **Backend / API**    | Node.js (middleware, validation, secure API routing) |
| **State Management** | React Query / SwiftData                              |

---

## 🧩 **How AI Integration Works**

1. **User Input:**
   The user provides structured or natural-language stats (e.g., `"Male, 190 lbs, goal: lose 10 lbs, knee pain"`).

2. **Context Construction:**
   The app builds a context-rich prompt using user history, preferences, and constraints.

3. **LLM Output:**
   Gemini returns a structured JSON payload including:

   * Specific exercises
   * Sets, reps, rest
   * Form cues
   * Safety modifications
   * Daily/weekly nutrition guidance

4. **Rendering:**
   The UI transforms this JSON into interactive checklists, progress charts, and daily plans.

---

## 📂 **Project Structure**

```
├── web-client              # React + TypeScript web application
│   ├── /src
│   │   ├── /components     # ChakraUI components
│   │   └── /api            # Gemini integration & request logic
│   └── package.json
│
├── ios-app                 # Native iOS app
│   ├── /Views              # SwiftUI screens
│   └── /Models             # Workout & nutrition data models
│
└── README.md
```

---

## 🏁 **Getting Started**

### **Prerequisites**

* Node.js (v18+)
* Xcode (latest)
* Google Gemini API Key

---

### **🔧 Web Client Setup**

```bash
cd web-client
npm install
```

Create a `.env` file:

```
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

Run development server:

```bash
npm run start
```

---

### **📱 iOS App Setup**

1. Open `ios-app/FitnessTracker.xcodeproj` in Xcode.
2. Add your Gemini API credentials to `Config.swift`.
3. Build and run on a simulator or physical device.

---

## 🤝 **Contributing**

Contributions are welcome!
To propose changes:

1. Fork the repository.
2. Create a new branch:
   `git checkout -b feature/MyFeature`
3. Commit your changes:
   `git commit -m "Add MyFeature"`
4. Push your branch:
   `git push origin feature/MyFeature`
5. Open a Pull Request.

---

## 📬 **Contact**

**Aarush Pathuri**
GitHub | Email

---
