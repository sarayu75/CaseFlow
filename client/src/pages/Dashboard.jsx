import { Link } from "react-router-dom";
import CaseCard from "../components/CaseCard";
import { useState } from "react";
import SearchBar from "../components/SearchBar";
import { API_BASE_URL } from "../config";

function Dashboard({
  cases,
  pagination,
  stats,
  fetchCases,
  loading,
  error,
}) {
const [search, setSearch] = useState("");
const [aiQuery, setAiQuery] = useState("");
const [sortBy, setSortBy] = useState("newest");
const [statusFilter, setStatusFilter] = useState("all");
const [summaryFilter, setSummaryFilter] = useState("all");
const [aiAnswer, setAiAnswer] = useState("");
const [aiSearching, setAiSearching] = useState(false);

const askCaseFlow = async () => {
  if (!aiQuery.trim()) return;

  setAiSearching(true);
  setAiAnswer("");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/ask-caseflow`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: aiQuery,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setAiAnswer(
        data.error || "Unable to process your question."
      );
      return;
    }

    if (data.unavailable) {
      setAiAnswer(data.answer);
      return;
    }

    setAiAnswer(data.answer);

  } catch (error) {
    console.error("CaseFlow search failed:", error);
    setAiAnswer(
      "Unable to connect to CaseFlow AI."
    );
  } finally {
    setAiSearching(false);
  }
};

const filteredCases = [...cases].sort((a, b) => {
  if (sortBy === "newest") {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }

  if (sortBy === "oldest") {
    return new Date(a.createdAt) - new Date(b.createdAt);
  }

  if (sortBy === "az") {
    return a.title.localeCompare(b.title);
  }

  if (sortBy === "za") {
    return b.title.localeCompare(a.title);
  }

  return 0;
});

const totalCases = pagination.total;
const summarizedCases = stats.aiReady;
const openCases = stats.openCases;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">

        <div className="flex justify-between items-start mb-8">

        <div>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900">
            CaseFlow
            </h1>

            <p className="mt-1 text-gray-500">
            AI-powered legal case management
            </p>
        </div>


        <Link
            to="/new"
            className="
            rounded-lg
            bg-black
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            hover:bg-gray-800
            transition
            "
        >
            + New Investigation
        </Link>

        </div>

        <SearchBar
            search={search}
            setSearch={(value) => {
            setSearch(value);
            fetchCases(1, value);
            }}
        />

        <div className="mt-4 flex gap-3">
        <input
            type="text"
            placeholder="Ask CaseFlow about your cases..."
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 bg-white p-4"
        />

        <button
            onClick={askCaseFlow}
            className="rounded-xl bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
            Ask CaseFlow
        </button>
        </div>

        {aiSearching && (
  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
    <p className="text-sm text-gray-500">
      CaseFlow is analyzing your cases...
    </p>
  </div>
)}

{aiAnswer && (
  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
    <p className="text-sm font-medium text-gray-500">
      CaseFlow
    </p>

    <p className="mt-2 text-sm leading-6 text-gray-800">
      {aiAnswer}
    </p>
  </div>
)}

    <div className="mt-8 mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
            Total Cases
            </p>

            <h3 className="mt-2 text-3xl font-semibold">
            {totalCases}
            </h3>

            <p className="mt-2 text-xs text-gray-400">
            Active workspace
            </p>

        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
            AI Ready
            </p>

            <h3 className="mt-2 text-3xl font-semibold">
            {summarizedCases}
            </h3>

            <p className="mt-2 text-xs text-gray-400">
            Ready for review
            </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
            Open Cases
            </p>

            <h3 className="mt-2 text-3xl font-semibold">
            {openCases}
            </h3>

            <p className="mt-2 text-xs text-gray-400">
            Currently active
            </p>
        </div>
    </div>

        <div className="mb-8 mt-6 flex flex-wrap items-center gap-4">

  <select
    value={statusFilter}
    onChange={(e) => {
    const value = e.target.value;
    setStatusFilter(value);
    fetchCases(1, search, value, summaryFilter);
    }}
    className="rounded-xl border border-gray-300 bg-white px-4 py-2"
  >
    <option value="all">All Statuses</option>
    <option value="Open">Open</option>
    <option value="In Review">In Review</option>
    <option value="Closed">Closed</option>
  </select>

  <select
  value={summaryFilter}
  onChange={(e) => {
    const value = e.target.value;
    setSummaryFilter(value);
    fetchCases(1, search, statusFilter, value);
  }}
  className="rounded-xl border border-gray-300 bg-white px-4 py-2"
>
  <option value="all">All AI Status</option>
  <option value="ready">Analysis Ready</option>
  <option value="missing">Needs Analysis</option>
</select>

  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="rounded-xl border border-gray-300 bg-white px-4 py-2"
  >
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
    <option value="az">A → Z</option>
    <option value="za">Z → A</option>
  </select>

</div>
        <h2 className="mt-8 mb-6 text-2xl font-semibold">
          Recent Cases
        </h2>

        <div className="space-y-4">
  {loading ? (
  <div className="rounded-xl border bg-white p-8 text-center">
    <p className="text-sm text-gray-500">
      Loading investigations...
    </p>
  </div>
) : error ? (
  <div className="rounded-xl border bg-white p-8 text-center">
    <p className="font-medium text-gray-700">
      Something went wrong
    </p>

    <p className="mt-1 text-sm text-gray-400">
      {error}
    </p>

    <button
      onClick={() =>
        fetchCases(
            1,
            search,
            statusFilter,
            summaryFilter
        )
        }
      className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white"
    >
      Try Again
    </button>
  </div>
) : filteredCases.length === 0 ? (
  <div className="rounded-xl border bg-white p-8 text-center">
    <p className="font-medium text-gray-700">
      No investigations found
    </p>

    <p className="mt-1 text-sm text-gray-400">
      Try adjusting your search or filters.
    </p>
  </div>
) : (
  filteredCases.map((caseItem) => (
    <CaseCard
      key={caseItem.id}
      caseItem={caseItem}
    />
  ))
)}
</div>

        {pagination.totalPages > 1 && (
  <div className="mt-8 flex items-center justify-center gap-4">

    <button
      onClick={() =>
        fetchCases(
            pagination.page - 1,
            search,
            statusFilter,
            summaryFilter
        )
    }
      disabled={pagination.page === 1}
      className="rounded-lg border bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
    >
      ← Previous
    </button>

    <span className="text-sm text-gray-600">
      Page {pagination.page} of {pagination.totalPages}
    </span>

    <button
      onClick={() =>
        fetchCases(
            pagination.page + 1,
            search,
            statusFilter,
            summaryFilter
        )
        }
      disabled={pagination.page === pagination.totalPages}
      className="rounded-lg border bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
    >
      Next →
    </button>

  </div>
)}

      </div>
    </div>
  );
}

export default Dashboard;