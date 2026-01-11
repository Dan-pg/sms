import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClassManagement from './components/ClassManagement';
import StudentManagement from './components/StudentManagement';
import PublicEnrollment from './components/PublicEnrollment';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="classes" element={<ClassManagement />} />
        <Route path="students" element={<StudentManagement />} />
      </Route>
      <Route path="/enroll" element={<PublicEnrollment />} />
    </Routes>
  );
}

export default App;
