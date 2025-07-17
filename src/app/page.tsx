"use client";

import { useState, FormEvent } from "react";

interface ApiResponse {
  success: boolean;
  message: string;
  sentEmails?: string[];
  failedEmails?: { email: string; error: any }[];
  verifiedEmails?: string[];
}

export default function Home() {
  const [companyName, setCompanyName] = useState("Bright Money");
  const [companyWebsite, setCompanyWebsite] = useState(
    "https://www.brightmoney.co/",
  );
  const [role, setRole] = useState("Software Engineer");
  const [emailSubject, setEmailSubject] = useState(
    "test email - please ignore",
  );
  const [emailBody, setEmailBody] = useState("test email - please ignore");

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

    if (!companyName || !companyWebsite || !emailSubject || !emailBody) {
      setError("Please fill out all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          companyWebsite,
          role,
          emailSubject,
          emailBody,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An unknown error occurred.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-white mb-6">
          ReachAll Cold Email Automator
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Enter company details to find employees, verify emails, and send
          personalized outreach at scale.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Gushwork"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label
                htmlFor="companyWebsite"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Company Website <span className="text-red-500">*</span>
              </label>
              <input
                id="companyWebsite"
                type="text"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="e.g., gushwork.ai"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Target Role (Optional)
            </label>
            <input
              id="role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Software Engineer"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="emailSubject"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Email Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="emailSubject"
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="emailBody"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Email Body <span className="text-red-500">*</span>
            </label>
            <textarea
              id="emailBody"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Start Outreach"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Results
            </h2>
            <div
              className={`p-4 rounded-md ${result.success ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"}`}
            >
              <p className="font-semibold">{result.message}</p>
            </div>

            {result.verifiedEmails && result.verifiedEmails.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                  Verified Emails ({result.verifiedEmails.length}):
                </h3>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {result.verifiedEmails.map((email) => (
                    <li key={email}>{email}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.sentEmails && result.sentEmails.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                  Successfully Sent To ({result.sentEmails.length}):
                </h3>
                <ul className="list-disc list-inside mt-2 text-sm text-green-600 dark:text-green-400">
                  {result.sentEmails.map((email) => (
                    <li key={email}>{email}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.failedEmails && result.failedEmails.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                  Failed to Send To ({result.failedEmails.length}):
                </h3>
                <ul className="list-disc list-inside mt-2 text-sm text-red-600 dark:text-red-400">
                  {result.failedEmails.map(({ email, error }) => (
                    <li key={email}>
                      {email} - Reason: {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
