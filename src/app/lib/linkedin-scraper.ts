import dotenv from "dotenv";
dotenv.config();

export async function scraper(
  company: string,
  role?: string,
): Promise<{ employees: { name: string; title: string; link: string }[] }> {
  const query = `site:linkedin.com/in "${company}" ${role ?? ""}`.trim();
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.error("SERPAPI_KEY is not defined in environment variables.");
    throw new Error("SERPAPI_KEY is not set.");
  }

  const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
    query,
  )}&api_key=${apiKey}`;

  try {
    const res = await fetch(serpUrl);
    const data = await res.json();

    if (!res.ok || !data.organic_results) {
      console.error(
        "Failed to fetch data from SerpAPI:",
        data.error || "Unknown error",
      );
      return { employees: [] };
    }

    const results = data.organic_results.map((item: any) => ({
      name: item.title?.split(" - ")[0]?.trim() ?? "",
      title: item.snippet ?? "",
      link: item.link ?? "",
    }));

    return { employees: results };
  } catch (error) {
    console.error("An error occurred while scraping:", error);
    return { employees: [] };
  }
}
