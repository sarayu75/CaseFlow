function RiskScore({ risk }) {

  if (!risk) return null;

  return (
    <div className="rounded-xl bg-white border p-5">

      <h3 className="mb-4 font-semibold">
        Case Risk Assessment
      </h3>

      <div className="flex items-end gap-3">

        <div>
          <p className="text-sm text-gray-500">
            Risk Level
          </p>

          <p className="text-3xl font-bold text-red-600">
            {risk.level}
          </p>
        </div>

        <p className="text-sm text-gray-400 pb-1">
          ~{risk.score}% (AI estimate)
        </p>

      </div>


      <div className="mt-5">

        <h4 className="font-medium mb-2">
          Risk Factors
        </h4>

        <ul className="space-y-2 text-sm text-gray-700">

          {risk.factors.map((factor,index)=>(
            <li key={index}>
              ⚠ {factor}
            </li>
          ))}

        </ul>

      </div>

    </div>
  );
}

export default RiskScore;