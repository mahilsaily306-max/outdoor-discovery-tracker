import { NextRequest, NextResponse } from "next/server";
import {
  SYSTEM_MISSION_PROMPT,
  SYSTEM_REFLECTION_PROMPT,
  buildMissionUserPrompt,
  buildReflectionUserPrompt,
} from "@/lib/ai/prompts";
import {
  AIMissionRawOutputSchema,
  JournalReflectionRawSchema,
  MissionRequestSchema,
  ReflectionRequestSchema,
} from "@/lib/schemas/mission";

const DEFAULT_OLLAMA_BASE = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma2:2b";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const baseUrl = searchParams.get("baseUrl") || DEFAULT_OLLAMA_BASE;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { isAvailable: false, message: `Ollama returned HTTP ${res.status}` },
        { status: 200 }
      );
    }

    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models.map((m: { name: string }) => m.name) : [];

    return NextResponse.json({
      isAvailable: true,
      message: "Ollama instance connected",
      modelsFound: models,
      configuredModel: DEFAULT_OLLAMA_MODEL,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      isAvailable: false,
      message: `Cannot reach Ollama at ${baseUrl} (${errorMsg}). Make sure 'ollama serve' is running.`,
      modelsFound: [],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = "generate",
      request,
      model = DEFAULT_OLLAMA_MODEL,
      baseUrl = DEFAULT_OLLAMA_BASE,
    } = body;

    if (action === "reflect") {
      const validatedRefReq = ReflectionRequestSchema.safeParse(request);
      if (!validatedRefReq.success) {
        return NextResponse.json(
          { error: "Invalid reflection request parameters", details: validatedRefReq.error.format() },
          { status: 400 }
        );
      }

      const userPrompt = buildReflectionUserPrompt(validatedRefReq.data);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);

      const ollamaPayload = {
        model,
        prompt: `${SYSTEM_REFLECTION_PROMPT}\n\n${userPrompt}`,
        format: "json",
        stream: false,
        options: { temperature: 0.6, top_p: 0.9 },
      };

      const res = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ollamaPayload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json(
          { error: `Ollama reflection call failed: ${errText}`, providerError: true },
          { status: 502 }
        );
      }

      const ollamaResponse = await res.json();
      const rawContent = ollamaResponse.response;

      let parsedJSON: unknown;
      try {
        parsedJSON = JSON.parse(rawContent);
      } catch {
        const cleaned = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedJSON = JSON.parse(cleaned);
      }

      const schemaValidation = JournalReflectionRawSchema.safeParse(parsedJSON);
      if (!schemaValidation.success) {
        return NextResponse.json(
          {
            error: "Ollama returned JSON that did not match the reflection schema",
            details: schemaValidation.error.format(),
            raw: rawContent,
          },
          { status: 422 }
        );
      }

      return NextResponse.json({
        success: true,
        data: schemaValidation.data,
        modelUsed: model,
      });
    }

    // Default action: generate mission
    const validatedReq = MissionRequestSchema.safeParse(request);
    if (!validatedReq.success) {
      return NextResponse.json(
        { error: "Invalid mission request parameters", details: validatedReq.error.format() },
        { status: 400 }
      );
    }

    const userPrompt = buildMissionUserPrompt(validatedReq.data);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);

    const ollamaPayload = {
      model,
      prompt: `${SYSTEM_MISSION_PROMPT}\n\n${userPrompt}`,
      format: "json",
      stream: false,
      options: {
        temperature: 0.6,
        top_p: 0.9,
      },
    };

    const res = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ollamaPayload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          error: `Ollama call failed with HTTP ${res.status}: ${errText}`,
          providerError: true,
        },
        { status: 502 }
      );
    }

    const ollamaResponse = await res.json();
    const rawContent = ollamaResponse.response;

    let parsedJSON: unknown;
    try {
      parsedJSON = JSON.parse(rawContent);
    } catch {
      const cleaned = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedJSON = JSON.parse(cleaned);
    }

    const schemaValidation = AIMissionRawOutputSchema.safeParse(parsedJSON);
    if (!schemaValidation.success) {
      return NextResponse.json(
        {
          error: "Ollama returned JSON that did not match the mission schema",
          details: schemaValidation.error.format(),
          raw: rawContent,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: schemaValidation.data,
      modelUsed: model,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: `Ollama connection failed: ${errorMsg}`,
        hint: "Check that Ollama is running and that the model is installed (`ollama run gemma2:2b`).",
      },
      { status: 503 }
    );
  }
}
