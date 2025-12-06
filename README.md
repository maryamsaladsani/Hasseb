
# Hasseb
Haseeb is a simple financial toolkit for small coffee suppliers, offering three tools: a Break-Even Simulator, a Cash Flow Danger Zone Visualizer, and a Pricing Experiment Simulator.
Together, they help suppliers understand costs, avoid cash shortages, and make smarter pricing decisions.

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Team Members](#team-members)
- [License](#license)

## About the Project

Hasseb is a web-based financial management application built specifically for small coffee suppliers. It provides three essential simulation tools that help business owners analyze their finances, predict cash flow issues, and experiment with pricing strategies—all in one intuitive website.

The application supports three user roles:
- **Business Owner** — Access to financial tools and simulations
- **Manager** — User management, analytics, and support ticket handling
- **Advisor** — Dashboard overview, feedback, analysis tools, and client support

## Features

### 🎯 Break-Even Simulator
Test different combinations of costs, prices, and sales volumes to understand exactly how many units of beans, cups, or other supplies must be sold to cover expenses.

### 🛡️ Cash Flow Danger Zone Visualizer
Highlights upcoming weeks or months when outgoing costs such as packaging, shipping, or restocking may exceed incoming payments, helping you anticipate and avoid shortfalls.

### 💡 Pricing Experiment Simulator
Explore "what-if" scenarios by adjusting product prices and instantly seeing the projected impact on revenue and profit.

## Tech Stack
### Frontend
- **Framework:** React 19.2.0
- **UI Framework:** React Bootstrap 2.10.10, Bootstrap 5.3.8
- **Charts:** Recharts 3.4.1, Chart.js with react-chartjs-2
- **Icons:** Lucide React, React Icons
- **HTTP Client:** Axios
- **Routing:** React Router DOM
- **Build Tool:** Create React App (react-scripts 5.0.1)
- 

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5.1.0
- **Database:** MongoDB 7.0.0 with Mongoose 9.0.0
- **Authentication:** bcryptjs 3.0.3
- **File Upload:** Multer 2.0.2
- **Excel Processing:** xlsx 0.18.5
- **Email:** Nodemailer 7.0.11
- **Environment Variables:** dotenv 17.2.3
- **CORS:** cors 2.8.5


## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher required for backend)
- npm (comes with Node.js)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

#### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/maryamsaladsani/Hasseb.git
   cd Hasseb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install React-Bootstrap and Bootstrap**
   ```bash
   npm install react-bootstrap bootstrap
   ```

4. **Install React Router DOM**
   ```bash
   npm install react-router-dom
   ```

5. **Install React Icons**
   ```bash
   npm install react-icons
   ```

6. **Install Lucide React**
   ```bash
   npm install lucide-react
   ```

7. **Install Axios**
   ```bash
   npm install axios
   ```

8. **Install Chart.js and React Chart.js 2**
   ```bash
   npm install chart.js react-chartjs-2
   ```

9. **Install Recharts**
   ```bash
   npm install recharts
   ```

#### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Express**
   ```bash
   npm install express
   ```

4. **Install MongoDB and Mongoose**
   ```bash
   npm install mongodb mongoose
   ```

5. **Install bcryptjs** (for password hashing)
   ```bash
   npm install bcryptjs
   ```

6. **Install Multer** (for file uploads)
   ```bash
   npm install multer
   ```

7. **Install xlsx** (for Excel file processing)
   ```bash
   npm install xlsx
   ```

8. **Install Nodemailer** (for sending emails)
   ```bash
   npm install nodemailer
   ```

9. **Install dotenv** (for environment variables)
   ```bash
   npm install dotenv
   ```

10. **Install CORS**
    ```bash
    npm install cors
    ```

11. **Install Nodemon** (for development)
    ```bash
    npm install --save-dev nodemon
    ```

12. **Set up environment variables**

    Create a `.env` file in the `backend` directory with your configuration:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    PORT=5000
    ```

#### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server** (in a new terminal)
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.


## Usage

After starting the application:

1. **Home Page** — Get started by navigating through the header
2. **Manager View** — Access user management, analytics, settings, and support tickets
3. **Advisor View** — View dashboard, provide feedback, run analyses, and manage client simulations
4. **Business Owner View** — Access financial simulation tools


# Project Structure

### Overview

```
Hasseb/
├── backend/
├── public/
├── src/
├── .gitignore
├── package.json
├── package-lock.json
├── LICENSE
└── README.md
```

### Backend Structure

```
backend/
├── node_modules/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── advisorModels/
│   │   │   └── ...
│   │   ├── Assignment.js
│   │   ├── BusinessData.js
│   │   ├── Notification.js
│   │   ├── Owner.js
│   │   ├── Scenario.js
│   │   ├── SupportTicket.js
│   │   ├── Ticket.js
│   │   └── User.js
│   ├── routes/
│   │   ├── advisorRoutes/
│   │   │   ├── advisorRoute.js
│   │   │   ├── advisorTicketRoutes.js
│   │   │   ├── feedback.js
│   │   │   └── ownerAdvisorRoutes.js
│   │   ├── ManagerRoutes/
│   │   │   ├── AssignmentRoutes.js
│   │   │   ├── TicketRoutes.js
│   │   │   └── User.js
│   │   ├── businessDataRoutes.js
│   │   ├── NotificationRoutes.js
│   │   ├── OwnerRoutes.js
│   │   ├── scenarioRoutes.js
│   │   └── userRoutes.js
│   └── utils/
│       ├── email.js
│       └── riskEngine.js
├── .env
├── package.json
├── package-lock.json
└── server.js
```
### Frontend Structure

```
Haseeb/
├── .idea/
├── backend/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   ├── AdivosrComponents/
│   │   │   ├── AccountPanel.jsx
│   │   │   ├── AdvisorLayout.jsx
│   │   │   ├── AnalyzerPanel.jsx
│   │   │   ├── BreakEvenSimulationPanel.jsx
│   │   │   ├── DashboardAdvisorPanel.jsx
│   │   │   ├── FeedbackPanel.jsx
│   │   │   ├── index.css
│   │   │   ├── NotificationsPanel.jsx
│   │   │   ├── RiskDetailsPanel.jsx
│   │   │   ├── SupportPanel2.jsx
│   │   │   └── TicketDetailsPanel.jsx
│   │   ├── businessOwner/
│   │   │   ├── AccountPanel.jsx
│   │   │   ├── BreakEvenCalculator.css
│   │   │   ├── BreakEvenCalculator.jsx
│   │   │   ├── BusinessDataUpload.css
│   │   │   ├── BusinessDataUpload.jsx
│   │   │   ├── BusinessOwnerHome.jsx
│   │   │   ├── BusinessOwnerLayout.jsx
│   │   │   ├── BusinessOwnerSupport.jsx
│   │   │   ├── BusinessOwnerTicketDetails.jsx
│   │   │   ├── CashFlowTool.css
│   │   │   ├── CashFlowTool.jsx
│   │   │   ├── InsightEngine.js
│   │   │   ├── NotificationsPanel.jsx
│   │   │   ├── OwnerDashboardPanel.css
│   │   │   ├── OwnerDashboardPanel.jsx
│   │   │   ├── PricingSimulator.css
│   │   │   ├── PricingSimulator.jsx
│   │   │   ├── ScenarioComparison.css
│   │   │   └── ScenarioComparison.jsx
│   │   ├── Home/
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── Haseebauth.css
│   │   │   ├── Haseebauth.jsx
│   │   │   ├── HaseebHomePage.css
│   │   │   └── HaseebHomePage.jsx
│   │   └── Mangercopnents/
│   │       ├── AccountPanel.jsx
│   │       ├── Layout.jsx
│   │       ├── NotificationsPanel.jsx
│   │       └── Panels.jsx
│   ├── SharedStyles/
│   │   ├── AccountPanel.css
│   │   ├── global.css
│   │   ├── Layout.css
│   │   ├── Notifications.css
│   │   ├── SharedSupport.css
│   │   └── SharedTicketDetails.css
│   ├── utils/
│   │   └── excelParser.js
│   ├── Advisor.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── index.js
│   ├── information.js
│   └── Manger.jsx
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
└── README.md
```

## Team Members

**SWE363-F06 | Team #14**

| Name | Student ID |
|------|------------|
| Maryam Sami Aladsani | 202263480 |
| Norah Fraih Alharbi | 202249220 |
| Shorooq Abdulraouf Abuzaid | 202257840 |
| Zahra Mahdi Aljaroudi | 202271780 |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

