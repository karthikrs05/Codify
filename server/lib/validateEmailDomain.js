import { promises as dns } from 'node:dns';

function getDomainFromEmail(email) {
  const at = email.lastIndexOf('@');
  if (at < 1 || at === email.length - 1) return null;
  return email.slice(at + 1).toLowerCase();
}

async function hasMx(domain) {
  const records = await dns.resolveMx(domain);
  return Array.isArray(records) && records.length > 0;
}

async function hasAorAAAA(domain) {
  try {
    const a = await dns.resolve4(domain);
    if (Array.isArray(a) && a.length > 0) return true;
  } catch {}
  try {
    const aaaa = await dns.resolve6(domain);
    if (Array.isArray(aaaa) && aaaa.length > 0) return true;
  } catch {}
  return false;
}

export async function validateEmailDomain(email) {
  const domain = getDomainFromEmail(email);
  if (!domain) return { ok: false, reason: 'missing_domain' };

  try {
    if (await hasMx(domain)) return { ok: true, domain, via: 'mx' };
  } catch {
    // ignore; fall through to A/AAAA check
  }

  try {
    if (await hasAorAAAA(domain)) return { ok: true, domain, via: 'a' };
    return { ok: false, domain, reason: 'no_dns_records' };
  } catch {
    return { ok: false, domain, reason: 'dns_lookup_failed' };
  }
}

