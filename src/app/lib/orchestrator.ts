import { scraper } from "./linkedin-scraper";
import { composeEmails } from "./email-generator";
import { verifyEmail } from "./email-verifier";
import { sendEmail } from "./send-email";

function extractDomain(url: string): string | null {
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const hostname = new URL(fullUrl).hostname;
    return hostname.replace(/^www\./, "");
  } catch (error) {
    console.error(`Failed to parse domain from URL: ${url}`, error);
    return null;
  }
}

interface OrchestratorParams {
  companyName: string;
  fromAddress: string;
  emailSubject: string;
  emailBody: string;
  companyWebsite?: string;
  role?: string;
}

interface OrchestratorResult {
  success: boolean;
  message: string;
  sentEmails?: string[];
  failedEmails?: { email: string; error: any }[];
  verifiedEmails?: string[];
}

export async function orchestrateColdEmails({
  companyName,
  fromAddress,
  emailSubject,
  emailBody,
  companyWebsite,
  role,
}: OrchestratorParams): Promise<OrchestratorResult> {
  console.log(`Starting outreach for: ${companyName}`);

  const { employees } = await scraper(companyName, role);
  if (!employees || employees.length === 0) {
    const message = `No employees found for ${companyName}.`;
    console.error(message);
    return { success: false, message };
  }
  console.log(`Found ${employees.length} potential employee(s).`);

  if (!companyWebsite) {
    const message =
      "Company website is required to determine the email domain.";
    console.error(message);
    return { success: false, message };
  }
  const domain = extractDomain(companyWebsite);
  if (!domain) {
    const message = `Could not determine a valid domain from: ${companyWebsite}`;
    console.error(message);
    return { success: false, message };
  }
  console.log(`Using company domain: ${domain}`);

  const possibleEmails = composeEmails(employees, domain);
  if (possibleEmails.length === 0) {
    const message = "Failed to generate any email permutations.";
    console.error(message);
    return { success: false, message };
  }
  console.log(`Generated ${possibleEmails.length} possible email addresses.`);

  console.log("Verifying emails...");
  const verificationResults = await Promise.all(
    possibleEmails.map((email) => verifyEmail(email)),
  );
  const validEmails = verificationResults
    .filter((result) => result.valid)
    .map((result) => result.email);

  if (validEmails.length === 0) {
    const message = "No valid email addresses were found after verification.";
    console.error(message);
    return { success: false, message, verifiedEmails: [] };
  }
  console.log(`Verified ${validEmails.length} email(s):`, validEmails);

  console.log("Sending emails...");
  const sentEmails: string[] = [];
  const failedEmails: { email: string; error: any }[] = [];

  for (const email of validEmails) {
    try {
      await sendEmail(fromAddress, email, emailSubject, emailBody);
      sentEmails.push(email);
    } catch (error) {
      failedEmails.push({ email, error: (error as Error).message });
    }
  }

  const summaryMessage = `Process complete. Sent ${sentEmails.length} of ${validEmails.length} emails.`;
  console.log(summaryMessage);

  return {
    success: true,
    message: summaryMessage,
    sentEmails,
    failedEmails,
    verifiedEmails: validEmails,
  };
}
