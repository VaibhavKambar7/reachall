export const composeEmails = (
  employees: { name: string }[],
  companyDomain: string,
): string[] => {
  const emails = new Set<string>();

  const normalize = (str: string): string =>
    str
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ");

  for (const emp of employees) {
    if (!emp.name) continue;
    const name = normalize(emp.name);
    if (!name) continue;
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) continue;
    const first = parts[0];
    const last = parts.length > 1 ? parts[parts.length - 1] : "";
    emails.add(`${first}@${companyDomain}`);
    if (last) {
      emails.add(`${first}.${last}@${companyDomain}`);
      emails.add(`${first}${last}@${companyDomain}`);
      emails.add(`${first}_${last}@${companyDomain}`);
      emails.add(`${first[0]}${last}@${companyDomain}`);
      emails.add(`${first}${last[0]}@${companyDomain}`);
    }
    if (parts.length > 2) {
      const middle = parts.slice(1, -1).join("");
      emails.add(`${first}.${middle}.${last}@${companyDomain}`);
    }
  }
  return Array.from(emails);
};
