# CIMS Admin Panel

The administrative interface for the Community Issue Management System.

## 🌟 Features

- **Real-time Issue Monitoring**
  - Live updates via WebSocket
  - Status progression tracking
  - Issue verification system
  - Advanced filtering and search

- **Issue Management**
  - Detailed issue view with images
  - Status updates with notifications
  - Location tracking on map
  - Update history logging

- **User Management**
  - User activity tracking
  - Report statistics
  - Account status management

- **Analytics Dashboard**
  - Issue resolution metrics
  - Response time tracking
  - Category-wise distribution
  - Priority analysis

## 🛠️ Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 🔐 Authentication

- JWT-based authentication
- Role-based access control
- Secure session management

## 📡 Real-time Features

- Socket.IO integration
- Live issue updates
- Instant notifications
- Status change broadcasts

## 🎨 UI Features

- Material-UI components
- Dark/Light theme support
- Responsive design
- Custom Gilroy font integration
- Interactive data visualization

## 🔄 Status Flow

1. Pending Verification
2. Verified/Rejected
3. In Progress
4. Resolved

## 🧪 Testing

```bash
npm run test
```

## 📦 Build

```bash
npm run build
npm run preview
```

## 🌐 API Integration

- RESTful API consumption
- Socket.IO events
- Cloudinary image handling
- Secure token management
