function Timeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No timeline events identified.
      </p>
    );
  }

  return (
    <div className="relative border-l border-gray-300 ml-3 space-y-8">

      {events.map((event, index) => (
        <div key={index} className="relative pl-8">

          {/* Timeline dot */}
          <div className="absolute -left-2 top-1 h-4 w-4 rounded-full bg-black" />

          <div className="rounded-xl bg-white border p-4 shadow-sm">

            <div>
            <div className="flex items-center gap-2">

                <span className="text-sm font-semibold">
                {event.time}
                </span>

                <span className="text-xs rounded-full bg-gray-100 px-2 py-1">
                {event.type}
                </span>

            </div>

            <p className="mt-2 text-sm text-gray-700">
                {event.event}
            </p>
            </div>

          </div>

        </div>
      ))}

    </div>
  );
}

export default Timeline;