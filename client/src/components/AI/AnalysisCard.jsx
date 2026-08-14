function AnalysisCard({ title, items, emptyMessage, bullet = "•" }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-semibold text-gray-900">
        {title}
      </h3>

      {items.length > 0 ? (
        <ul className="space-y-2 text-sm text-gray-700">
          {items.map((item, index) => (
            <li key={index}>
              {bullet} {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

export default AnalysisCard;