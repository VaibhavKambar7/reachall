export const composeEmails = (companyDomain: string): string[] => {
  const emails: string[] = [];

  const normalize = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ");

  for (const emp of employees) {
    const name = normalize(emp.name);
    const parts = name.split(" ");

    const first = parts[0];
    const last = parts[parts.length - 1];

    const permutations = new Set<string>();

    permutations.add(`${first}@${companyDomain}`);
    permutations.add(`${first}.${last}@${companyDomain}`);
    permutations.add(`${first}${last}@${companyDomain}`);
    permutations.add(`${first}_${last}@${companyDomain}`);

    permutations.forEach((email) => emails.push(email));
  }

  return [...new Set(emails)];
};

const main = async () => {
  const companyDomain = "gushwork.ai";
  const emails = composeEmails(companyDomain);
  console.log(emails);
};

main();
