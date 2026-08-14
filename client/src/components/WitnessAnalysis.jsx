function WitnessAnalysis({ witnesses }) {

  if (!witnesses || witnesses.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-white border p-5">

      <h3 className="mb-5 font-semibold">
        Witness Analysis
      </h3>


      <div className="space-y-5">

        {witnesses.map((witness, index) => (

          <div
            key={index}
            className="rounded-lg border bg-slate-50 p-4"
          >

            <div className="flex justify-between">

              <h4 className="font-medium">
                👤 {witness.name}
              </h4>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                {witness.credibility}
              </span>

            </div>


            <div className="mt-4">

              <p className="font-medium text-sm">
                Strengths
              </p>

              <ul className="text-sm text-gray-700">
                {witness.strengths.map((item,i)=>(
                  <li key={i}>
                    ✓ {item}
                  </li>
                ))}
              </ul>

            </div>


            <div className="mt-3">

              <p className="font-medium text-sm">
                Concerns
              </p>

              <ul className="text-sm text-gray-700">
                {witness.concerns.map((item,i)=>(
                  <li key={i}>
                    ⚠ {item}
                  </li>
                ))}
              </ul>

            </div>


            <div className="mt-3">

              <p className="font-medium text-sm">
                Follow Up
              </p>

              <ul className="text-sm text-gray-700">
                {witness.followUp.map((item,i)=>(
                  <li key={i}>
                    → {item}
                  </li>
                ))}
              </ul>

            </div>


          </div>

        ))}

      </div>

    </div>
  );
}

export default WitnessAnalysis;