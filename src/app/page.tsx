"use client";
import { useState } from "react";
import { getApiUrl, constants } from "@lib/index";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponse("User      > " + message + "\n\n" + "Assistant > ");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch(getApiUrl(constants.routes.api.chat), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
          responseType: "streaming",
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Check if the response is streaming
      if (res.headers.get("content-type")?.includes("text/plain")) {
        const reader = res.body?.getReader();

        if (!reader) {
          throw new Error("Could not get an instance of the reader.");
        }

        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: true });
          setResponse((prev) => prev + chunk);
        }
      } else {
        // Handle default response type
        const data = await res.json();
        setResponse(data.content);
      }
    } catch (error) {
      console.error("Error:", error);
      // @ts-expect-error ignore
      setResponse(`Error: ${error?.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <h1 className="text-4xl font-bold text-center text-gray-100 mb-8">Chat Page</h1>
      <section className="max-w-3xl mx-auto w-full">
        <div className="bg-gray-800 shadow-lg rounded px-8 pt-6 pb-8 mb-4">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              className="px-3 py-2 bg-gray-700 text-white rounded"
              disabled={isLoading} // Disable input during loading
            />
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isLoading} // Disable button during loading
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
          <div className="mt-4 p-3 bg-gray-700 text-white rounded">
            <pre>{response}</pre>
          </div>
        </div>
      </section>
    </main>
  );
}
