# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

🚜 FarmTech Management System (Frontend)
A modern, high-performance agricultural management interface built with React 19 and Vite. This application serves four distinct user tiers, providing real-time data visualization and field coordination tools.Shutterstock Explore

✨ Features
Multi-Role Dashboards: Custom interfaces for Admin, Institution, Correspondent, and Farmhand.
RBAC Security: Protected routes and automated role-based redirection.
Tailwind UI: Fully responsive, accessible, and high-contrast designs using Tailwind CSS.
Dynamic Icons: Context-aware iconography powered by lucide-react.
Stateful Auth: Persistence of JWT tokens and user roles via localStorage.
🛠️ Tech StackBuild Tool: Vite (with HMR)Library: React 19Styling: Tailwind CSSRouting: React Router 7Icons: Lucide ReactHTTP Client: Axios

🚦 Getting Started1. 
InstallationClone the project and install dependencies:Bash npm install
2. Environment SetupCreate a .env file in the root:Code snippet; VITE_API_URL=http://127.0.0.1:8000/api/v1
3. Development ModeRun the app with Hot Module Replacement (HMR):Bashnpm run dev
4. Production BuildOptimize the application for deployment:Bashnpm run build

🗺️ Project StructurePlaintextsrc/
├── Components/         # Reusable UI (Navbar, ProtectedRoute)
├── Pages/              # Dashboard Views
│   ├── AdminDash.jsx
│   ├── FarmhandDash.jsx
│   ├── FarminstitutDash.jsx
│   └── ...
├── App.jsx             # Main Router & Role logic
└── main.jsx            # Entry point
🔐 Dashboard Access MatrixRoleDashboard PathPrimary FocusAdmin/dashboard/adminSystem Health & User ControlInstitution/dashboard/farminstitutionStrategic Yields & ROICorrespondent/dashboard/farmcorrespondentTeam Sync & VerificationFarmhand/dashboard/farmhandTasks & Direct Data Entry🧪 Linting & QualityThe project uses ESLint with specific rules for React hooks and Oxc-based transformation for lightning-fast builds. To check for linting errors:Bashnpm run lint
Summary of Recent Fixes (Internal Note)Pathing: Updated farminstitution route to match login redirect.Security: Implemented ProtectedRoute with .toLowerCase() role sanitization.UI: Standardized dashboard layouts using the 12-column grid system.
