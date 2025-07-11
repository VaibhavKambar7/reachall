import dns from "dns";
import net from "net";
import { validate as isValidEmail } from "email-validator";

export async function verifyEmail(email: string): Promise<{
  email: string;
  valid: boolean;
  reason?: string;
}> {
  if (!isValidEmail(email)) {
    return { email, valid: false, reason: "Invalid email format" };
  }

  const domain = email.split("@")[1];

  const mxRecords = await new Promise<dns.MxRecord[]>((resolve, reject) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || addresses.length === 0) reject("No MX records");
      else resolve(addresses.sort((a, b) => a.priority - b.priority));
    });
  }).catch(() => []);

  if (!mxRecords || mxRecords.length === 0) {
    return { email, valid: false, reason: "No MX records" };
  }

  const mxHost = mxRecords[0].exchange;

  return new Promise((resolve) => {
    const socket = net.createConnection(25, mxHost);
    let stage = 0;

    socket.setEncoding("ascii");
    socket.setTimeout(5000);

    socket.on("data", (data) => {
      if (stage === 0 && data.includes("220")) {
        socket.write("HELO test.com\r\n");
        stage++;
      } else if (stage === 1 && data.includes("250")) {
        socket.write("MAIL FROM:<test@test.com>\r\n");
        stage++;
      } else if (stage === 2 && data.includes("250")) {
        socket.write(`RCPT TO:<${email}>\r\n`);
        stage++;
      } else if (stage === 3) {
        if (data.includes("250")) {
          resolve({ email, valid: true });
        } else {
          resolve({ email, valid: false, reason: "Rejected by server" });
        }
        socket.write("QUIT\r\n");
        socket.end();
      }
    });

    socket.on("timeout", () => {
      resolve({ email, valid: false, reason: "Timeout" });
      socket.destroy();
    });

    socket.on("error", () => {
      resolve({ email, valid: false, reason: "SMTP error" });
    });
  });
}

const main = async () => {
  const filtered_emails: string[] = [];

  Promise.all(
    emails.map((email) =>
      verifyEmail(email).then((res) => {
        if (res.valid) {
          filtered_emails.push(res.email);
        }
      }),
    ),
  ).then(() => {
    console.log(filtered_emails);
  });
};

main();
