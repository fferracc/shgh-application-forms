import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ApplicationForm from './ApplicationForm';
import RegistrationForm from './RegistrationForm';
import BuryForm from './BuryForm';
import RoboticsEnrollmentForm from './RoboticsEnrollmentForm';
import RoboticsSuccess from './RoboticsSuccess';
import ReferralForm from './ReferralForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ApplicationForm />} />
        <Route path="/registration" element={<RegistrationForm />} />
        <Route path="/bury" element={<BuryForm />} />
        <Route path="/robotics" element={<RoboticsEnrollmentForm />} />
        <Route path="/robotics-success" element={<RoboticsSuccess />} />
        <Route path="/referrals" element={<ReferralForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
