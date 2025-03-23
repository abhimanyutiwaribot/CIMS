# CIMS - Community Issue Management System

CIMS is a comprehensive platform for community members to report and track civic issues in their area. The system consists of a mobile app for citizens and a web-based admin panel for authorities.

## 🌟 Features

### Mobile App
- User authentication and profile management
- Report issues with image uploads and location tracking
- Real-time issue status updates
- Push notifications for issue updates
- Interactive map view of reported issues
- Dark/Light theme support
- Smooth onboarding experience

### Admin Panel
- Secure admin authentication
- Real-time issue monitoring
- Issue verification and status management
- User management system
- Analytics dashboard
- Status progression control

## 🛠️ Technology Stack

### Mobile App (React Native + Expo)
- React Native & Expo SDK
- React Navigation
- Expo Location & Image Picker
- AsyncStorage for local storage
- Axios for API calls
- Socket.IO for real-time updates

### Admin Panel (React + Material-UI)
- React.js
- Material-UI components
- React Router
- Socket.IO Client
- Recharts for analytics

### Backend (Node.js)
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT Authentication
- Cloudinary for image storage
- Expo Server SDK for notifications

## 📱 Getting Started

### Prerequisites
- Node.js v16 or higher
- MongoDB
- Expo CLI
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Avanish08/Citizen-Issue-Management-system.git
cd cims-app
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install admin panel dependencies:
```bash
cd ../admin
npm install
```

4. Install mobile app dependencies:
```bash
cd ../client
npm install
```

5. Set up environment variables:
   - Create `.env` in server directory
   - Set up MongoDB connection string
   - Configure Cloudinary credentials
   - Set JWT secret

### Running the Application

1. Start the server:
```bash
cd server
node server.js
```

2. Start the admin panel:
```bash
cd admin
npm run dev
```

3. Start the mobile app:
```bash
cd client
expo start
```

## 📱 Mobile App Features
- Onboarding screens
- User authentication (Login/Signup)
- Issue reporting with image upload
- Location selection
- Real-time status updates
- Push notifications
- Profile management
- Theme customization

## 💻 Admin Panel Features
- Issue management
- User management
- Status updates
- Analytics dashboard
- Real-time notifications
- Issue verification system

## 🔒 Security Features
- JWT authentication
- Password hashing
- Protected routes
- Input validation
- File upload restrictions
- Rate limiting

## 📡 Real-time Features
- Live issue updates
- Socket connections
- Status changes
- New issue alerts

## 📝 License
MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📞 Support
For support, email support@cimsapp.com or join our Slack channel.

## 🙏 Acknowledgments
- Expo team for the amazing mobile development platform
- Material-UI team for the beautiful components
- MongoDB team for the reliable database
- All contributors and testers
