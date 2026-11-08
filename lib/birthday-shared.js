// Shared birthday constants — safe for client and server.
export const RELATIONS = ['premika', 'apu', 'junior', 'friend', 'vai'];
export const THEMES = ['midnight', 'candy', 'ocean'];
export const REL_THEME = { premika: 'candy', junior: 'candy', apu: 'midnight', vai: 'midnight', friend: 'ocean' };

export function sanitizeBday(input) {
  const b = input && typeof input === 'object' ? input : {};
  return {
    name: String(b.name || '').trim().slice(0, 80),
    birth: /^\d{4}-\d{2}-\d{2}$/.test(String(b.birth || '')) ? String(b.birth) : '',
    msg: String(b.msg || '').trim().slice(0, 500),
    from: String(b.from || '').trim().slice(0, 60),
    photo: /^https?:\/\//i.test(String(b.photo || '')) ? String(b.photo).slice(0, 400) : '',
    theme: THEMES.includes(b.theme) ? b.theme : 'midnight',
    rel: RELATIONS.includes(b.rel) ? b.rel : 'friend',
  };
}
