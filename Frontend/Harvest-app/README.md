# FarmTech Management System (Frontend)
A modern, high-performance agricultural management interface built with React 19 and Vite. This application serves four distinct user tiers, providing real-time data visualization and field coordination tools.Shutterstock Explore

## Features
Multi-Role Dashboards: Custom interfaces for Admin, Institution, Correspondent, and Farmhand.

RBAC Security: Protected routes and automated role-based redirection.

Tailwind UI: Fully responsive, accessible, and high-contrast designs using Tailwind CSS.

Dynamic Icons: Context-aware iconography powered by lucide-react.

Stateful Auth: Persistence of JWT tokens and user roles via localStorage.

### Tech StackBuild Tool: 

Vite (with HMR)Library: React 19Styling: Tailwind CSSRouting: React Router 7Icons: Lucide ReactHTTP Client: Axios

#### Getting Started1. 

**1 Installation** :Clone the project and install dependencies: 

>Bash: npm install

**2. Environment Setup** : Create a **.env** file in the root: Code snippet; VITE_API_URL=http://127.0.0.1:8000/api/v1

**3. Development Mode** : Run the app with Hot Module Replacement (HMR)
> Bash : npm run dev


##### 🗺️ Project StructurePlaintextsrc/

```folder order

├── Components/         # Reusable UI (Navbar, ProtectedRoute)

├── Pages/              # Dashboard Views

│   ├── AdminDash.jsx

│   ├── FarmhandDash.jsx
│   ├── FarminstitutDash.jsx
│   └── ...
├── App.jsx             # Main Router & Role logic

└── main.jsx            # Entry point
```


🔐 Dashboard Access MatrixRoleDashboard Path

Primary FocusAdmin/dashboard/adminSystem Health & User ControlInstitution/dashboard/farminstitutionStrategic Yields & ROICorrespondent/dashboard/

farmcorrespondentTeam Sync & VerificationFarmhand/dashboard/farmhandTasks & Direct Data Entry🧪 

