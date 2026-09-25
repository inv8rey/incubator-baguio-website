/**
 * Pulls complete idea objects out of a streaming tool-call JSON body shaped
 * like {"ideas":[{...},{...}]}. Feed it the partial JSON text as it arrives;
 * it returns each idea object the moment its closing brace is seen.
 */
export class IdeaStreamParser {
  private depth = 0;
  private inString = false;
  private escaped = false;
  private start = -1;
  private buf = '';

  feed(chunk: string): unknown[] {
    const out: unknown[] = [];
    for (const ch of chunk) {
      const pos = this.buf.length;
      this.buf += ch;
      if (this.inString) {
        if (this.escaped) this.escaped = false;
        else if (ch === '\\') this.escaped = true;
        else if (ch === '"') this.inString = false;
        continue;
      }
      if (ch === '"') {
        this.inString = true;
      } else if (ch === '{' || ch === '[') {
        this.depth++;
        // Depth 3 opening brace = the start of one idea inside root { "ideas": [ ... ] }.
        if (ch === '{' && this.depth === 3) this.start = pos;
      } else if (ch === '}' || ch === ']') {
        if (ch === '}' && this.depth === 3 && this.start >= 0) {
          try {
            out.push(JSON.parse(this.buf.slice(this.start, pos + 1)));
          } catch {
            // A malformed idea is skipped; the caller tops up if too few survive.
          }
          this.start = -1;
        }
        this.depth--;
      }
    }
    return out;
  }
}
