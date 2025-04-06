# Reparo - Community Issue Management System

<p align="center">
  <img src="./client/assets/icon2.png" width="100" alt="Reparo Logo"/>
</p>

Reparo is a comprehensive mobile and web application designed to help communities report and manage local infrastructure issues efficiently.

## 🌟 Features

### Mobile App

- **Issue Reporting**: Easy submission of community issues with photos and location
- **Real-time Updates**: Live status updates on reported issues
- **Interactive Maps**: View reported issues in your vicinity
- **Push Notifications**: Get instant updates on your reports
- **Profile Management**: Track your contributions and manage personal information
- **Dark/Light Theme**: Comfortable viewing in any lighting condition

### Admin Dashboard

- **Issue Management**: Verify, update, and track reported issues
- **User Management**: Monitor user activity and engagement
- **Analytics**: Track resolution times and community engagement
- **Real-time Updates**: Live issue tracking and status management

## 🛠️ Tech Stack

- **Mobile App**: React Native + Expo
- **Admin Dashboard**: React.js
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Storage**: Cloudinary
- **Authentication**: JWT

## 📱 Screenshots

will add when completed

## 🚀 Getting Started

### Prerequisites
- Node.js 14+
- MongoDB
- Expo CLI
- npm/yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/abhimanyutiwaribot/Reparo.git

```

2. **Set up environment variables**
```bash
# Server (.env)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client (.env)
API_URL=your_api_url
```

3. **Install dependencies**
```bash
# Server
cd server
npm install

# Client (Mobile App)
cd ../client
npm install

# Admin Dashboard
cd ../admin
npm install
```

4. **Run the application**
```bash
# Server
cd server
npm start

# Client (Mobile App)
cd client
expo start

# Admin Dashboard
cd admin
npm run dev
```

## 📝 Project Structure
```bash
reparo/
├── client/              # Mobile app (React Native)
├── admin/              # Admin dashboard (React)
├── server/             # Backend API (Node.js)
```

## 🤝 Contributing

**Fork the repository**

-- **Create your feature branch (git checkout -b feature/AmazingFeature)**

-- **Commit your changes (git commit -m 'Add some AmazingFeature')**

-- **Push to the branch (git push origin feature/AmazingFeature)**

-- **Open a Pull Request**

## 📄 License

**This project is licensed under the MIT License - see the LICENSE file for details.**

## 🙏 Acknowledgments

**All contributors who have helped this project evolve**
**Community members who provided valuable feedback**