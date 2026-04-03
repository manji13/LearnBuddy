import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './Components/Home/Home';
import Signin from './Components/Signin/Signin';
import Signup from './Components/Signup/Signup';
import User from './Pages/User Management/User';
import UserProfile from './Pages/User Management/UserPrfole.jsx';
import ForgotPassword from './Pages/User Management/ForgotPassword.jsx';

import StudentDashboard from './Pages/User Management/StudentDashboard.jsx';
import AdminDashboard from './Pages/User Management/EmployeeDashboard.jsx';
import PastPaperPage from './Pages/pastPaper/PastPaperPage.jsx';
import QuizHistoryPage from './Pages/pastPaper/QuizHistoryPage.jsx';
import AdminPastPaperPage from './Pages/pastPaper/AdminPastPaperPage.jsx';
import NotesAiPage from './Pages/notes/NotesAiPage.jsx';

import ContactUs from './Pages/Support/ContactUs.jsx';

import FacultyList from './Pages/Module Management/faculties/FacultyList.jsx';
import FacultyForm from './Pages/Module Management/faculties/FacultyForm.jsx';
import FacultyDetail from './Pages/Module Management/faculties/FacultyDetails.jsx';

import SemesterList from './Pages/Module Management/semesters/SemesterList.jsx';
import SemesterForm from './Pages/Module Management/semesters/SemesterForm.jsx';
import SemesterDetail from './Pages/Module Management/semesters/SemesterDetails.jsx';

import ModuleList from './Pages/Module Management/modules/ModuleList.Jsx';
import ModuleForm from './Pages/Module Management/modules/ModuleForm.jsx';
import ModuleDetail from './Pages/Module Management/modules/ModuleDetails.jsx';

import StudentFaculties from './Pages/Module Management/faculties/Studentfaculties.jsx';
import StudentSemesters from './Pages/Module Management/modules/Studentsemesters.jsx';
import StudentModules from './Pages/Module Management/semesters/Studentmodules.jsx';

import AnnouncementList from './Pages/Announcement/AdminAnnouncementList.jsx';
import StudentAnnouncementList from './Pages/Announcement/StudentAnnouncementList.jsx';
import StudentAnnouncementView from './Pages/Announcement/StudentAnnouncementView.jsx';
import AdminAnnouncementView from './Pages/Announcement/AdminAnnouncementView.jsx';
import AdminAnnouncementForm from './Pages/Announcement/AdminAnnouncementForm.jsx';


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
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/users/:id" element={<UserProfile />} />



          {/* Faculties */}
        <Route path="/faculties" element={<FacultyList />} />
        <Route path="/faculties/new" element={<FacultyForm />} />
        <Route path="/faculties/:id" element={<FacultyDetail />} />
        <Route path="/faculties/:id/edit" element={<FacultyForm />} />

        {/* Semesters */}
        <Route path="/semesters" element={<SemesterList />} />
        <Route path="/semesters/new" element={<SemesterForm />} />
        <Route path="/semesters/:id" element={<SemesterDetail />} />
        <Route path="/semesters/:id/edit" element={<SemesterForm />} />

        {/* Modules */}
        <Route path="/modules" element={<ModuleList />} />
        <Route path="/modules/new" element={<ModuleForm />} />
        <Route path="/modules/:id" element={<ModuleDetail />} />
        <Route path="/modules/:id/edit" element={<ModuleForm />} />
        <Route path="/student/faculties" element={<StudentFaculties />} />
        <Route path="/student/faculties/:facultyId/semesters" element={<StudentSemesters />} />
        <Route path="/student/faculties/:facultyId/semesters/:semesterId/modules" element={<StudentModules />} />

        {/* Contact Us */}
        <Route path="/contact" element={<ContactUs />} />

          <Route path="/past-papers" element={<PastPaperPage />} />
          <Route path="/quiz-history" element={<QuizHistoryPage />} />
          <Route path="/admin/past-papers" element={<AdminPastPaperPage />} />
          <Route path="/notes-ai" element={<NotesAiPage />} />


          <Route path="/announcements" element={<AnnouncementList />} />
          <Route path="/student/announcements" element={<StudentAnnouncementList />} />
          <Route path="/student/announcements/:id" element={<StudentAnnouncementView />} />
          <Route path="/admin/announcements/:id" element={<AdminAnnouncementView />} />
          <Route path="/admin/announcements/edit/:id" element={<AdminAnnouncementForm />} />
          <Route path="/admin/announcements/new" element={<AdminAnnouncementForm />} />
         
/admin/announcements/edit/

        </Routes>
      </div>
    </Router>
  );
}

export default App;
