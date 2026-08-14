import { Link } from "react-router-dom";

function CaseCard({ caseItem }) {
  const hasAnalysis =
  caseItem.analysis &&
  typeof caseItem.analysis === "object";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div className="max-w-xl">

          <h3 className="text-xl font-semibold tracking-tight">
            {caseItem.title}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Created{" "}
            {new Date(caseItem.createdAt).toLocaleDateString()}
          </p>

        </div>


        <div className="flex items-center gap-2">

        <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
            caseItem.status === "Open"
                ? "bg-blue-100 text-blue-700"
                : caseItem.status === "Closed"
                ? "bg-gray-100 text-gray-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
        >
            {caseItem.status}
        </span>

        <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
            hasAnalysis
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
        >
            {hasAnalysis ? "AI Ready" : "Needs AI"}
        </span>

        </div>

      </div>


      <p className="mt-5 line-clamp-3 text-gray-600">
        {caseItem.content}
      </p>

    <hr className="mt-6 border-gray-200" />
      {hasAnalysis && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

          <div className="flex items-center justify-between">

            <h4 className="font-medium text-gray-800">
              AI Analysis
            </h4>

            <span className="text-xs text-green-600">
              Ready
            </span>

          </div>

          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
            {caseItem.analysis.executiveSummary}
          </p>

        </div>
      )}


      <div className="mt-6 flex items-center justify-between">

        <p className="text-sm text-gray-500">
        Investigation
        </p>

        <Link
        to={`/cases/${caseItem.id}`}
        className="font-medium text-black hover:underline"
        >
        View Case →
        </Link>

      </div>


    </div>
  );
}

export default CaseCard;