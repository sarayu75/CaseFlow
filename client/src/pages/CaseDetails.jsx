import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import exportReport from "../utils/exportReport";
import Timeline from "../components/Timeline";
import Evidence from "../components/Evidence";
import RiskScore from "../components/RiskScore";
import WitnessAnalysis from "../components/WitnessAnalysis";
import Entities from "../components/Entities";
import RelationshipGraph from "../components/RelationshipGraph";
import InvestigationGraph from "../components/InvestigationGraph";
import { API_BASE_URL } from "../config";

function CaseDetails({ fetchCases }) {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const analysis = caseData?.analysis;

  const isStale = Boolean(
    caseData?.analysis &&
      caseData?.analyzedAt &&
      caseData?.contentUpdatedAt &&
      new Date(caseData.contentUpdatedAt) > new Date(caseData.analyzedAt)
  );

  useEffect(() => {
    async function fetchCase() {
      const response = await fetch(`${API_BASE_URL}/cases/${id}`);
      const data = await response.json();
      setCaseData(data);
      setTitle(data.title);
      setContent(data.content);
      setStatus(data.status);
      await fetchCases();
    }

    fetchCase();
  }, [id]);

  if (!caseData) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

    async function generateAnalysis() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cases/${id}/summary`,
      {
        method: "POST",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      if (result.unavailable) {
        alert(
          "AI analysis is temporarily unavailable. Your case data is safe. Please try again later."
        );
        return;
      }

      throw new Error(result.error || "Failed to generate AI analysis.");
    }

    setCaseData(result);
    setTitle(result.title);
    setContent(result.content);
    setStatus(result.status);

    await fetchCases();

  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to generate AI analysis.");
  }
}

    async function handleSave() {
    try {
        const response = await fetch(
        `${API_BASE_URL}/cases/${id}`,
        {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            title,
            content,
            status,
            }),
        }
        );

        const updatedCase = await response.json();

        setCaseData(updatedCase);

        await fetchCases();

        setEditing(false);

    } catch (err) {
        console.error(err);
        alert("Failed to save case.");
    }
    }

    async function handleDelete() {
    const confirmed = window.confirm(
        "Are you sure you want to delete this case?"
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
        `${API_BASE_URL}/cases/${id}`,
        {
            method: "DELETE",
        }
        );

        if (!response.ok) {
        throw new Error("Failed to delete case");
        }

        await fetchCases();

        navigate("/");

    } catch (err) {
        console.error(err);
        alert("Failed to delete case.");
    }
    }

  return (
      <div className="min-h-screen bg-slate-100 p-10">
        <div className="mx-auto max-w-5xl">

        <Link
            to="/"
            className="mb-8 inline-block text-sm font-medium text-gray-500 hover:text-black"
        >
            ← Back to Dashboard
        </Link>

        <div className="flex items-start justify-between">

            <div>

                {editing ? (
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-4xl font-bold"
                />
                ) : (
                <h1 className="text-4xl font-semibold tracking-tight">
                    {caseData.title}
                </h1>
                )}

                <p className="mt-2 text-gray-500">
                Created{" "}
                {new Date(caseData.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                })}
                </p>

                <div className="mt-6 flex gap-4">

                {editing ? (
                    <button
                    onClick={handleSave}
                    className="rounded-xl bg-black px-5 py-3 text-white hover:bg-gray-800"
                    >
                    Save Changes
                    </button>
                ) : (
                    <button
                    onClick={() => setEditing(true)}
                    className="rounded-xl border px-5 py-3 hover:bg-gray-100"
                    >
                    Edit Case
                    </button>
                )}

                <button
                    onClick={handleDelete}
                    className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-red-700 hover:bg-red-100"
                >
                    Delete Case
                </button>

                <button
                onClick={() => exportReport(caseData)}
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 hover:bg-gray-100"
                >
                Export Report
                </button>

                </div>

            </div>


            {editing ? (
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2"
                >
                    <option>Open</option>
                    <option>In Review</option>
                    <option>Closed</option>
                </select>
            ) : (
                <div className="flex gap-2">

                    <span
                        className={`
                            rounded-full px-3 py-1 text-sm font-medium
                            ${
                                caseData.status === "Open"
                                    ? "bg-blue-100 text-blue-700"
                                    : caseData.status === "Closed"
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-yellow-100 text-yellow-700"
                            }
                        `}
                    >
                        {caseData.status}
                    </span>

                    <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                            caseData.analysis
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        {caseData.analysis ? "AI Ready" : "Needs AI"}
                    </span>

                </div>
            )}

            </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="mb-4 text-xl font-semibold">
            Original Report
            </h2>

            {editing ? (
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full rounded-xl border border-gray-300 p-4"
            />
            ) : (
            <div className="rounded-xl bg-slate-50 p-6 whitespace-pre-wrap">
                {caseData.content}
            </div>
            )}

        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
              AI Investigation
              </h2>

              {caseData.analysis && (
                <button
                  onClick={generateAnalysis}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  Re-analyze
                </button>
              )}
            </div>

            {isStale && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 p-4">
                <div>
                  <p className="font-medium text-amber-900">
                    ⚠ This analysis may be out of date
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    The case was edited after this analysis was generated.
                    The results below may not reflect the current report.
                  </p>
                </div>
                <button
                  onClick={generateAnalysis}
                  className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Re-analyze Now
                </button>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            {caseData.analysis && typeof caseData.analysis === "object" ? (

            <div className="space-y-6">

            <RiskScore risk={analysis.riskAssessment} />

            <WitnessAnalysis witnesses={analysis.witnessAnalysis} />

            <Entities entities={analysis.entities}/>

            <InvestigationGraph
            relationships={analysis.relationships}
            />

            {/* Executive Summary */}
            <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Executive Summary
                </h3>

                <p className="leading-7 text-gray-700">
                {analysis.executiveSummary}
                </p>
            </div>


            {/* Timeline + Evidence */}
            <div className="grid gap-6 md:grid-cols-2">

                <div className="rounded-xl bg-white p-5 border">

                <h3 className="mb-5 font-semibold">
                    Investigation Timeline
                </h3>

                <Timeline events={analysis.timeline} />

                </div>


                <div className="rounded-xl bg-white p-5 border">

                <h3 className="mb-5 font-semibold">
                    Evidence Intelligence
                </h3>

                <Evidence items={analysis.evidence} />

                </div>

            </div>


            {/* Witnesses + Contradictions */}
            <div className="grid gap-6 md:grid-cols-2">

                <div className="rounded-xl bg-white p-5 border">

                <h3 className="mb-3 font-semibold">
                    Witnesses
                </h3>

                {(analysis.witnesses || []).length > 0 ? (
                    <ul className="space-y-2 text-sm text-gray-700">
                    {(analysis.witnesses || []).map((item,index)=>(
                        <li key={index}>
                        • {item}
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400">
                    No witnesses identified.
                    </p>
                )}

                </div>


                <div className="rounded-xl bg-white p-5 border">

                <h3 className="mb-3 font-semibold">
                    Contradictions
                </h3>

                {(analysis.contradictions || []).length > 0 ? (
                    <ul className="space-y-2 text-sm text-gray-700">
                    {(analysis.contradictions || []).map((item,index)=>(
                        <li key={index}>
                        ⚠ {item}
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400">
                    No contradictions identified.
                    </p>
                )}

                </div>

            </div>


            {/* Next Steps */}
            <div className="rounded-xl bg-white p-5 border">

                <h3 className="mb-3 font-semibold">
                Recommended Next Steps
                </h3>

                {(analysis.recommendedNextSteps || []).length > 0 ? (
                <ul className="space-y-2 text-sm text-gray-700">
                    {(analysis.recommendedNextSteps || []).map((item,index)=>(
                    <li key={index}>
                        → {item}
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-sm text-gray-400">
                    No recommendations generated.
                </p>
                )}

            </div>


            </div>

            ) : (
            <div>

                <p className="mb-4 text-gray-500">
                No AI analysis generated yet.
                </p>

                <button
                    onClick={generateAnalysis}
                    className="rounded-xl bg-black px-5 py-3 text-white hover:bg-gray-800"
                >
                Generate Case Analysis
                </button>

            </div>
            )}
            </div>

        </div>

        </div>
    </div>
  );
}

export default CaseDetails;