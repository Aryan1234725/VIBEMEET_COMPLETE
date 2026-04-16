import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/home';
import History from './pages/history';
import Payment from './pages/Payment';
import GoogleMeetInterface from './pages/GoogleMeetInterface';

function App() {
  return (
    <div className="App">

      <Router>
        <AuthProvider>

          <Routes>

            <Route path='/' element={<LandingPage />} />
            <Route path='/auth' element={<Authentication />} />

            <Route path='/home' element={<HomeComponent />} />
            <Route path='/payment' element={<Payment />} />

            <Route path='/history' element={<History />} />
            <Route path='/meet' element={<GoogleMeetInterface />} />

            {/* Keep dynamic route LAST */}
            <Route path='/:url' element={<VideoMeetComponent />} />

          </Routes>

        </AuthProvider>
      </Router>

    </div>
  );
}

export default App;