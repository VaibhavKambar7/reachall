import dotenv from "dotenv";
dotenv.config();

export async function scraper() {
  const company = "Gushwork";
  const role = "Software Engineer";

  const query = `site:linkedin.com/in "${company}" ${role ?? ""}`;
  const apiKey = process.env.SERPAPI_KEY;
  const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${apiKey}`;

  const res = await fetch(serpUrl);
  const data = await res.json();

  console.log("Data++++++", data);

  const results = (data.organic_results || []).map((item: any) => ({
    name: item.title?.split(" - ")[0],
    title: item.snippet || "",
    link: item.link,
  }));

  return { employees: results };
}

const main = async () => {
  const { employees } = await scraper();
  console.log(employees);
};

main();
