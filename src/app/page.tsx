"use client";
import { useState, useRef } from "react";
import { useChat } from "ai/react";
import { getApiUrl } from "@lib/api.ts";
import { constants } from "@lib/constants.ts";
import Image from "next/image";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: getApiUrl(constants.routes.api.chat),
    keepLastMessageOnError: true,
    onError(error) {
      console.log("error", error);
    },
  });
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // console.log("page -> input", input, "messages", messages);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow overflow-y-auto p-4">
        {/* Messages container */}
        <div className="max-w-3xl mx-auto">
          {messages.map((m) => (
            <div key={m.id} className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}>
              <div className={`inline-block p-2 rounded-lg ${m.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}>
                <strong>{m.role === "user" ? "User: " : "AI: "}</strong>
                <div className="whitespace-pre-wrap">{m.content}</div>
                {m?.experimental_attachments
                  ?.filter((attachment) => attachment?.contentType?.startsWith("image/"))
                  .map((attachment, index) => (
                    <Image
                      key={`${m.id}-${index}`}
                      src={attachment.url}
                      width={500}
                      height={300}
                      alt={attachment.name ?? "image"}
                      className="mt-2"
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <form
          className="max-w-3xl mx-auto p-4 bg-white border-t border-gray-200 shadow-md"
          onSubmit={(event) => {
            handleSubmit(event, {
              experimental_attachments: files,
            });

            setFiles(undefined);

            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="file"
              className="hidden"
              onChange={(event) => {
                if (event.target.files) {
                  setFiles(event.target.files);
                }
              }}
              multiple
              ref={fileInputRef}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
            <input
              className="flex-grow p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={input}
              placeholder="Send a message..."
              onChange={handleInputChange}
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          {files && (
            <div className="text-sm text-gray-500">
              {Array.from(files)
                .map((file) => file.name)
                .join(", ")}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
