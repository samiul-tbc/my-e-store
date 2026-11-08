import crypto from 'crypto';
import { fetchSetting, insertSettingVersion, parseJson } from './supabase';

// Admin auth for TBC x E-store.
// The PIN itself is never stored: settings `estore_admin_pin` holds
// { hash } = sha256(pin + salt). Sessions are stateless day tokens:
// token = sha256(hash + ':' + YYYY-MM-DD) — accepted for today/yesterday.
const SALT = 'tbcx-estore-admin-v1';

export function hashPin(pin) {
  return crypto.createHash('sha256').update(SALT + ':' + String(pin)).digest('hex');
}

export async function getPinHash() {
  const raw = await fetchSetting('estore_admin_pin');
  const v = parseJson(raw, null);
  return v && v.hash ? String(v.hash) : null;
}

export async function setPin(pin) {
  return insertSettingVersion('estore_admin_pin', { hash: hashPin(pin) });
}

function dayStr(offset = 0) {
  const d = new Date(Date.now() + offset * 86400000);
  return d.toISOString().slice(0, 10);
}

export function makeToken(pinHash) {
  return crypto.createHash('sha256').update(pinHash + ':' + dayStr(0)).digest('hex');
}

export async function verifyToken(req) {
  const token = req.headers.get('x-admin-token') || '';
  if (!token) return false;
  const pinHash = await getPinHash();
  if (!pinHash) return false;
  for (const off of [0, -1, -2, -3, -4, -5, -6]) {
    const expect = crypto.createHash('sha256').update(pinHash + ':' + dayStr(off)).digest('hex');
    if (token === expect) return true;
  }
  return false;
}
