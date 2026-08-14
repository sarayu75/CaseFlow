import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function NewCase({ fetchCases }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const navigate = useNavigate();

    async function handleSubmit() {
        if (!title.trim() || !content.trim()) {
            alert("Please fill out both fields.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cases`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                content,
            }),
            });

            if (!response.ok) {
            throw new Error("Failed to create case");
            }

            await fetchCases();

            navigate("/");

        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        }
    }

    return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">

        <h1 className="text-4xl font-bold">
          Create New Case
        </h1>

        <p className="mt-2 mb-8 text-gray-600">
          Start a new legal workspace.
        </p>

        <div className="space-y-6">

          <div>
            <label className="mb-2 block font-medium">
              Case Title
            </label>

            <input
              type="text"
              placeholder="Smith v. Jones"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Case Description
            </label>

            <textarea
              rows="10"
              placeholder="Paste witness statements, police reports, or case notes..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800"
          >
            Create Workspace
          </button>

        </div>

      </div>
    </div>
  );
}

export default NewCase;