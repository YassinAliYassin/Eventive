import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Timesheet from "./pages/Timesheet";
import TimesheetAdmin from "./pages/TimesheetAdmin";

export default function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timesheet" element={<Timesheet />} />
        <Route path="/timesheet/admin" element={<TimesheetAdmin />} />
      </Routes>
    </div>
  );
}
