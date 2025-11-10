# 📱 English Center - Frontend Application

> **React-based frontend for the English Center Management System with Tailwind CSS, Vite, and comprehensive UI components.**

---

## 📖 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Core Features](#core-features)
- [Component Library](#component-library)
- [State Management](#state-management)
- [Routing](#routing)
- [Internationalization](#internationalization)
- [Styling](#styling)
- [Build & Deployment](#build--deployment)

---

## 🌟 Overview

The frontend application is built with **React 18** and **Vite** for blazing-fast development. It features a modular architecture with role-based views, reusable components, and a modern design system powered by **Tailwind CSS**.

### Key Features

- ⚡ **Lightning Fast**: Vite HMR (Hot Module Replacement)
- 🎨 **Modern UI**: Tailwind CSS + Radix UI components
- 📊 **Data Visualization**: Recharts & Chart.js integration
- 🌐 **Multilingual**: i18next for English & Vietnamese
- 🔐 **Secure**: JWT authentication with role-based routing
- 📱 **Responsive**: Mobile-first design approach
- ♿ **Accessible**: ARIA-compliant components

---

## 🛠️ Tech Stack

### Core Libraries

| Package       | Version | Purpose                 |
| ------------- | ------- | ----------------------- |
| **react**     | 18.2.0  | UI library              |
| **react-dom** | 18.2.0  | React DOM renderer      |
| **vite**      | 5.0.8   | Build tool & dev server |

### Routing & Navigation

| Package              | Version | Purpose             |
| -------------------- | ------- | ------------------- |
| **react-router-dom** | 6.20.0  | Client-side routing |

### Styling & UI

| Package                      | Version | Purpose                       |
| ---------------------------- | ------- | ----------------------------- |
| **tailwindcss**              | 3.3.6   | Utility-first CSS framework   |
| **postcss**                  | 8.4.32  | CSS processing                |
| **autoprefixer**             | 10.4.16 | CSS vendor prefixing          |
| **clsx**                     | 2.1.1   | Conditional className utility |
| **tailwind-merge**           | 3.3.1   | Merge Tailwind classes        |
| **class-variance-authority** | 0.7.1   | Component variants            |

### UI Components

| Package                           | Version | Purpose                   |
| --------------------------------- | ------- | ------------------------- |
| **@radix-ui/react-avatar**        | 1.0.4   | Avatar component          |
| **@radix-ui/react-dialog**        | 1.0.5   | Modal dialogs             |
| **@radix-ui/react-dropdown-menu** | 2.0.6   | Dropdown menus            |
| **@radix-ui/react-progress**      | 1.0.3   | Progress bars             |
| **@radix-ui/react-select**        | 2.0.0   | Select dropdowns          |
| **@radix-ui/react-slot**          | 1.0.2   | Component slots           |
| **@radix-ui/react-tabs**          | 1.0.4   | Tab components            |
| **lucide-react**                  | 0.294.0 | Icon library (800+ icons) |

### Charts & Data Visualization

| Package             | Version | Purpose                  |
| ------------------- | ------- | ------------------------ |
| **recharts**        | 2.15.4  | Primary charting library |
| **chart.js**        | 4.4.1   | Additional charting      |
| **react-chartjs-2** | 5.2.0   | Chart.js React wrapper   |
| **@nivo/bar**       | 0.87.0  | Bar charts               |
| **@nivo/core**      | 0.87.0  | Nivo core                |
| **@nivo/line**      | 0.87.0  | Line charts              |
| **@nivo/pie**       | 0.87.0  | Pie charts               |

### Data Tables

| Package                   | Version | Purpose                |
| ------------------------- | ------- | ---------------------- |
| **@tanstack/react-table** | 8.10.7  | Headless table library |
| **@mui/x-data-grid**      | 6.20.4  | Material-UI data grid  |

### HTTP & API

| Package   | Version | Purpose                   |
| --------- | ------- | ------------------------- |
| **axios** | 1.6.2   | HTTP client for API calls |

### Internationalization

| Package           | Version | Purpose                    |
| ----------------- | ------- | -------------------------- |
| **i18next**       | 23.16.8 | Core i18n framework        |
| **react-i18next** | 13.5.0  | React bindings for i18next |

### Date & Time

| Package                | Version | Purpose                |
| ---------------------- | ------- | ---------------------- |
| **date-fns**           | 3.0.0   | Modern date utilities  |
| **moment**             | 2.29.4  | Legacy date formatting |
| **react-big-calendar** | 1.8.5   | Calendar component     |

### Notifications

| Package             | Version | Purpose             |
| ------------------- | ------- | ------------------- |
| **react-hot-toast** | 2.4.1   | Toast notifications |

---

## 📁 Project Structure

```
client/
├── public/                         # Static assets
│   └── index.html
├── src/
│   ├── main.jsx                   # Application entry point
│   ├── App.jsx                    # Root component with routing
│   ├── index.css                  # Global Tailwind imports
│   ├── App.css                    # Additional global styles
│   │
│   ├── components/                # Reusable UI components
│   │   ├── common/               # Common components
│   │   │   ├── Badge.jsx         # Status badges (primary, success, warning, etc.)
│   │   │   ├── Button.jsx        # Button component with variants & sizes
│   │   │   ├── Card.jsx          # Unified card component (dual-mode support)
│   │   │   ├── Input.jsx         # Form input with label & validation
│   │   │   ├── Loading.jsx       # Loading spinner + Skeleton
│   │   │   ├── Modal.jsx         # Modal dialogs
│   │   │   ├── Table.jsx         # Data table component
│   │   │   ├── Progress.jsx      # Progress bar (Radix UI)
│   │   │   ├── Form.jsx          # Select, Textarea, Checkbox
│   │   │   ├── ChangePasswordDialog.jsx  # Password change modal
│   │   │   └── index.js          # Barrel exports
│   │   └── charts/               # Chart components
│   │       ├── BarChart.jsx      # Recharts bar chart
│   │       ├── LineChart.jsx     # Recharts line chart
│   │       ├── PieChart.jsx      # Recharts pie chart
│   │       ├── DoughnutChart.jsx # Chart.js doughnut chart
│   │       └── index.js
│   │
│   ├── contexts/                  # React Context providers
│   │   ├── AuthContext.jsx       # Authentication state & methods
│   │   ├── LanguageContext.jsx   # i18n language switching
│   │   └── ThemeContext.jsx      # Theme management (light/dark)
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.js            # Authentication hook
│   │   ├── useFetch.js           # Data fetching hook
│   │   ├── useDebounce.js        # Debounce input values
│   │   ├── useLocalStorage.js    # localStorage hook
│   │   ├── usePagination.js      # Pagination logic
│   │   ├── useTable.js           # Table state management
│   │   └── index.js
│   │
│   ├── layouts/                   # Page layouts
│   │   ├── MainLayout.jsx        # Main app layout (Sidebar + Topbar)
│   │   ├── AuthLayout.jsx        # Authentication pages layout
│   │   ├── Sidebar.jsx           # Generic sidebar component
│   │   ├── Topbar.jsx            # Top navigation bar
│   │   ├── DirectorSidebar.jsx   # Director role sidebar
│   │   ├── TeacherSidebar.jsx    # Teacher role sidebar
│   │   ├── StudentSidebar.jsx    # Student role sidebar
│   │   ├── EnrollmentSidebar.jsx # Enrollment staff sidebar
│   │   ├── AcademicStaffSidebar.jsx  # Academic staff sidebar
│   │   └── AccountantSidebar.jsx # Accountant sidebar
│   │
│   ├── pages/                     # Page components
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── RoleSelectionPage.jsx
│   │   │
│   │   ├── director/             # Director role pages
│   │   │   ├── DirectorDashboard.jsx
│   │   │   ├── DepartmentsPage.jsx
│   │   │   ├── ClassReportPage.jsx
│   │   │   └── ...
│   │   │
│   │   ├── teacher/              # Teacher role pages
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── TeacherClassesPage.jsx
│   │   │   ├── AttendancePage.jsx
│   │   │   ├── GradingPage.jsx
│   │   │   └── ...
│   │   │
│   │   ├── student/              # Student role pages (14 pages)
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── StudentListPage.jsx
│   │   │   ├── StudentDetailPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── GradesPage.jsx
│   │   │   ├── MyCoursesPage.jsx
│   │   │   ├── TuitionPage.jsx
│   │   │   ├── SchedulePage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── RequestListPage.jsx
│   │   │   ├── RequestFormPage.jsx
│   │   │   ├── StudentGradesPage.jsx
│   │   │   ├── StudentAttendancePage.jsx
│   │   │   ├── EnrollPage.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── staff/                # Staff role pages
│   │   │   ├── academic/         # Academic staff (8 pages)
│   │   │   │   ├── AcademicStaffDashboardPage.jsx
│   │   │   │   ├── ClassManagementPage.jsx
│   │   │   │   ├── AttendanceTrackingPage.jsx
│   │   │   │   ├── GradeManagementPage.jsx
│   │   │   │   ├── StudentProgressPage.jsx
│   │   │   │   ├── RequestHandlingPage.jsx
│   │   │   │   ├── ClassReportsPage.jsx
│   │   │   │   ├── AcademicStatisticsPage.jsx
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── accountant/       # Accountant (11 pages)
│   │   │   │   ├── AccountantDashboardPage.jsx
│   │   │   │   ├── TuitionManagementPage.jsx
│   │   │   │   ├── PaymentReceiptsPage.jsx
│   │   │   │   ├── CreateReceiptPage.jsx
│   │   │   │   ├── DebtTrackingPage.jsx
│   │   │   │   ├── RefundProcessingPage.jsx
│   │   │   │   ├── RevenueReportsPage.jsx
│   │   │   │   ├── ExportReportsPage.jsx
│   │   │   │   ├── AccountantSchedulePage.jsx
│   │   │   │   ├── AccountantNotificationsPage.jsx
│   │   │   │   ├── AccountantProfilePage.jsx
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── enrollment/       # Enrollment staff
│   │   │       ├── StudentManagementPage.jsx
│   │   │       ├── RequestManagementPage.jsx
│   │   │       ├── ClassTrackingPage.jsx
│   │   │       └── StatisticsPage.jsx
│   │   │
│   │   ├── classes/              # Class management
│   │   │   ├── ClassListPage.jsx
│   │   │   ├── ClassDetailPage.jsx
│   │   │   └── index.js
│   │   │
│   │   └── schedule/             # Schedule pages
│   │       └── index.js
│   │
│   ├── services/                  # API service layer
│   │   ├── api.js                # Axios instance with interceptors
│   │   └── index.js              # API endpoint definitions
│   │
│   ├── utils/                     # Utility functions
│   │   ├── date.js               # Date formatting & parsing
│   │   ├── helpers.js            # General helper functions
│   │   ├── validation.js         # Form validation rules
│   │   └── index.js
│   │
│   ├── i18n/                      # Internationalization
│   │   ├── config.js             # i18next configuration
│   │   ├── en.json               # English translations
│   │   └── vi.json               # Vietnamese translations
│   │
│   ├── config/                    # Configuration files
│   │   ├── routes.jsx            # Route definitions by role
│   │   └── menu.js               # Sidebar menu configuration
│   │
│   └── lib/
│       └── utils.js              # Tailwind CSS utility (cn function)
│
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── package.json                   # Dependencies & scripts
└── .env.example                   # Environment variables template
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env
VITE_API_URL=http://localhost:5000/api
```

### Development

```bash
# Start dev server with HMR
npm run dev

# Development server runs at: http://localhost:5173
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

---

## 🎯 Core Features

### 1. Role-Based Routing

Routes are dynamically generated based on user role:

```javascript
// config/routes.jsx
const roleRoutes = {
  director: [...],    // Director routes
  teacher: [...],     // Teacher routes
  student: [...],     // Student routes
  academic: [...],    // Academic staff routes
  accountant: [...],  // Accountant routes
  enrollment: [...]   // Enrollment staff routes
};
```

### 2. Authentication Flow

```
┌─────────────┐
│ LoginPage   │──► AuthContext.login()
└─────────────┘        │
                       ├─► axios.post('/auth/login')
                       │       │
                       │       ├─► Store JWT in localStorage
                       │       └─► Set Authorization header
                       │
                       └─► Navigate to role dashboard
```

### 3. Protected Routes

```javascript
// App.jsx
<Route element={<ProtectedRoute allowedRoles={["director"]} />}>
  <Route path="/director/dashboard" element={<DirectorDashboard />} />
</Route>
```

---

## 🧩 Component Library

### Common Components (`components/common/`)

#### **Card Component**

Unified card component supporting two patterns:

**Pattern 1: Shadcn/ui Style**

```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer content</CardFooter>
</Card>
```

**Pattern 2: Custom Props Style**

```jsx
<Card title="Title" header={<CustomHeader />} footer={<CustomFooter />}>
  Content here
</Card>
```

#### **Button Component**

```jsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Variants: primary, secondary, danger, success, outline, ghost
// Sizes: sm, md, lg
```

#### **Badge Component**

```jsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Inactive</Badge>

// Variants: primary, success, warning, danger, info, secondary
```

#### **Input Component**

```jsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

#### **Modal Component**

```jsx
<Modal isOpen={isOpen} onClose={handleClose} title="Modal Title">
  <p>Modal content</p>
</Modal>
```

#### **Loading Component**

```jsx
// Spinner
<Loading size="lg" />

// Skeleton
<Skeleton width="100%" height="20px" />
```

#### **Progress Component**

```jsx
<Progress value={75} max={100} className="w-full" />
```

### Chart Components (`components/charts/`)

#### **Bar Chart**

```jsx
<BarChart
  data={chartData}
  xKey="month"
  yKey="revenue"
  title="Monthly Revenue"
/>
```

#### **Line Chart**

```jsx
<LineChart
  data={chartData}
  xKey="date"
  yKey="students"
  title="Student Enrollment Trend"
/>
```

#### **Pie Chart**

```jsx
<PieChart data={pieData} nameKey="category" valueKey="count" />
```

---

## 🗂️ State Management

### React Context API

#### **AuthContext**

Manages authentication state and methods:

```javascript
const {
  user, // Current user object
  isAuthenticated, // Boolean authentication state
  login, // Login function
  logout, // Logout function
  updateUser, // Update user profile
} = useAuth();
```

**Usage:**

```jsx
import { useAuth } from "@contexts/AuthContext";

function MyComponent() {
  const { user, logout } = useAuth();

  return (
    <div>
      <p>Welcome, {user.fullName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### **LanguageContext**

Manages i18n language switching:

```javascript
const {
  language, // Current language ('en' | 'vi')
  changeLanguage, // Switch language function
  t, // Translation function
} = useLanguage();
```

**Usage:**

```jsx
import { useLanguage } from "@contexts/LanguageContext";

function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
      <option value="vi">Tiếng Việt</option>
      <option value="en">English</option>
    </select>
  );
}
```

#### **ThemeContext**

Manages theme state:

```javascript
const {
  theme, // Current theme ('light' | 'dark')
  toggleTheme, // Toggle theme function
} = useTheme();
```

---

## 🛣️ Routing

### Route Configuration

Routes are defined in `config/routes.jsx` by role:

```javascript
// Example: Academic Staff Routes
const academicRoutes = [
  {
    path: "/dashboard",
    element: <AcademicStaffDashboardPage />,
  },
  {
    path: "/academic/classes",
    element: <ClassManagementPage />,
  },
  {
    path: "/academic/attendance",
    element: <AttendanceTrackingPage />,
  },
  // ... more routes
];
```

### Route Protection

```javascript
// Protected route wrapper
<Route element={<ProtectedRoute allowedRoles={["academic"]} />}>
  {academicRoutes.map((route, index) => (
    <Route key={index} path={route.path} element={route.element} />
  ))}
</Route>
```

### Navigation

```javascript
import { useNavigate } from "react-router-dom";

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/dashboard");
  };
}
```

---

## 🌐 Internationalization

### i18next Configuration

```javascript
// i18n/config.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: require("./en.json") },
    vi: { translation: require("./vi.json") },
  },
  lng: "vi",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
```

### Translation Files

**English (`i18n/en.json`):**

```json
{
  "dashboard": "Dashboard",
  "students": "Students",
  "classes": "Classes",
  "login": "Login",
  "logout": "Logout"
}
```

**Vietnamese (`i18n/vi.json`):**

```json
{
  "dashboard": "Bảng điều khiển",
  "students": "Học viên",
  "classes": "Lớp học",
  "login": "Đăng nhập",
  "logout": "Đăng xuất"
}
```

### Using Translations

```jsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("dashboard")}</h1>
      <button>{t("logout")}</button>
    </div>
  );
}
```

---

## 🎨 Styling

### Tailwind CSS

#### Configuration (`tailwind.config.js`)

```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#6B7280",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};
```

#### Utility Function (`lib/utils.js`)

```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

