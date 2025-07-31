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

export async function* orchestrateColdEmails({
  companyName,
  fromAddress,
  emailSubject,
  emailBody,
  companyWebsite,
  role,
}: OrchestratorParams): AsyncGenerator<ProgressUpdate> {
  console.log(`Starting reachall for: ${companyName}`);

  yield {
    type: "progress",
    step: "scraping",
    message: `Starting LinkedIn scraping for ${companyName}...`,
  };

  const { employees } = await scraper(companyName, role);
  if (!employees || employees.length === 0) {
    const message = `No employees found for ${companyName}.`;
    console.error(message);
    yield { type: "error", step: "scraping", success: false, message };
    return;
  }

  yield {
    type: "progress",
    step: "scraping",
    message: `Found ${employees.length} potential employee(s).`,
  };

  if (!companyWebsite) {
    const message =
      "Company website is required to determine the email domain.";
    console.error(message);
    yield { type: "error", step: "domain", success: false, message };
    return;
  }

  const domain = extractDomain(companyWebsite);
  if (!domain) {
    const message = `Could not determine a valid domain from: ${companyWebsite}`;
    console.error(message);
    yield { type: "error", step: "domain", success: false, message };
    return;
  }

  yield {
    type: "progress",
    step: "domain",
    message: `Using company domain: ${domain}`,
  };

  const possibleEmails = composeEmails(employees, domain);
  if (possibleEmails.length === 0) {
    const message = "Failed to generate any email permutations.";
    console.error(message);
    yield { type: "error", step: "generation", success: false, message };
    return;
  }

  yield {
    type: "progress",
    step: "generation",
    message: `Generated ${possibleEmails.length} possible email addresses.`,
  };

  yield {
    type: "progress",
    step: "verification",
    message: `Verifying ${possibleEmails.length} email addresses...`,
  };

  const verificationResults = await Promise.all(
    possibleEmails.map((email) => verifyEmail(email)),
  );
  const validEmails = verificationResults
    .filter((result) => result.valid)
    .map((result) => result.email);

  if (validEmails.length === 0) {
    const message = "No valid email addresses were found after verification.";
    console.error(message);
    yield {
      type: "error",
      step: "verification",
      success: false,
      message,
      verifiedEmails: [],
    };
    return;
  }

  yield {
    type: "progress",
    step: "verification",
    message: `Verified ${validEmails.length} email(s)`,
    verifiedEmails: validEmails,
  };

  yield {
    type: "progress",
    step: "sending",
    message: `Starting to send emails to ${validEmails.length} recipients...`,
    totalEmails: validEmails.length,
    processedEmails: 0,
  };

  const sentEmails: string[] = [];
  const failedEmails: { email: string; error: any }[] = [];

  for (let i = 0; i < validEmails.length; i++) {
    const email = validEmails[i];

    yield {
      type: "progress",
      step: "sending",
      message: `Sending email to ${email}...`,
      currentEmail: email,
      totalEmails: validEmails.length,
      processedEmails: i,
    };

    try {
      await sendEmail(fromAddress, email, emailSubject, emailBody);
      sentEmails.push(email);

      yield {
        type: "progress",
        step: "sending",
        message: `Successfully sent email to ${email}`,
        currentEmail: email,
        totalEmails: validEmails.length,
        processedEmails: i + 1,
      };
    } catch (error) {
      failedEmails.push({ email, error: (error as Error).message });

      yield {
        type: "progress",
        step: "sending",
        message: `Failed to send email to ${email}: ${(error as Error).message}`,
        currentEmail: email,
        totalEmails: validEmails.length,
        processedEmails: i + 1,
      };
    }
  }

  const summaryMessage = `Process complete. Sent ${sentEmails.length} of ${validEmails.length} emails.`;
  console.log(summaryMessage);

  yield {
    type: "complete",
    step: "complete",
    success: true,
    message: summaryMessage,
    sentEmails,
    failedEmails,
    verifiedEmails: validEmails,
  };
}
