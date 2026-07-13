import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventListingPage from './pages/EventListingPage';
import EventDetailsPage from './pages/EventDetailsPage';
import MyRegisteredEventsPage from './pages/MyRegisteredEventsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import ClubListingPage from './pages/ClubListingPage';
import ClubDetailsPage from './pages/ClubDetailsPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import MyEventsPage from './pages/MyEventsPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/events" element={<EventListingPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/my-events" element={<MyRegisteredEventsPage />} />
              <Route path="/organizer" element={<OrganizerDashboardPage />} />
              <Route path="/organizer/events" element={<MyEventsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/clubs" element={<ClubListingPage />} />
              <Route path="/clubs/:id" element={<ClubDetailsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
