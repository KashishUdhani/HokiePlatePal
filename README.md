HokiePlatePal 🍽️
Your AI-Powered Campus Nutrition Companion


# 🎯 Overview
HokiePlate is a personalized nutritionist and food tracker app designed specifically for college students' campus dining experience. The app creates customized meal plans based on real-time menus from nearby dining halls, integrating with VT's dining infrastructure to provide intelligent food recommendations.

# ✨ Key Features

🤖 AI-Powered Nutrition Chatbot: "PlatePal" provides instant meal suggestions based on your dietary needs
📱 Quick-Prompt Functionality: Perfect for students in a rush between classes
🕒 Real-Time Dining Hall Status: Live hours and walking distances to campus dining locations
📊 Comprehensive Food Tracking: Monitor nutrition across all campus dining options
🗺️ Integrated Campus Mapping: Seamless navigation to dining locations
🎯 Personalized Meal Plans: Custom recommendations based on calorie goals and dietary restrictions
📍 GPS Integration: Smart location-based dining suggestions

# 🏗️ Architecture
# Frontend

React Native - Cross-platform mobile application
JavaScript - Core application logic
HTML/CSS - User interface styling
Visual Studio Code - Development environment

# Backend

Python - Core backend logic
Flask API - RESTful endpoints for frontend communication
Web Scraper - Real-time VT dining hall data extraction
JSON Database - Structured nutrition and menu storage
Daily Scheduler - Automated data refresh system

# AI Integration

OpenAI API - Intelligent meal recommendation engine
Role-Based Prompting - PlatePal nutrition expert persona
Few-Shot Learning - Enhanced meal planning examples
Rule-Based Validation - Dietary restriction compliance checking

# 🚀 Getting Started
Prerequisites

Node.js (v14 or higher)
Python 3.8+
React Native development environment
OpenAI API key

# Installation

Clone the repository

bash   git clone https://github.com/KashishUdhani/HokiePlatePal.git
   cd HokiePlatePal

# Set up the backend

bash   Install Python dependencies
   pip install -r requirements.txt
   
   Set up environment variables
   cp .env.example .env
   Add your OpenAI API key to .env

# Set up the frontend

bash   cd frontend
   npm install

# Start the development servers
Backend:

bash   python app.py
Frontend:
bash   cd frontend
   npm start
Environment Variables
Create a .env file in the root directory:
envOPENAI_API_KEY=your_openai_api_key_here
FLASK_ENV=development
DATABASE_URL=your_database_url
📱 Usage

Launch the app and create your profile
Set dietary preferences and calorie goals
Ask PlatePal for meal recommendations:

"What's healthy at D2 for lunch?"
"I need a high-protein dinner under 600 calories"


View real-time dining hall info including hours and distances
Track your meals throughout the day
Navigate to dining locations using integrated mapping

🤝 Contributing
We welcome contributions! Please see our Contributing Guidelines for details.

Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request

📋 Project Structure
HokiePlatePal/
├── frontend/                 # React Native mobile app
│   ├── src/
│   ├── components/
│   └── package.json
├── backend/                  # Python Flask API
│   ├── app.py
│   ├── scraper/
│   └── requirements.txt
├── gps.py                   # GPS functionality
├── .env.example             # Environment variables template
├── .gitignore
└── README.md

# 🛣️ Roadmap
# What's Next for HokiePlate

🌍 Multi-University Expansion: Scale to serve students across different college campuses nationwide
🧭 Enhanced Mapping Integration: Implement turn-by-turn navigation directly within the app
🏫 Official University Partnerships: Secure authorization through VT for student credential login and dining plan integration
💰 Dining Dollar Management: Include balance tracking and end-of-semester donation options for unused funds
📈 Advanced Analytics Dashboard: Provide insights into eating patterns and nutritional trends
👥 Community Features: Enable students to share meal recommendations and dining hall reviews

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
👥 Team

Kashish Udhani - Project Lead
[Add other team members here]

# 🙏 Acknowledgments

Virginia Tech Dining Services for menu data
OpenAI for AI capabilities
React Native community for mobile development resources

📞 Support
If you have any questions or need help getting started:

📧 Email: [your-email@example.com]
🐛 Issues: GitHub Issues
💬 Discussions: GitHub Discussions


Made with ❤️ for Hokie students by Hokie students
