// Birthday card link codec (server-side) — same format as Hub Cart.
export { RELATIONS, THEMES, REL_THEME, sanitizeBday } from './birthday-shared';

export function encodeCardData(obj) {
  const json = JSON.stringify(obj || {});
  const b64 = Buffer.from(json, 'utf8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function birthdayLink(payload) {
  return 'https://hubcart.vercel.app/wish.html?d=' + encodeCardData(payload);
}
