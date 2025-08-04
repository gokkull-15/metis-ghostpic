import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PostPage from './pages/PostPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Aadhar from './pages/ExtractAadhar';
import Profile from './pages/Profile';
import PostDetails from './pages/PostDetail';
import Search from './pages/Search';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';

export default function App() {
  return (
    <BrowserRouter>
    <Navbar />
    <Sidebar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-post" element={<PostPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/home" element={<Home />} />
        <Route path="/posts/:postId" element={<PostDetails />} />
        <Route path="/aa" element={<Aadhar />} />
      </Routes>
    </BrowserRouter>
  );
}
