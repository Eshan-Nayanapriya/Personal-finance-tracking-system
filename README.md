# Personal Finance Tracker API

<p align="left">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=express,nodejs,mongodb&perline=14" />
  </a>
</p>

A RESTful API for managing a Personal Finance Tracker 
system. The system facilitates users in managing their financial records, tracking expenses, 
setting budgets, and analyzing spending trends. Emphasizing secure access, data integrity

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [Sample Credentials](#sample-credentials)
- [API Documentation](#api-documentation)
- [Testing](#testing)

## Features
- ✅User authentication with JWT
- ✅Budget management with currency conversion
- ✅Transaction tracking (income/expense)
- ✅Financial reporting and analytics
- ✅Recurring transactions
- ✅Role-based access control (Admin/User)
- ✅Automated notifications
- ✅Goals and Savings Tracking(automatic allocation of savings from income)
- ✅Multi-Currency Support
- ✅Transaction categorization and filtering

## Technologies
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Moment.js (Date handling)
- Artillery (Performance testing)
- Jest (Unit/Integration testing)

## Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (v6+)
- PNPM (Optional but recommended)

1. **Clone the repository**
2.     cd project-Eshan-Nayanapriya
3.     cd backend
4.     pnpm install
5.     pnpm run dev
6. **If these steps worked correctly,This message will be diplayed in the Terminal ,**<br>**🛢️  Database connected**<br>**🚀 Server is running on port 5000**

## 🌍Environment Variables
- .env file is also uploaded within the repo. So need need for creating seperate .env file.

## 🏃Running the Server
    pnpm run dev

## 🔐Sample Credentials
- Admin
  - **E-mail** - *abc@gmail.com*
  - **Password** - *1234*
- User
  - **E-mail** - *abcde@gmail.com*
  - **Password** - *12345*

## 📑API Documentation

- **👨‍💻User Endpoints**

  <table> <tr> <th>Endpoint</th> <th>Method</th> <th>Description</th> </tr> <tr> <td>http://localhost:5000/api/auth/register</td> <td>POST</td> <td>Register</td> </tr></table>

- **Endpoints with JWT Authentication (admin/user)**, *For these Routes you should provide "Bearer <JWT_token>" in the headers*
    - **User Endpoints(Protedted using JWT)**
      <table> <tr> <th>Endpoint</th> <th>Method</th> <th>Description</th> </tr><tr> <td>http://localhost:5000/api/auth/login</td> <td>POST</td> <td>Login</td> </tr><tr> <td>http://localhost:5000/api/users/user</td> <td>GET</td> <td>User dashboard</td> </tr> </table>
    - **Budget Endpoints(Protedted using JWT)**
      <table> <tr> <th>Endpoint</th> <th>Method</th> <th>Description</th> </tr> <tr> <td>http://localhost:5000/api/budgets/create</td> <td>POST</td> <td>Create a new budget</td> </tr> <tr> <td>http://localhost:5000/api/budgets</td> <td>GET</td> <td>Get all budgets</td> </tr> <tr> <td>http://localhost:5000/api/budgets/:id</td> <td>PUT</td> <td>Update a budget</td> </tr> <tr> <td>http://localhost:5000/api/budgets/:id</td> <td>DELETE</td> <td>Delete a budget</td> </tr> <tr> <td>http://localhost:5000/api/budgets/report</td> <td>GET</td> <td>Generate a budget report</td> </tr> <tr> <td>http://localhost:5000/api/budgets/allocate-budget</td> <td>POST</td> <td>Allocate remaining budget to goals</td> </tr> </table>
    - **Transaction Endpoints(Protedted using JWT)**
      <table> <tr> <th>Endpoint</th> <th>Method</th> <th>Description</th> </tr> <tr> <td>http://localhost:5000/api/transaction/create</td> <td>POST</td> <td>Create a new transaction</td> </tr> <tr> <td>http://localhost:5000/api/transaction</td> <td>GET</td> <td>Get all transactions</td> </tr> <tr> <td>http://localhost:5000/api/transaction/expenses</td> <td>GET</td> <td>Get all expenses</td> </tr> <tr> <td>http://localhost:5000/api/transaction/incomes</td> <td>GET</td> <td>Get all incomes</td> </tr> <tr> <td>http://localhost:5000/api/transaction/:id</td> <td>PUT</td> <td>Update a transaction</td> </tr> <tr> <td>http://localhost:5000/api/transaction/:id</td> <td>DELETE</td> <td>Delete a transaction</td> </tr> <tr> <td>http://localhost:5000/api/transaction/report</td> <td>GET</td> <td>Generate a transaction report</td> </tr> <tr> <td>http://localhost:5000/api/transaction/filter</td> <td>GET</td> <td>Filter transactions</td> </tr> </table>
    - **Notification Endpoints(Protedted using JWT)**
      <table> <tr> <th>Endpoint</th> <th>Method</th> <th>Description</th> </tr> <tr> <td>http://localhost:5000/api/notifications</td> <td>GET</td> <td>Get all notifications</td> </tr> <tr> <td>http://localhost:5000/api/notifications/notify-recurring</td> <td>GET</td> <td>Generate notifications for recurring transactions</td> </tr> </table>
    - **Goal Endpoints(Protedted using JWT)**
      <table> <tr> <th>Endpoint</th> <th>Method</th> <th>Description</th> </tr> <tr> <td>http://localhost:5000/api/goals/create</td> <td>POST</td> <td>Create a new goal</td> </tr> <tr> <td>http://localhost:5000/api/goals</td> <td>GET</td> <td>Get all goals</td> </tr> <tr> <td>http://localhost:5000/api/goals/:id</td> <td>PUT</td> <td>Update a goal</td> </tr> <tr> <td>http://localhost:5000/api/goals/:id</td> <td>DELETE</td> <td>Delete a goal</td> </tr> </table>
    - **Report Endpoints(Protedted using JWT)**
      <table> <tr> <th>Endpoint</th> <th>Method</th> <th>Description</th> </tr> <tr> <td>http://localhost:5000/api/reports/monthly-summary</td> <td>POST</td> <td>Generate monthly summary report</td> </tr> <tr> <td>http://localhost:5000/api/reports/overall-financial</td> <td>GET</td> <td>Generate overall financial report</td> </tr> <tr> <td>http://localhost:5000/api/reports/spending</td> <td>GET</td> <td>Generate spending report</td> </tr> <tr> <td>http://localhost:5000/api/reports/income</td> <td>GET</td> <td>Generate income report</td> </tr> </table>

- **🔐Admin Endpoints with JWT Authentication (Admin Only/Role based)**, *First login using Admin credentials, then provide "Bearer <JWT_token>" in the headers*
  
  <table> <tr> <th>Endpoint</th> <th>Method</th> <th>Description</th> </tr> <tr> <td>http://localhost:5000/api/users/admin</td> <td>GET</td> <td>Admin dashboard</td> </tr> <tr> <td>http://localhost:5000/api/users/admin/users</td> <td>GET</td> <td>Get all users</td> </tr> <tr> <td>http://localhost:5000/api/users/admin/users/:userId</td> <td>DELETE</td> <td>Delete a user</td> </tr> <tr> <td>http://localhost:5000/api/users/admin/users/assign-admin/:userId</td> <td>PUT</td> <td>Assign admin role to a user</td> </tr> <tr> <td>http://localhost:5000/api/users/admin/transactions</td> <td>GET</td> <td>Get all transactions of all users</td> </tr> <tr> <td>http://localhost:5000/api/users/admin/transactions/update-limit</td> <td>PUT</td> <td>Update transaction limits for all users</td> </tr> </table>

## 🧪Testing
- ✅ Unit & Integration Tests
    ```sh  
   pnpm test
- ✅ Performance Testing
    ```sh  
   artillery run performance-test.yml
