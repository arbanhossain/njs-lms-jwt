import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import Login from './components/login';
import Register from './components/register'
import Dashboard from './components/dashboard'
import Assessment from './components/assessment';
import Submission from './components/submission';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      < Route path="/" element={<App />} />
      < Route path="/login" element={<Login />} />
      < Route path="/register" element={<Register />} />
      < Route path="/dashboard" element={<Dashboard />} />
      < Route path="/assessment/:assessmentID" element={<Assessment />} />
      < Route path="/submissions/:submissionID" element={<Submission />} />
    </Routes>
  </BrowserRouter>
)
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals