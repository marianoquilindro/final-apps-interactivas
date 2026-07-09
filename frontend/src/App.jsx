import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SpotsPage from "./pages/SpotsPage";
import VehiclesPage from "./pages/VehiclesPage";
import RatesPage from "./pages/RatesPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import SessionFormPage from "./pages/SessionFormPage";
import SessionsPage from "./pages/SessionsPage";
import OccupancyReportPage from "./pages/OccupancyReportPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<SpotsPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/rates" element={<RatesPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/check-in" element={<SessionFormPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/occupancy" element={<OccupancyReportPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;