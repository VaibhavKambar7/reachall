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
} from "lucide-react";
// import { useTheme } from "./theme-provider";

interface ApiResponse {
  success: boolean;
  message: string;
  sentEmails?: string[];
  failedEmails?: { email: string; error: any }[];
  verifiedEmails?: string[];
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
    "<p>This is a test email, please ignore.</p><p>You can use the toolbar above to <b>format</b> your message.</p>",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
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
              {isLoading ? "Processing..." : "Execute Outreach"}
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
      </div>
    </main>
  );
}
