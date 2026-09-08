import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Investigations from "./pages/Investigations";
import NetworkGraph from "./pages/NetworkGraph";
import Entities from "./pages/Entities";
import Alerts from "./pages/Alerts";
import Evidence from "./pages/Evidence";
import DataSources from "./pages/DataSources";
import Analytics from "./pages/Analytics";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/investigations" element={<Investigations />} />
            <Route path="/network" element={<NetworkGraph />} />
            <Route path="/entities" element={<Entities />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/data-sources" element={<DataSources />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