**Usage:**

```jsx
<div
  className={cn(
    "base-class",
    isActive && "active-class",
    className // Merge external classes
  )}
/>
```

### Custom Styles

Global styles in `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600;
  }
}
```

---

## 📦 Build & Deployment

### Build Commands

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Build Output

Build artifacts are generated in the `dist/` folder:

```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── index.html
```

### Environment Variables

**Development (`.env.development`):**

```env
VITE_API_URL=http://localhost:5000/api
```

**Production (`.env.production`):**

```env
VITE_API_URL=https://api.your-domain.com/api
```

### Deployment Options

#### 1. Vercel

```bash
npm install -g vercel
vercel deploy
```

#### 2. Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### 3. Static Hosting (Nginx)

```nginx
server {
  listen 80;
  server_name your-domain.com;

  root /path/to/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## 🔧 Configuration

### Vite Path Aliases (`vite.config.js`)

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@lib": path.resolve(__dirname, "./src/lib"),
    },
  },
});
```

### ESLint Configuration

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    react: {
      version: "18.2",
    },
  },
};
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Recharts Documentation](https://recharts.org/)
- [i18next Documentation](https://www.i18next.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)

---

## 🤝 Contributing

Please follow the [main project contributing guidelines](../README.md#contributing).

---

<div align="center">

**Frontend for English Center Management System**

[⬆ Back to Top](#-english-center---frontend-application)

</div>
