// Run with: npm run test:security
// Unit tests for the security helpers added in the October 2026 audit
// (see SECURITY_AUDIT.md). Each test names the issue it guards against.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { safeRedirect } from '../lib/safeRedirect';
import { escapeHtml, escapeFields, safeUrl } from '../lib/html';
import { isBlockedHost } from '../lib/ssrfGuard';
import { friendlyError, storageErrorMessage } from '../lib/friendlyError';

const quiet = () => { const e = console.error; console.error = () => {}; return () => { console.error = e; }; };

test('open redirect: only same-site paths are followed after login', () => {
  const fb = '/dashboard/';
  assert.equal(safeRedirect('/idea-lab/', fb), '/idea-lab/');
  assert.equal(safeRedirect('/idea-lab/?x=1#top', fb), '/idea-lab/?x=1#top');
  for (const bad of ['https://evil.example/', 'http://evil.example', '//evil.example/x', '/\\evil.example', 'javascript:alert(1)', 'JaVaScRiPt:alert(1)', ' javascript:alert(1)', 'data:text/html,hi', '/\t/evil.example', 'evil.example', '', null, undefined]) {
    assert.equal(safeRedirect(bad as string, fb), fb, `should reject ${JSON.stringify(bad)}`);
  }
});

test('stored XSS: HTML-built pages escape database text', () => {
  assert.equal(escapeHtml('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  assert.equal(escapeHtml('" onmouseover="x'), '&quot; onmouseover=&quot;x');
  assert.equal(escapeHtml("It's & <b>"), 'It&#39;s &amp; &lt;b&gt;');
  const o = escapeFields({ name: '<script>x</script>', tags: ['<b>', 'ok'], n: 3, flag: true });
  assert.equal(o.name, '&lt;script&gt;x&lt;/script&gt;');
  assert.deepEqual(o.tags, ['&lt;b&gt;', 'ok']);
  assert.equal(o.n, 3);
});

test('stored XSS: only http(s) links reach href/src attributes', () => {
  assert.equal(safeUrl('https://ok.example/a?b=1&c=2'), 'https://ok.example/a?b=1&amp;c=2');
  for (const bad of ['javascript:alert(1)', ' javascript:alert(1)', 'data:text/html,x', 'vbscript:x', '//evil', '']) assert.equal(safeUrl(bad), '');
  assert.equal(safeUrl('https://x.example/"><script>'), 'https://x.example/&quot;&gt;&lt;script&gt;');
});

test('SSRF: link preview refuses internal and metadata addresses', () => {
  for (const h of ['localhost', '127.0.0.1', '10.0.0.5', '192.168.1.1', '172.16.0.1', '172.31.255.255', '169.254.169.254', '100.64.0.1', '0.0.0.0', '[::1]', '::1', '[fd00::1]', '[fe80::1]', '[::ffff:127.0.0.1]', 'db.internal', 'printer.local', 'intranet']) {
    assert.equal(isBlockedHost(h), true, `${h} should be blocked`);
  }
  for (const h of ['example.com', 'www.facebook.com', '8.8.8.8', '172.32.0.1', '100.128.0.1']) {
    assert.equal(isBlockedHost(h), false, `${h} should be allowed`);
  }
});

test('error disclosure: database errors never reach users verbatim', () => {
  const restore = quiet();
  try {
    const rls = { code: '42501', message: 'new row violates row-level security policy for table "organizations"', details: null };
    assert.ok(!friendlyError(rls).includes('row-level'));
    assert.ok(!friendlyError({ code: '23514', message: 'violates check constraint "x_check"', details: null }).includes('constraint'));
    assert.equal(friendlyError({ code: 'XX000', message: 'internal: relation "secret_table"', details: null }), 'Something went wrong. Please try again.');
    // Messages written for people still pass through.
    assert.equal(friendlyError({ code: 'P0001', message: 'This team is full.', details: null }), 'This team is full.');
    assert.equal(friendlyError(new Error('Image must be under 2MB.')), 'Image must be under 2MB.');
    const auth = Object.assign(new Error('Invalid login credentials'), { name: 'AuthApiError', status: 400 });
    assert.equal(friendlyError(auth), 'Invalid login credentials');
    assert.equal(friendlyError(null), '');
    assert.ok(storageErrorMessage('mime type image/svg+xml is not supported').includes("isn't supported"));
    assert.ok(!storageErrorMessage('new row violates row-level security policy').includes('row-level'));
  } finally { restore(); }
});

// Guards that the code paths stay wired to the helpers (a refactor that drops
// them would silently reopen the issue).
test('wiring: login, signup, and admin login use safeRedirect', () => {
  for (const f of ['app/login/LoginForm.tsx', 'app/signup/SignupForm.tsx', 'app/admin/login/AdminLoginForm.tsx']) {
    assert.match(readFileSync(f, 'utf8'), /safeRedirect\(/, f);
  }
});

test('wiring: public pages read the masked views, not the private tables', () => {
  const pub: [string, string][] = [
    ['app/organizations/dynamicData.ts', 'public_organizations'],
    ['app/ecosystem/dynamicData.ts', 'public_organizations'],
    ['app/sitemap.ts', 'public_organizations'],
    ['lib/chatContext.ts', 'public_organizations'],
    ['app/challenges/CommunityChallenges.tsx', 'public_challenge_submissions'],
    ['app/challenges/community/CommunityChallengeDetail.tsx', 'public_challenge_submissions'],
  ];
  for (const [f, view] of pub) assert.ok(readFileSync(f, 'utf8').includes(`"${view}"`), `${f} should read ${view}`);
  assert.ok(!/from\("organizations"\)/.test(readFileSync('app/organizations/dynamicData.ts', 'utf8')));
  const views = readFileSync('supabase/migrations/2026-10-04a-security-hardening.sql', 'utf8');
  assert.match(views, /case when contact_public then contact_email else '' end as contact_email/);
  const subView = views.slice(views.indexOf('public_challenge_submissions'));
  assert.ok(!/\bemail\b|\bphone\b|contact_name/.test(subView.slice(0, subView.indexOf('grant'))), 'challenge view must not include contact columns');
});

test('wiring: HTML-built pages escape what they render', () => {
  assert.match(readFileSync('app/organizations/[slug]/page.tsx', 'utf8'), /escapeFields\(raw\)/);
  assert.match(readFileSync('app/challenges/[id]/page.tsx', 'utf8'), /escapeFields\(raw\)/);
  assert.match(readFileSync('app/challenges/[id]/apply/page.tsx', 'utf8'), /escapeFields\(raw\)/);
  assert.match(readFileSync('lib/sendEventApprovalEmail.ts', 'utf8'), /escapeHtml\(event\.title\)/);
});
