
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
- **Frontend:** React 19.2.0
- **UI Framework:** React Bootstrap 2.10.10, Bootstrap 5.3.8
- **Charts:** Recharts 3.4.1
- **Icons:** Lucide React, React Icons
- **Build Tool:** Create React App (react-scripts 5.0.1)

## Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/maryamsaladsani/Hasseb.git
   cd Hasseb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install React-Bootstrap and Bootstrap** (if not already installed)
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
7. **Start the development server**
   ```bash
   npm install multer
   ```

8. **Start the development server**
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage

After starting the application:

1. **Home Page** — Get started by navigating through the header
2. **Manager View** — Access user management, analytics, settings, and support tickets
3. **Advisor View** — View dashboard, provide feedback, run analyses, and manage client simulations
4. **Business Owner View** — Access financial simulation tools


## Project Structure

```
Hasseb/
├── public/
│   ├── assets/
│   │   ├── Haseeb.png
│   │   ├── HaseebLogo.png
│   │   ├── Hassseb11.png
│   │   ├── HASEEB.png
│   │   └── Haseeb-Business-Template.xlsx
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AdivosrComponents/
│   │   │   ├── AccountPanel.jsx
│   │   │   ├── AdvisorLayout.jsx
│   │   │   ├── AnalyzerPanel.jsx
│   │   │   ├── BreakEvenSimulationPanel.jsx
│   │   │   ├── DashboardAdvisorPanel.jsx
│   │   │   ├── FeedbackPanel.jsx
│   │   │   ├── RiskDetailsPanel.jsx
│   │   │   ├── SupportPanel2.jsx
│   │   │   └── TicketDetailsPanel.jsx
│   │   ├── businessOwner/
│   │   │   ├── BreakEvenCalculator.jsx
│   │   │   ├── BreakEvenCalculator.css
│   │   │   ├── BusinessDataUpload.jsx
│   │   │   ├── BusinessDataUpload.css
│   │   │   ├── BusinessOwnerHome.jsx
│   │   │   ├── BusinessOwnerHome.css
│   │   │   ├── CashFlowTool.jsx
│   │   │   ├── CashFlowTool.css
│   │   │   ├── InsightEngine.js
│   │   │   ├── OwnerDashboardPanel.jsx
│   │   │   ├── OwnerDashboardPanel.css
│   │   │   ├── PricingSimulator.jsx
│   │   │   └── PricingSimulator.css
│   │   ├── Home/
│   │   │   ├── Haseebauth.jsx
│   │   │   ├── Haseebauth.css
│   │   │   ├── HaseebHomePage.jsx
│   │   │   └── HaseebHomePage.css
│   │   └── Mangercopnents/
│   │       ├── AccountPanel.jsx
│   │       ├── Layout.jsx
│   │       ├── NotificationsPanel.jsx
│   │       └── Panels.jsx
│   ├── data/
│   │   └── bepTestData.js
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   ├── Advisor.jsx
│   ├── Manger.jsx
│   ├── index.js
│   ├── index.css
│   └── information.js
├── .gitignore
├── package.json
├── package-lock.json
├── LICENSE
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
