import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './Components/Home/Home';
import Signin from './Components/Signin/Signin';
import Signup from './Components/Signup/Signup';

function App() {
  return (
    <Router>
      <div className="App">
        
        <Routes>
       <Route path="/" element={<HomePage />} />
       <Route path="/login" element={<Signin />} />
       <Route path="/signup" element={<Signup />} />
       
        </Routes>
      </div>
    </Router>
  );
}

export default App;
