# Vesuvius - Workforce Management System

![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)

## 🚀 Overview

Vesuvius is a comprehensive workforce management system designed to streamline reporting, task management, and team coordination. Built with Next.js 15 and React 19, it provides a robust platform for managing workforce activities, generating reports, and facilitating communication between different organizational levels.

### 🎯 Key Features

- **Multi-Role Authentication System**: Secure login for Superadmins, Managers, and Workforce members
- **Real-time Report Management**: Submit, review, and approve work reports with status tracking
- **AI-Powered Report Enhancement**: Automatic report elaboration using Cohere AI
- **Weekly Report System**: Automated reminders and PDF uploads for weekly summaries
- **Interactive Dashboards**: Role-specific dashboards with data visualization (charts, graphs)
- **Notification System**: Real-time notifications for pending tasks and reports
- **Client Management**: Assign and manage multiple clients per manager
- **Workforce Limits**: Control the number of workforce members per manager
- **Image Upload & Cropping**: Built-in image management for reports

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Database Setup](#-database-setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [User Roles & Permissions](#-user-roles--permissions)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Features in Detail](#-features-in-detail)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.4.6 (App Router)
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4.0
- **State Management**: React Hooks
- **Charts**: Recharts 3.1.2
- **Icons**: Lucide React, Phosphor React
- **Image Cropping**: React Easy Crop
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js (ESM modules)
- **API Routes**: Next.js API Routes
- **Database**: MySQL 8.0
- **Authentication**: JWT (Jose/jsonwebtoken)
- **Password Hashing**: bcrypt
- **Email Service**: Nodemailer
- **AI Integration**: Cohere AI
- **Scheduling**: Node-cron
- **File Uploads**: Multer + Cloudinary

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Hot Reload**: Next.js Fast Refresh with Turbopack

## 📚 Prerequisites

- Node.js 20.0.0 or higher
- MySQL 8.0 or higher
- npm or yarn package manager
- Cloudinary account (for image uploads)
- Cohere AI API key (for report elaboration)
- SMTP server access (for email notifications)

## 💻 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/vesuvius.git
cd vesuvius
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Configure your `.env` file** (see [Environment Variables](#-environment-variables))

## 🗄️ Database Setup

1. **Create MySQL database**
```sql
CREATE DATABASE vesuvius_db;
USE vesuvius_db;
```

2. **Create required tables**
```sql
-- Users table (for all roles)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'manager', 'workforce') NOT NULL,
  workforce_limit INT DEFAULT 0,
  manager_id INT,
  reset_token VARCHAR(255),
  reset_token_expiry DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Clients table
CREATE TABLE clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manager-Client mapping
CREATE TABLE manager_clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  manager_id INT NOT NULL,
  client_id INT NOT NULL,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_manager_client (manager_id, client_id)
);

-- Reports table
CREATE TABLE reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workforce_id INT NOT NULL,
  client_id INT NOT NULL,
  manager_id INT NOT NULL,
  project_name VARCHAR(255),
  work_title VARCHAR(255),
  start_time TIME,
  end_time TIME,
  short_text TEXT,
  elaborated_text TEXT,
  image_url VARCHAR(500),
  image_text VARCHAR(255),
  image_url2 VARCHAR(500),
  image_text2 VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected', 'edit_requested') DEFAULT 'pending',
  remarks TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workforce_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Weekly reports table (for managers)
CREATE TABLE weekly_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  manager_id INT NOT NULL,
  client_id INT NOT NULL,
  pdf_url VARCHAR(500),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Workforce weekly reports table
CREATE TABLE workforce_weekly_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workforce_id INT NOT NULL,
  client_id INT NOT NULL,
  pdf_url VARCHAR(500),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workforce_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  receiver_id INT NOT NULL,
  message TEXT NOT NULL,
  sent_via ENUM('system', 'dashboard', 'email') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

3. **Seed the superadmin account**
```bash
npm run superadminSeeder
```
Default credentials:
- Email: `superadmin@example.com`
- Password: `superadmin123`

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=vesuvius_db

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key

# Next.js Configuration
NEXT_PUBLIC_BASE_PATH=http://localhost:3000

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cohere AI Configuration (for report elaboration)
COHERE_API_KEY=your_cohere_api_key

# Email Configuration (SMTP)
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_email_password

# Optional: Production URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 👥 User Roles & Permissions

### 1. **Superadmin**
- Complete system access
- Manage all managers and workforce
- View all reports and statistics
- Add/edit/delete clients
- Monitor weekly report submissions
- System-wide notifications

### 2. **Manager**
- Manage assigned workforce members
- Review and approve/reject workforce reports
- Submit weekly reports for clients
- View team statistics and performance
- Receive notifications for pending tasks

### 3. **Workforce**
- Submit daily work reports
- Upload work-related images
- View personal report history
- Track report approval status
- Receive feedback on submissions

## 📁 Project Structure

```
vesuvius/
├── public/                 # Static assets
├── scripts/               
│   └── superadminSeeder.js # Database seeder
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API routes
│   │   │   ├── auth/     # Authentication endpoints
│   │   │   ├── manager/  # Manager-specific APIs
│   │   │   ├── superadmin/ # Admin APIs
│   │   │   └── workforce/ # Workforce APIs
│   │   ├── auth/         # Auth pages
│   │   ├── manager/      # Manager dashboard & pages
│   │   ├── superadmin/   # Admin dashboard & pages
│   │   ├── workforce/    # Workforce dashboard & pages
│   │   ├── login/        # User login page
│   │   └── page.js       # Home page
│   ├── components/       # React components
│   │   ├── ui/          # UI components
│   │   └── [Various].jsx # Feature components
│   ├── lib/             # Utilities
│   │   ├── db.js        # Database connection
│   │   ├── cohereai.js  # AI integration
│   │   └── utils.js     # Helper functions
│   └── utils/           # Additional utilities
│       └── scheduler.js  # Cron jobs
├── .env                 # Environment variables
├── next.config.mjs      # Next.js configuration
├── package.json         # Dependencies
└── tailwind.config.js   # Tailwind configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/user-login` - Manager/Workforce login
- `POST /api/auth/superadmin-login` - Superadmin login
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/getuserid` - Get current user ID

### Superadmin Routes
- `GET /api/superadmin/stats` - Dashboard statistics
- `GET /api/superadmin/reports` - View all reports
- `POST /api/superadmin/clients/add` - Add new client
- `GET /api/superadmin/clients/list` - List all clients
- `POST /api/superadmin/managers/add` - Add new manager
- `GET /api/superadmin/managers/list` - List all managers
- `PUT /api/superadmin/managers/update` - Update manager
- `DELETE /api/superadmin/managers/delete/[id]` - Delete manager
- `POST /api/superadmin/workforce/add` - Add workforce member
- `GET /api/superadmin/workforce/list` - List workforce
- `GET /api/superadmin/check-weekly-reports` - Check missing reports

### Manager Routes
- `GET /api/manager/reports` - Get team reports
- `GET /api/manager/reports/stats` - Get statistics
- `POST /api/manager/update-report-status` - Approve/reject reports
- `POST /api/manager/send-weekly-report` - Submit weekly report
- `GET /api/manager/notification` - Get notifications
- `POST /api/manager/mark-notifications-read` - Mark as read

### Workforce Routes
- `GET /api/workforce/reports` - Get own reports
- `POST /api/workforce/reports` - Submit new report
- `GET /api/workforce/reports/stats` - Get personal stats

### Utility Routes
- `POST /api/elaborate` - AI-powered text elaboration
- `POST /api/reports/update` - Update report details

## 🎨 Features in Detail

### 📊 Dashboard Analytics
Each role has a customized dashboard with:
- Real-time statistics cards
- Interactive bar and pie charts
- Report status distribution
- Performance metrics

### 📝 Report Management
- **Submission**: Workforce can submit detailed reports with images
- **AI Enhancement**: Reports are automatically elaborated using Cohere AI
- **Review Process**: Managers can approve/reject with remarks
- **Status Tracking**: Real-time status updates (pending/approved/rejected)

### 📅 Weekly Reporting
- Automated reminder system using node-cron
- PDF upload capability for comprehensive weekly summaries
- Client-specific report submission
- Notification system for missing reports

### 🔔 Notification System
- Real-time notifications for pending actions
- Email notifications for critical updates
- Dashboard alerts for new tasks
- Mark as read functionality

### 🖼️ Image Management
- Image upload with Cloudinary integration
- Built-in image cropper for optimal sizing
- Secure image storage
- Preview functionality

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Traditional Hosting
1. Build the project: `npm run build`
2. Upload the `.next` folder to your server
3. Set up PM2 or similar process manager
4. Configure Nginx/Apache reverse proxy

### Database Hosting
Consider using:
- PlanetScale
- Railway
- AWS RDS
- DigitalOcean Managed Databases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use ESLint configuration
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **JWT Token Issues**
   - Clear browser cookies
   - Check JWT_SECRET is set
   - Verify token expiration

3. **Image Upload Failures**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure proper CORS configuration

4. **Email Not Sending**
   - Verify SMTP credentials
   - Check firewall settings
   - Enable less secure apps (if using Gmail)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support, email support@vesuvius.com or join our Slack channel.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting solutions
- All contributors who helped shape this project

---

Made with ❤️ by the Vesuvius Team