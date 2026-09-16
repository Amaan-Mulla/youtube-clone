import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import WatchPage from "./pages/WatchPage.jsx";
import ChannelPage from "./pages/ChannelPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import SubscriptionsPage from "./pages/SubscriptionsPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import PlaylistPage from "./pages/PlaylistPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";


function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/watch/:videoId" element={<WatchPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/channel/:username" element={<ChannelPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/playlists/:playlistId" element={<PlaylistPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
