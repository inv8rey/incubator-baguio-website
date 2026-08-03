import { getDocumentProxy, extractText } from "unpdf";
import type { SupabaseClient } from "@supabase/supabase-js";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";

const CHUNK_CHARS = 1000;
const OVERLAP_CHARS = 150;
const MIN_CHUNK_CHARS = 20;
const EMBED_BATCH_SIZE = 50;

// Paragraph-aware packing: keeps whole paragraphs together up to the target
// size, carries a trailing overlap into the next chunk so a fact split
// across a boundary isn't lost to retrieval, and hard-splits any single
// paragraph that alone exceeds the target (e.g. unbroken OCR text).
export function chunkText(text: string, opts?: { chunkChars?: number; overlapChars?: number }): string[] {
  const chunkChars = opts?.chunkChars ?? CHUNK_CHARS;
  const overlapChars = opts?.overlapChars ?? OVERLAP_CHARS;

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    const trimmed = current.trim();
    if (trimmed.length >= MIN_CHUNK_CHARS) chunks.push(trimmed);
    current = "";
  };

  for (const paragraph of paragraphs) {
    let remaining = paragraph;
    while (remaining.length > chunkChars) {
      if (current.length) pushCurrent();
      chunks.push(remaining.slice(0, chunkChars));
      remaining = remaining.slice(chunkChars - overlapChars);
    }

    if (current.length + remaining.length + 1 > chunkChars) {
      const tail = current.slice(Math.max(0, current.length - overlapChars));
      pushCurrent();
      current = tail ? `${tail} ${remaining}` : remaining;
    } else {
      current = current ? `${current} ${remaining}` : remaining;
    }
  }
  pushCurrent();

  return chunks;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) throw new Error("Chat isn't configured yet.");

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${EMBEDDING_MODEL}`;
  const attempt = async () =>
    fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: texts }),
    });

  let res = await attempt();
  if (!res.ok) {
    await new Promise((r) => setTimeout(r, 500));
    res = await attempt();
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Workers AI embedding request failed (${res.status}). ${detail}`);
  }

  const data = await res.json();
  const vectors: number[][] | undefined = data?.result?.data;
  if (!vectors) throw new Error("Workers AI returned no embeddings.");
  return vectors;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBED_BATCH_SIZE);
    const vectors = await embedBatch(batch);
    out.push(...vectors);
  }
  return out;
}

export async function processChatbotDocument(
  documentId: string,
  supabase: SupabaseClient
): Promise<{ chunkCount: number }> {
  const { data: doc, error: docErr } = await supabase
    .from("chatbot_documents")
    .select("id,storage_path")
    .eq("id", documentId)
    .single();
  if (docErr || !doc) throw new Error("Document not found.");

  await supabase.from("chatbot_documents").update({ status: "processing" }).eq("id", documentId);

  try {
    const { data: fileBlob, error: downloadErr } = await supabase.storage
      .from("chatbot-documents")
      .download(doc.storage_path);
    if (downloadErr || !fileBlob) throw new Error(downloadErr?.message || "Couldn't download the uploaded file.");

    const buffer = new Uint8Array(await fileBlob.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });

    const chunks = chunkText(text);
    if (!chunks.length) throw new Error("No extractable text found in this PDF (it may be a scanned image).");

    const embeddings = await embedTexts(chunks);

    await supabase.from("chatbot_document_chunks").delete().eq("document_id", documentId);

    const rows = chunks.map((content, i) => ({
      document_id: documentId,
      chunk_index: i,
      content,
      char_count: content.length,
      embedding: embeddings[i],
    }));
    const { error: insertErr } = await supabase.from("chatbot_document_chunks").insert(rows);
    if (insertErr) throw new Error(insertErr.message);

    await supabase
      .from("chatbot_documents")
      .update({ status: "ready", chunk_count: rows.length, error_message: "", updated_at: new Date().toISOString() })
      .eq("id", documentId);

    return { chunkCount: rows.length };
  } catch (err: any) {
    const message = String(err?.message || "Processing failed.").slice(0, 300);
    await supabase
      .from("chatbot_documents")
      .update({ status: "error", error_message: message, updated_at: new Date().toISOString() })
      .eq("id", documentId);
    throw err;
  }
}
