import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import CalendarCoursePlatform from './components/CalendarCoursePlatform';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CalendarCoursePlatform />} />
      </Routes>
    </Router>
  );
}

export default App;