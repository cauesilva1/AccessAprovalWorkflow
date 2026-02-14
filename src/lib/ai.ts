export async function generateSummary(
  title: string,
  description: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set");
    return "";
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:free",
        messages: [
          {
            role: "system",
            content:
              "You summarize internal company requests in one short professional sentence.",
          },
          {
            role: "user",
            content: `Title: ${title}\nDescription: ${description}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("OpenRouter API error:", res.status, await res.text());
      return "";
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    return content ?? "";
  } catch (err) {
    console.error("generateSummary error:", err);
    return "";
  }
}
