import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "./config";

import Dashboard from "./pages/Dashboard";
import NewCase from "./pages/NewCase";
import CaseDetails from "./pages/CaseDetails";


function App() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    aiReady: 0,
    openCases: 0,
  });

  async function fetchCases(
  page = 1,
  search = "",
  status = "all",
  aiReady = "all"
) {

  setLoading(true);
  setError("");

  try {
    const params = new URLSearchParams({
      page,
      limit: 8,
      search,
      status,
      aiReady,
    });

    const response = await fetch(
      `${API_BASE_URL}/cases?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch cases");
    }

    const data = await response.json();

    setCases(data.cases);
    setPagination(data.pagination);
    setStats(data.stats);

  } catch (error) {
    console.error("Fetch cases error:", error);
    setError("Unable to load investigations. Please try again.");
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    fetchCases().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              cases={cases}
              pagination={pagination}
              stats={stats}
              fetchCases={fetchCases}
              loading={loading}
              error={error}
            />
          }
        />

        <Route
          path="/new"
          element={<NewCase fetchCases={fetchCases} />}
        />

        <Route
          path="/cases/:id"
          element={<CaseDetails fetchCases={fetchCases} />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

