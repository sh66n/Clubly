# 🎯 Clubly

**Clubly** is a comprehensive event and club management platform designed for educational institutions. It streamlines event organization, member management, and engagement tracking with an intuitive interface and powerful features.

---

## ✨ Features

### 🎪 **Event Management**

- Create, schedule, and manage events effortlessly
- Support for both individual and team-based events
- Real-time attendance tracking and marking
- Event registration and participant management
- Download attendance reports
- Event insights and analytics
- Winner assignment and points distribution

### 🏆 **Clubs & Organizations**

- Dedicated dashboards for each club
- Core member and volunteer management
- Club-specific event creation and tracking
- Custom club profiles with logos and panorama images
- Role-based access control (Admin, Core Member, Volunteer, User)

### 👥 **Groups & Teams**

- Create and manage event teams/groups
- Join groups using unique codes
- Group member management
- Disband and edit group functionality
- Group-based event participation

### 📊 **Leaderboard & Points System**

- Gamified reward system for event participation
- College-wide and club-specific leaderboards
- Real-time point tracking
- Weekly event count analytics
- User ranking and achievements

### 💳 **Payment Integration**

- Razorpay payment gateway integration
- Secure event fee collection
- Payment verification and tracking

### 🔐 **Authentication & Security**

- Google OAuth integration with institutional email verification
- Domain-restricted authentication (pvppcoe.ac.in)
- Role-based authorization
- Protected routes with middleware

### 📧 **Communication**

- Automated email notifications
- Event reminders and updates
- Registration confirmations

---

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Chart.js** - Data visualization
- **Sonner** - Toast notifications

### **Backend**

- **Next.js API Routes** - Serverless backend
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **NextAuth.js v5** - Authentication solution

### **Third-Party Services**

- **Cloudinary** - Image and media management
- **Razorpay** - Payment processing
- **Nodemailer** - Email service

### **Development Tools**

- **ESLint** - Code linting
- **Turbopack** - Fast bundler
- **Zod** - Schema validation

---

## 📁 Project Structure

```
clubly/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/             # Authenticated application routes
│   │   │   ├── (dashboard)/   # Dashboard layouts
│   │   │   └── (main)/        # Main app pages
│   │   ├── (landing)/         # Public landing page
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── clubs/         # Club management
│   │   │   ├── events/        # Event operations
│   │   │   ├── leaderboard/   # Points and rankings
│   │   │   ├── razorpay/      # Payment processing
│   │   │   └── superevents/   # Special events
│   │   ├── login/             # Login page
│   │   └── forbidden/         # Access denied page
│   │
│   ├── components/            # React components
│   │   ├── Clubs/            # Club-related components
│   │   ├── Events/           # Event management UI
│   │   ├── Groups/           # Team/group components
│   │   ├── Landing/          # Landing page sections
│   │   ├── Leaderboard/      # Ranking displays
│   │   ├── Payment/          # Payment UI
│   │   └── SuperEvents/      # Special event components
│   │
│   ├── models/               # Mongoose schemas
│   │   ├── club.model.ts     # Club data model
│   │   ├── event.model.ts    # Event data model
│   │   ├── user.model.ts     # User data model
│   │   └── group.model.ts    # Group data model
│   │
│   ├── services/             # Business logic layer
│   │   ├── assignPoints.ts   # Points distribution
│   │   ├── getAttendance.ts  # Attendance tracking
│   │   ├── getLeaderboardRank.ts
│   │   ├── sendMail.ts       # Email service
│   │   └── ...
│   │
│   ├── lib/                  # Utilities and helpers
│   │   ├── cloudinary.ts     # Image upload config
│   │   ├── connectToDb.ts    # Database connection
│   │   └── utils.ts          # Helper functions
│   │
│   ├── auth.config.ts        # NextAuth configuration
│   ├── auth.ts               # Auth handlers
│   └── middleware.ts         # Route protection
│
├── public/                   # Static assets
│   ├── icons/
│   └── images/
│
└── Configuration files
    ├── next.config.ts
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── package.json
```

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun
- MongoDB database
- Google OAuth credentials
- Razorpay account (for payments)
- Cloudinary account (for image uploads)

### **Installation**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd clubly
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   AUTH_SECRET=your_nextauth_secret
   AUTH_GOOGLE_ID=your_google_oauth_client_id
   AUTH_GOOGLE_SECRET=your_google_oauth_client_secret

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Razorpay
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Email
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Building for Production

```bash
npm run build
npm start
```

The production build uses Turbopack for optimized performance.

---

## 📱 Key Pages & Routes

- `/` - Landing page with feature highlights
- `/login` - Authentication page (Google OAuth)
- `/dashboard` - Main dashboard (authenticated)
- `/clubs/[clubId]` - Individual club pages
- `/events` - Event listing and management
- `/leaderboard` - Points and rankings
- `/groups` - Team management

---

## 🔑 Key Features Explained

### **Role-Based Access Control**

- **User**: Can view events, register, join groups
- **Volunteer**: Club-specific event management permissions
- **Core Member**: Full club management capabilities
- **Admin**: Super admin with college-wide access

### **Event Workflow**

1. Club admin creates event
2. Users register individually or as groups
3. Event takes place
4. Attendance is marked
5. Winners are assigned points
6. Points reflect on leaderboard

### **Points System**

- Participation points for attending events
- Winner points for placing in competitions
- Automatic leaderboard updates
- Historical point tracking

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 👨‍💻 Authors

Developed for educational institutions to enhance student engagement and streamline event management.

---

## 🐛 Bug Reports & Feature Requests

Please open an issue on the repository with detailed information about bugs or feature requests.

---

## 📞 Support

For support and queries, please contact the development team or open an issue on the repository.

---

**Built with ❤️ using Next.js**
