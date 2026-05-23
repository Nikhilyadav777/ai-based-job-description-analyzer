import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout.jsx";
import { AnalyzerPage } from "./pages/AnalyzerPage.jsx";
import { HistoryPage } from "./pages/HistoryPage.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AnalyzerPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Layout>
  );
}
