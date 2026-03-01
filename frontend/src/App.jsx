import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './Components/Home/Home';
import Signin from './Components/Signin/Signin';
import Signup from './Components/Signup/Signup';
import User from './Pages/User Management/User';
import UserProfile from './Pages/User Management/UserPrfole.jsx';

import StudentDashboard from './Pages/User Management/StudentDashboard.jsx';
import AdminDashboard from './Pages/User Management/EmployeeDashboard.jsx';

function App() {
  return (
    <Router>
      <div className="App">

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/users" element={<User />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route path="/users/:id" element={<UserProfile />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;
