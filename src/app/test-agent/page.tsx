"use client";

import { useState } from "react";
import { AgentResponse } from "../../types/agent";

export default function TestAgentPage() {
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/agent/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
          sessionId: sessionId.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);

      // Update session ID for next message
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sales Agent Test
          </h1>
          <p className="text-gray-600 mb-6">
            Test the dynamic guidelines agent with different messages. The agent
            will automatically select relevant guidelines based on your input
            and respond accordingly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="sessionId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Session ID (optional - leave empty for new session)
              </label>
              <input
                type="text"
                id="sessionId"
                value={sessionId}
                onChange={e => setSessionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty for new session"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Message *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Try: 'What does Uptail cost?' or 'I need help with features' or 'I want to schedule a meeting'"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {response && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Agent Response
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">
                  Session ID
                </h3>
                <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                  {response.sessionId}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700">Reply</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900">{response.reply}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Hard Guidelines Used
                  </h3>
                  <ul className="text-sm text-gray-900">
                    {response.hardGuidelinesUsed.length > 0 ? (
                      response.hardGuidelinesUsed.map((id: string) => (
                        <li
                          key={id}
                          className="font-mono bg-red-100 p-1 rounded text-xs"
                        >
                          {id}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">None</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Soft Guidelines Used
                  </h3>
                  <ul className="text-sm text-gray-900">
                    {response.softGuidelinesUsed.length > 0 ? (
                      response.softGuidelinesUsed.map((id: string) => (
                        <li
                          key={id}
                          className="font-mono bg-blue-100 p-1 rounded text-xs"
                        >
                          {id}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">None</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-blue-800 font-medium mb-2">Test Examples</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>
              <strong>Price inquiry:</strong> &ldquo;What does Uptail
              cost?&rdquo; or &ldquo;How much is the pricing?&rdquo;
            </p>
            <p>
              <strong>Feature inquiry:</strong> &ldquo;Can Uptail do X?&rdquo;
              or &ldquo;Does it support Y?&rdquo;
            </p>
            <p>
              <strong>Qualification:</strong> &ldquo;I&rsquo;m looking for a
              solution&rdquo; or &ldquo;I need help with...&rdquo;
            </p>
            <p>
              <strong>Meeting booking:</strong> &ldquo;Yes, I&rsquo;m
              interested&rdquo; or &ldquo;Let&rsquo;s schedule a call&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
