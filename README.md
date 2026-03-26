
# HarvestHand
HarvestHand is an intuitive, open-source farm management platform designed to bridge the gap between the field and the office. Track yields, manage seasonal labor, and monitor crop health in real-time.

## Key Features
**Yield Tracking**: Log harvests by weight, volume, or unit with GPS-tagged location data.

**Labor Management**: Assign tasks to field hands and track hours worked per plot.

**Inventory Control**: Keep tabs on seeds, fertilizers, and equipment maintenance schedules.

**Analytics Dashboard**: Visualize seasonal trends and ROI per acre with interactive charts.

## Features
Multi-Role Dashboards: Custom interfaces for Admin, Institution, Correspondent, and Farmhand.

RBAC Security: Protected routes and automated role-based redirection.

Tailwind UI: Fully responsive, accessible, and high-contrast designs using Tailwind CSS.

Dynamic Icons: Context-aware iconography powered by lucide-react.

Stateful Auth: Persistence of JWT tokens and user roles via localStorage.



### TECH STACK
```
Layer	Technology
Frontend	React /
Vite (with HMR)Library: React 19Styling: Tailwind CSSRouting: React Router 7Icons: Lucide ReactHTTP Client: Axios
Backend	Node.js / Express
Database	PostgreSQL + PostGIS (for mapping)
Mobile	React Native
State	Redux Toolkit
```

#### 🏁 Getting Started
Prerequisites
Node.js (v18.0.0 or higher)

Docker (optional, for database setup)

Installation
Clone the repository

>Bash
git clone https://github.com/jmuli-star/HARVESTHAND.git
cd harvest-hand
Install dependencies

>Bash
npm install

Environment Setup
Create a .env file in the root directory and add your credentials:
```
DB_URL=postgresql://user:password@localhost:5432/  harvesthand                              #Code snippet
API_KEY=your_secret_key
Run the development server
Bash
npm run dev
### React
*1 Installation** :Clone the project and install dependencies: 

>Bash: npm install

**2. Environment Setup** : Create a **.env** file in the root: Code snippet; VITE_API_URL=http://127.0.0.1:8000/api/v1

**3. Development Mode** : Run the app with Hot Module Replacement (HMR)
> Bash : npm run dev
```
Data Model
To understand how HarvestHand organizes your farm, refer to the entity relationship:

Contributing
We welcome green thumbs and clean code!

Fork the Project.
```
Create your Feature Branch (git checkout -b feature/AmazingFeature).

Commit your Changes (git commit -m 'Add some AmazingFeature').

Push to the Branch (git push origin feature/AmazingFeature).

Open a Pull Request.
```

 License
Distributed under the  License. See LICENSE for more information.

📞 Contact
Project Lead: Joseph Musilu - @Bipolarj

Project Link: git@github.com:jmuli-star/HARVESTHAND.git
