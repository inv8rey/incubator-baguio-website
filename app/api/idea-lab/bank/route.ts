import { listBank, storeConfigured } from '../../../../lib/idea-lab/store';
import { json } from '../../../../lib/idea-lab/http';
import { publicIdea } from '../../../../lib/idea-lab/service';

// Public: approved shared ideas only, anonymized unless the person chose to show a name.
export async function GET(req: Request) {
  if (!storeConfigured()) return json({ items: [] });
  const q = new URL(req.url).searchParams;
  const items = await listBank({ type: q.get('type') || undefined, area: q.get('area') || undefined, program: q.get('program') || undefined, difficulty: q.get('difficulty') || undefined });
  return json({
    items: items.map((b) => ({
      shared_id: b.shared_id,
      shared_at: b.shared_at,
      display_name: b.display_name,
      school: b.school,
      project_type: b.project_type,
      program: b.program,
      priority_area: b.priority_area,
      idea: publicIdea(b.idea as unknown as Record<string, unknown>),
    })),
  });
}
