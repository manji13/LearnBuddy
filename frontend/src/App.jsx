import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'

import HomePage from './Components/Home/Home';
import Signin from './Components/Signin/Signin';
import Signup from './Components/Signup/Signup';
import User from './Pages/User Management/User';
import UserProfile from './Pages/User Management/UserPrfole.jsx';

import StudentDashboard from './Pages/User Management/StudentDashboard.jsx';
import AdminDashboard from './Pages/User Management/EmployeeDashboard.jsx';

import FacultyList from './Pages/Module Management/faculties/FacultyList.jsx';
import FacultyForm from './Pages/Module Management/faculties/FacultyForm.jsx';
import FacultyDetail from './Pages/Module Management/faculties/FacultyDetails.jsx';

import SemesterList from './Pages/Module Management/semesters/SemesterList.jsx';
import SemesterForm from './Pages/Module Management/semesters/SemesterForm.jsx';
import SemesterDetail from './Pages/Module Management/semesters/SemesterDetails.jsx';

import ModuleList from './Pages/Module Management/modules/ModuleList.Jsx';
import ModuleForm from './Pages/Module Management/modules/ModuleForm.jsx';
import ModuleDetail from './Pages/Module Management/modules/ModuleDetails.jsx';

import Sidebar from './Components/ModuleManagement/Sidebar.jsx';

function App() {
  return (
    <Router>

      <Toaster position="top-right" />

      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/users" element={<User />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Module Management Layout */}
        <Route
          path="/*"
          element={
            <div className="flex">
              <Sidebar />
              <main className="ml-56 flex-1 p-8">
                <Routes>

                  <Route path="bbb" element={<Navigate to="/faculties" replace />} />

                  {/* Faculties */}
                  <Route path="faculties" element={<FacultyList />} />
                  <Route path="faculties/new" element={<FacultyForm />} />
                  <Route path="faculties/:id" element={<FacultyDetail />} />
                  <Route path="faculties/:id/edit" element={<FacultyForm />} />

                  {/* Semesters */}
                  <Route path="semesters" element={<SemesterList />} />
                  <Route path="semesters/new" element={<SemesterForm />} />
                  <Route path="semesters/:id" element={<SemesterDetail />} />
                  <Route path="semesters/:id/edit" element={<SemesterForm />} />

                  {/* Modules */}
                  <Route path="modules" element={<ModuleList />} />
                  <Route path="modules/new" element={<ModuleForm />} />
                  <Route path="modules/:id" element={<ModuleDetail />} />
                  <Route path="modules/:id/edit" element={<ModuleForm />} />

                </Routes>
              </main>
            </div>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;