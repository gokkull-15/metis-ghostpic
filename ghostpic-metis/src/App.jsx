import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomeFeed from './pages/HomeFeed';
import NewReport from './pages/NewReport';
import PostPage from './pages/PostPage';
import ModerationPanel from './pages/ModerationPanel';
import ImpactPage from './pages/ImpactPage';
import AdminPanel from './pages/AdminPanel';
import HelpCommunity from './pages/HelpCommunity';
import CivicMap from './pages/CivicMap';
import Elections from './pages/Elections';
import DeveloperDocs from './pages/DeveloperDocs';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Aadhar from './pages/ExtractAadhar';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
    <Navbar />
    <Sidebar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<HomeFeed />} />
        <Route path="/report" element={<NewReport />} />
        <Route path="/post" element={<PostPage />} />
        <Route path="/complete-kyc" element={<AuthPage />} />
        <Route path="/moderation" element={<ModerationPanel />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/help" element={<HelpCommunity />} />
        <Route path="/map" element={<CivicMap />} />
        <Route path="/elections" element={<Elections />} />
        <Route path="/developer" element={<DeveloperDocs />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/aa" element={<Aadhar />} />
      </Routes>
    </BrowserRouter>
  );
}
