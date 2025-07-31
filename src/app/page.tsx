"use client";
import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Moon,
  Sun,
  Check,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
// import { useTheme } from "./theme-provider";

interface ApiResponse {
  success: boolean;
  message: string;
  sentEmails?: string[];
  failedEmails?: { email: string; error: any }[];
  verifiedEmails?: string[];
}

interface ProgressUpdate {
  type: "progress" | "complete" | "error";
  step: string;
  message: string;
  success?: boolean;
  sentEmails?: string[];
  failedEmails?: { email: string; error: any }[];
  verifiedEmails?: string[];
  currentEmail?: string;
  totalEmails?: number;
  processedEmails?: number;
}

export default function Home() {
  // const { theme, toggleTheme } = useTheme();
  const [companyName, setCompanyName] = useState("Bright Money");
  const [companyWebsite, setCompanyWebsite] = useState(
    "https://www.brightmoney.co/",
  );
  const [role, setRole] = useState("Software Engineer");
  const [emailSubject, setEmailSubject] = useState(
    "test email - please ignore",
  );
  const [emailBody, setEmailBody] = useState(
    "<p>This is a test email, please ignore.</p>",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const editorRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (theme === "dark") {
  //     document.documentElement.classList.add("dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //   }
  // }, [theme]);

  // const toggleTheme = () => {
  //   setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  // };

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setProgressUpdates([]);
    setCurrentStep("");
    setCompletedSteps(new Set());
    setShowModal(true);

    if (!companyName || !companyWebsite || !emailSubject || !emailBody) {
      setError("Please fill out all required fields.");
      setIsLoading(false);
      setShowModal(false);
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

      if (!response.ok) {
        throw new Error("Failed to start the process");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data: ProgressUpdate = JSON.parse(line.slice(6));

              setProgressUpdates((prev) => [...prev, data]);
              setCurrentStep(data.step);

              if (
                (data.type === "progress" && data.message.includes("Found")) ||
                data.message.includes("Using") ||
                data.message.includes("Generated") ||
                data.message.includes("Verified") ||
                data.message.includes("Successfully sent")
              ) {
                setCompletedSteps((prev) => new Set([...prev, data.step]));
              }

              if (data.type === "complete") {
                setCompletedSteps((prev) => new Set([...prev, "complete"]));
                setResult({
                  success: data.success || true,
                  message: data.message,
                  sentEmails: data.sentEmails,
                  failedEmails: data.failedEmails,
                  verifiedEmails: data.verifiedEmails,
                });
              } else if (data.type === "error") {
                setError(data.message);
              }
            } catch (parseError) {
              console.error("Failed to parse SSE data:", parseError);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      setEmailBody(editorRef.current.innerHTML);
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setEmailBody(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = emailBody;
    }
  }, []);

  const steps = [
    {
      key: "scraping",
      label: "LinkedIn Scraping",
      description: "Finding employees on LinkedIn",
    },
    {
      key: "domain",
      label: "Domain Extraction",
      description: "Extracting company domain",
    },
    {
      key: "generation",
      label: "Email Generation",
      description: "Generating possible email addresses",
    },
    {
      key: "verification",
      label: "Email Verification",
      description: "Verifying email addresses",
    },
    {
      key: "sending",
      label: "Email Sending",
      description: "Sending emails to verified addresses",
    },
    {
      key: "complete",
      label: "Complete",
      description: "Process finished successfully",
    },
  ];

  const getStepStatus = (stepKey: string) => {
    if (completedSteps.has(stepKey)) return "completed";
    if (currentStep === stepKey) return "current";
    return "pending";
  };

  const closeModal = () => {
    setShowModal(false);
    setProgressUpdates([]);
    setCurrentStep("");
    setCompletedSteps(new Set());
  };

  return (
    <main
      className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 md:p-8 dark:bg-[#1e1e1e] dark:text-[#cccccc] transition-colors duration-300"
      style={{ fontFamily: 'Consolas, "Courier New", monospace' }}
    >
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 border-b border-gray-200 pb-8 dark:border-b-[#333333]">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2 dark:text-yellow-500">
                REACHALL
              </h1>
              <p className="text-gray-600 dark:text-yellow-500">
                Automated email outreach system for enterprise contact discovery
              </p>
            </div>
            {/* <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-[#2d2d30]"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button> */}
          </div>
        </header>

        <div className="space-y-8 bg-white p-8 sm:p-10 border border-gray-200 shadow-sm dark:bg-[#252526] dark:border-[#333333]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 mb-2 dark:text-yellow-500"
              >
                Company Name{" "}
                <span className="text-red-500 dark:text-[#f48771]">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-[#1e1e1e] dark:border-[#333333] dark:text-[#cccccc] dark:focus:border-yellow-500 dark:focus:ring-yellow-500 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="companyWebsite"
                className="block text-sm font-medium text-gray-700 mb-2 dark:text-yellow-500"
              >
                Company Website{" "}
                <span className="text-red-500 dark:text-[#f48771]">*</span>
              </label>
              <input
                id="companyWebsite"
                type="text"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-[#1e1e1e] dark:border-[#333333] dark:text-[#cccccc] dark:focus:border-yellow-500 dark:focus:ring-yellow-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2 dark:text-yellow-500"
            >
              Target Role (Optional)
            </label>
            <input
              id="role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-[#1e1e1e] dark:border-[#333333] dark:text-[#cccccc] dark:focus:border-yellow-500 dark:focus:ring-yellow-500 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="emailSubject"
              className="block text-sm font-medium text-gray-700 mb-2 dark:text-yellow-500"
            >
              Email Subject{" "}
              <span className="text-red-500 dark:text-[#f48771]">*</span>
            </label>
            <input
              id="emailSubject"
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-[#1e1e1e] dark:border-[#333333] dark:text-[#cccccc] dark:focus:border-yellow-500 dark:focus:ring-yellow-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-yellow-500">
              Email Message{" "}
              <span className="text-red-500 dark:text-[#f48771]">*</span>
            </label>
            <div className="border border-gray-300 bg-gray-50 dark:border-[#333333] dark:bg-[#2d2d30]">
              <div className="p-2 flex items-center gap-1 flex-wrap border-b border-gray-300 dark:border-b-[#333333]">
                <button
                  type="button"
                  onClick={() => execCommand("bold")}
                  className="p-2 text-gray-600 hover:bg-gray-200 dark:text-[#cccccc] dark:hover:bg-[#094771]"
                  title="Bold"
                >
                  <Bold size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand("italic")}
                  className="p-2 text-gray-600 hover:bg-gray-200 dark:text-[#cccccc] dark:hover:bg-[#094771]"
                  title="Italic"
                >
                  <Italic size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand("underline")}
                  className="p-2 text-gray-600 hover:bg-gray-200 dark:text-[#cccccc] dark:hover:bg-[#094771]"
                  title="Underline"
                >
                  <Underline size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-[#333333] mx-2"></div>
                <button
                  type="button"
                  onClick={() => execCommand("insertUnorderedList")}
                  className="p-2 text-gray-600 hover:bg-gray-200 dark:text-[#cccccc] dark:hover:bg-[#094771]"
                  title="Bullet List"
                >
                  <List size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand("insertOrderedList")}
                  className="p-2 text-gray-600 hover:bg-gray-200 dark:text-[#cccccc] dark:hover:bg-[#094771]"
                  title="Numbered List"
                >
                  <ListOrdered size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-[#333333] mx-2"></div>
                <button
                  type="button"
                  onClick={() => execCommand("justifyLeft")}
                  className="p-2 text-gray-600 hover:bg-gray-200 dark:text-[#cccccc] dark:hover:bg-[#094771]"
                  title="Align Left"
                >
                  <AlignLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand("justifyCenter")}
                  className="p-2 text-gray-600 hover:bg-gray-200 dark:text-[#cccccc] dark:hover:bg-[#094771]"
                  title="Align Center"
                >
                  <AlignCenter size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand("justifyRight")}
                  className="p-2 text-gray-600 hover:bg-gray-200 dark:text-[#cccccc] dark:hover:bg-[#094771]"
                  title="Align Right"
                >
                  <AlignRight size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-[#333333] mx-2"></div>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt("Enter URL:");
                    if (url) execCommand("createLink", url);
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-200 dark:text-[#cccccc] dark:hover:bg-[#094771]"
                  title="Insert Link"
                >
                  <Link size={18} />
                </button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorChange}
                className="w-full min-h-[250px] px-4 py-3 bg-white text-gray-900 focus:outline-none text-base leading-relaxed dark:bg-[#1e1e1e] dark:text-[#cccccc]"
                suppressContentEditableWarning={true}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-t-[#333333]">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold hover:cursor-pointer hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-yellow-200 disabled:text-gray-500 disabled:cursor-not-allowed text-base dark:bg-yellow-400 dark:text-gray-900 dark:hover:bg-yellow-500 dark:focus:ring-yellow-500 dark:disabled:bg-yellow-200 dark:disabled:text-gray-500 transition-colors"
            >
              {isLoading
                ? currentStep
                  ? `Processing: ${currentStep}...`
                  : "Processing..."
                : "Execute Reachall"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-300 text-red-700 dark:bg-[#3c1e1e] dark:border-[#f48771] dark:text-[#f48771]">
            <div className="text-sm">
              <span className="font-semibold text-red-800 dark:text-[#f48771]">
                Error:
              </span>{" "}
              {error}
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 p-8 bg-white border border-gray-200 shadow-sm dark:bg-[#252526] dark:border-[#333333]">
            <div className="text-gray-500 text-sm mb-6 dark:text-[#6a9955]">
              /* Execution Results */
            </div>
            <div
              className={`p-4 border-l-4 mb-6 ${result.success ? "bg-green-50 border-green-500 text-green-800 dark:bg-[#1e3a1e] dark:border-yellow-500 dark:text-yellow-500" : "bg-red-50 border-red-500 text-red-800 dark:bg-[#3c1e1e] dark:border-[#f48771] dark:text-[#f48771]"}`}
            >
              <div className="font-semibold">
                Status: {result.success ? "SUCCESS" : "FAILED"}
              </div>
              <div className="mt-1">{result.message}</div>
            </div>

            {result.verifiedEmails && result.verifiedEmails.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-800 mb-2 dark:text-yellow-500">
                  Verified Emails ({result.verifiedEmails.length}):
                </h3>
                <div className="bg-gray-50 border border-gray-200 p-3 max-h-40 overflow-y-auto dark:bg-[#1e1e1e] dark:border-[#333333]">
                  {result.verifiedEmails.map((email, index) => (
                    <div
                      key={email}
                      className="text-sm text-gray-700 py-1.5 border-b border-gray-200 last:border-b-0 dark:text-[#cccccc] dark:border-b-[#333333]"
                    >
                      {String(index + 1).padStart(2, "0")}. {email}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.sentEmails && result.sentEmails.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-800 mb-2 dark:text-yellow-500">
                  Successfully Sent ({result.sentEmails.length}):
                </h3>
                <div className="bg-gray-50 border border-gray-200 p-3 max-h-40 overflow-y-auto dark:bg-[#1e1e1e] dark:border-[#333333]">
                  {result.sentEmails.map((email, index) => (
                    <div
                      key={email}
                      className="text-sm text-green-700 py-1.5 border-b border-gray-200 last:border-b-0 dark:text-yellow-500 dark:border-b-[#333333]"
                    >
                      {String(index + 1).padStart(2, "0")}. {email}{" "}
                      <span className="font-semibold">[SENT]</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.failedEmails && result.failedEmails.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-gray-800 mb-2 dark:text-yellow-500">
                  Failed to Send ({result.failedEmails.length}):
                </h3>
                <div className="bg-gray-50 border border-gray-200 p-3 max-h-40 overflow-y-auto dark:bg-[#1e1e1e] dark:border-[#333333]">
                  {result.failedEmails.map(({ email, error }, index) => (
                    <div
                      key={email}
                      className="text-sm text-red-700 py-1.5 border-b border-gray-200 last:border-b-0 dark:text-[#f48771] dark:border-b-[#333333]"
                    >
                      {String(index + 1).padStart(2, "0")}. {email}{" "}
                      <span className="font-semibold">
                        [ERROR: {String(error)}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#252526] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-[#333333] flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-yellow-500">
                  Email Reachall Progress
                </h2>
                {!isLoading && (
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const status = getStepStatus(step.key);
                    const isActive = currentStep === step.key;

                    return (
                      <div
                        key={step.key}
                        className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 ${
                          status === "completed"
                            ? "bg-green-50 dark:bg-green-900/20"
                            : isActive
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "bg-gray-50 dark:bg-gray-800/50"
                        }`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {status === "completed" ? (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Check size={16} className="text-white" />
                            </div>
                          ) : isActive ? (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Loader2
                                size={16}
                                className="text-white animate-spin"
                              />
                            </div>
                          ) : error && currentStep === step.key ? (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <AlertCircle size={16} className="text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-600 dark:text-gray-300">
                                {index + 1}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            className={`text-sm font-medium ${
                              status === "completed"
                                ? "text-green-800 dark:text-green-300"
                                : isActive
                                  ? "text-blue-800 dark:text-blue-300"
                                  : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {step.label}
                          </h3>
                          <p
                            className={`text-xs mt-1 ${
                              status === "completed"
                                ? "text-green-600 dark:text-green-400"
                                : isActive
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {step.description}
                          </p>

                          {isActive && progressUpdates.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                              {
                                progressUpdates[progressUpdates.length - 1]
                                  ?.message
                              }
                            </div>
                          )}

                          {step.key === "sending" && isActive && (
                            <div className="mt-2">
                              {progressUpdates
                                .filter(
                                  (update) =>
                                    update.step === "sending" &&
                                    update.totalEmails,
                                )
                                .slice(-1)
                                .map((update, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center space-x-2"
                                  >
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${((update.processedEmails || 0) / (update.totalEmails || 1)) * 100}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      {update.processedEmails}/
                                      {update.totalEmails}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle
                        size={20}
                        className="text-red-500 flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                          Process Failed
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {result && result.success && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Check
                        size={20}
                        className="text-green-500 flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
                          Process Completed Successfully
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          {result.message}
                        </p>
                        {result.sentEmails && result.sentEmails.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-2">
                              Successfully sent to {result.sentEmails.length}{" "}
                              recipients:
                            </p>
                            <div className="max-h-32 overflow-y-auto">
                              {result.sentEmails.map((email, index) => (
                                <div
                                  key={email}
                                  className="text-xs text-green-700 dark:text-green-400 py-1"
                                >
                                  {index + 1}. {email}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#1e1e1e]">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-yellow-400 text-gray-900 font-medium rounded hover:bg-yellow-500 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
