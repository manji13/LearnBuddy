import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './Components/Home/Home';
import Signin from './Components/Signin/Signin';
import Signup from './Components/Signup/Signup';
import User from './Pages/User Management/User';
import UserProfile from './Pages/User Management/UserPrfole.jsx';
import ForgotPassword from './Pages/User Management/ForgotPassword.jsx';

import ResourceFinder from './Pages/ResourceFinder/ResourceFinder.jsx';

import StudentDashboard from './Pages/User Management/StudentDashboard.jsx';
import AdminDashboard from './Pages/User Management/EmployeeDashboard.jsx';
import PastPaperPage from './Pages/pastPaper/PastPaperPage.jsx';
import QuizHistoryPage from './Pages/pastPaper/QuizHistoryPage.jsx';
import AdminPastPaperPage from './Pages/pastPaper/AdminPastPaperPage.jsx';
import NotesAiPage from './Pages/notes/NotesAiPage.jsx';
import SavedResourcesPage from './Pages/student/SavedResourcesPage.jsx';

import ContactUs from './Pages/Support/ContactUs.jsx';

import FacultyList from './Pages/Module Management/faculties/FacultyList.jsx';
import FacultyForm from './Pages/Module Management/faculties/FacultyForm.jsx';
import FacultyDetail from './Pages/Module Management/faculties/FacultyDetails.jsx';

import SemesterList from './Pages/Module Management/semesters/SemesterList.jsx';
import SemesterForm from './Pages/Module Management/semesters/SemesterForm.jsx';
import SemesterDetail from './Pages/Module Management/semesters/SemesterDetails.jsx';

import ModuleList from './Pages/Module Management/modules/ModuleList.jsx';
import ModuleForm from './Pages/Module Management/modules/ModuleForm.jsx';
import ModuleDetail from './Pages/Module Management/modules/ModuleDetails.jsx';

import StudentFaculties from './Pages/Module Management/faculties/Studentfaculties.jsx';
import StudentSemesters from './Pages/Module Management/modules/Studentsemesters.jsx';
import StudentModules from './Pages/Module Management/semesters/Studentmodules.jsx';
import StudentModuleDetails from './Pages/Module Management/modules/Studentmoduledetails.jsx';

import TimeTableGenerator from './Pages/TimeTable/TimeTableGenerator.jsx';
import UserTimeTable from './Pages/TimeTable/UserTimeTable.jsx';
import AnnouncementList from './Pages/Announcement/AdminAnnouncementList.jsx';
import StudentAnnouncementList from './Pages/Announcement/StudentAnnouncementList.jsx';
import StudentAnnouncementView from './Pages/Announcement/StudentAnnouncementView.jsx';
import AdminAnnouncementView from './Pages/Announcement/AdminAnnouncementView.jsx';
import AdminAnnouncementForm from './Pages/Announcement/AdminAnnouncementForm.jsx';
import MyModules from './Pages/Module Management/modules/SavedModule.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/timetable-generator" element={<TimeTableGenerator />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/users" element={<User />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/resource-finder" element={<ResourceFinder />} />
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
          
          {/* Student Routes */}
          <Route path="/student/faculties" element={<StudentFaculties />} />
          <Route path="/student/faculties/:facultyId/semesters" element={<StudentSemesters />} />
          <Route path="/student/faculties/:facultyId/semesters/:semesterId/modules" element={<StudentModules />} />
          <Route path="/student/modules/:moduleId" element={<StudentModuleDetails />} />
        {/* Modules (Admin) */}
        <Route path="/modules" element={<ModuleList />} />
        <Route path="/modules/new" element={<ModuleForm />} />
        <Route path="/modules/:id" element={<ModuleDetail />} />
        <Route path="/modules/:id/edit" element={<ModuleForm />} />
          
          <Route path="/student/saved-modules" element={<MyModules />} />

          {/* Profile Views */}
          <Route path="/profile/timetable" element={<UserTimeTable />} />
          
          {/* Contact Us */}
          <Route path="/contact" element={<ContactUs />} />

          {/* Past Papers & Notes */}
          <Route path="/past-papers" element={<PastPaperPage />} />
          <Route path="/quiz-history" element={<QuizHistoryPage />} />
          <Route path="/admin/past-papers" element={<AdminPastPaperPage />} />
          <Route path="/notes-ai" element={<NotesAiPage />} />
          <Route path="/admin/lecture-notes" element={<NotesAiPage />} />
          <Route path="/student/saved-resources" element={<SavedResourcesPage />} />
          


          <Route path="/announcements" element={<AnnouncementList />} />
          <Route path="/student/announcements" element={<StudentAnnouncementList />} />
          <Route path="/student/announcements/:id" element={<StudentAnnouncementView />} />
          <Route path="/admin/announcements/:id" element={<AdminAnnouncementView />} />
          <Route path="/admin/announcements/edit/:id" element={<AdminAnnouncementForm />} />
          <Route path="/admin/announcements/new" element={<AdminAnnouncementForm />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;