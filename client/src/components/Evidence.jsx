const LEVEL_STYLES = {
  High: "bg-green-100 text-green-800",
  Medium: "bg-amber-100 text-amber-800",
  Low: "bg-red-100 text-red-800",
};

function Evidence({ items }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No evidence identified.
      </p>
    );
  }

  return (
    <div className="space-y-4">

      {items.map((evidence, index) => (
        <div
          key={index}
          className="rounded-xl border bg-white p-4"
        >

          <div className="flex justify-between items-start">

  <div>
    <h4 className="font-semibold">
      {evidence.item}
    </h4>

    <p className="text-sm text-gray-500">
      {evidence.type}
    </p>
  </div>


        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            LEVEL_STYLES[evidence.level] || "bg-gray-100 text-gray-700"
          }`}
        >
            {evidence.level}
        </span>

        </div>


        <p className="mt-3 text-xs text-gray-400">
        Confidence: {evidence.confidence} (AI estimate)
        </p>


        <p className="mt-2 text-sm text-gray-700">
        <strong>Reasoning:</strong> {evidence.reasoning}
        </p>


        <p className="mt-2 text-sm text-gray-700">
        <strong>Impact:</strong> {evidence.impact}
        </p>

        </div>
      ))}

    </div>
  );
}

export default Evidence;