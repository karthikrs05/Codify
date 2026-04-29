import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Problem from './pages/Problem';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/problem/1" element={<Problem />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
