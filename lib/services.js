// TBC x E-store catalogue — v2 model.
// The live catalogue is stored in the database (versioned settings key
// `estore_products`) so the admin panel can edit it; this seed is the
// fallback used until the first admin save, and the shape reference.
//
// type: 'link'   -> birthday-card style; delivery = generated link (payload in settings)
//       'download' -> source-code style; delivery = one-time gated file download
// infoForm: show the birthday info form at checkout for this product.

export const SEED_PRODUCTS = [
  {
    id: 'birthday-wish-card',
    title: 'Premium Birthday Wish Card',
    price: 199,
    oldPrice: 350,
    image: '/birthday-card.jpg',
    type: 'link',
    infoForm: true,
    demoUrl: 'https://hubcart.vercel.app/wish.html?d=eyJuYW1lIjoiWmFraWEgQXB1IiwiYmlydGgiOiIyMDA3LTA5LTMwIiwiZnJvbSI6IlNhbWl1bCJ9',
    published: true,
    featured: true,
    addedAt: '2026-11-09',
    faqs: [
      { q: { bn: 'কার্ডের লিংক কখন পাব?', en: 'When do I get the card link?' }, a: { bn: 'পেমেন্ট নিশ্চিত হয়ে অর্ডার সম্পন্ন হলেই Track Order পেজে কার্ডের লিংক পেয়ে যাবেন।', en: 'Once your payment is confirmed and the order is completed, the card link appears on the Track Order page.' } },
      { q: { bn: 'কার্ডে কী কী কাস্টমাইজ করা যায়?', en: 'What can I customize?' }, a: { bn: 'নাম, জন্ম তারিখ, ছবি, নিজের বার্তা, প্রেরকের নাম, সম্পর্ক অনুযায়ী টোন আর 3টি থিম থেকে পছন্দের থিম।', en: 'Name, birth date, photo, your message, sender name, tone by relationship, and a choice of 3 themes.' } },
    ],
    tagline: {
      bn: 'প্রিয়জনের জন্মদিনে পাঠান ব্যক্তিগত 3D জন্মদিনের কার্ড — নিজের নাম, ছবি আর বার্তা দিয়ে',
      en: 'Send a personal 3D birthday card with their name, photo and your message',
    },
    bullets: {
      bn: [
        'ইন্টার‌্যাক্টিভ 3D কেক — মোমবাতিতে ট্যাপ করে নেভানো যায়',
        '৫ ধরনের সম্পর্কের টোন: প্রেমিকা, আপু, জুনিয়র, বন্ধু, ভাই',
        '৩টি প্রিমিয়াম থিম: Midnight, Candy, Ocean',
        'Countdown, শুভেচ্ছা চিঠি আর Blessing Wheel সহ ফুল অভিজ্ঞতা',
        'Payment complete হলেই Track Order পেজে কার্ডের লিংক',
      ],
      en: [
        'Interactive 3D cake — tap the candles to blow them out',
        '5 relationship tones: partner, sister, junior, friend, brother',
        '3 premium themes: Midnight, Candy, Ocean',
        'Countdown, tribute letter and blessing wheel included',
        'Card link unlocks on the Track Order page after payment',
      ],
    },
  },
  {
    id: 'bio-website-source',
    title: 'Premium Bio Website Source Code',
    price: 850,
    oldPrice: 2999,
    image: '/bio-source-cover.jpg',
    type: 'download',
    downloadFile: 'bio-website-source.html',
    downloadName: 'Premium-Bio-Website-Source.html',
    downloadLimit: 3,
    infoForm: false,
    published: true,
    featured: true,
    addedAt: '2026-11-09',
    tagline: {
      bn: 'সব সোশ্যাল অ্যাকাউন্ট এক পেজে — Matrix Hacker থিমের সম্পূর্ণ Bio Website, একটাই HTML ফাইল',
      en: 'All your social accounts on one page — a complete matrix-style bio website in a single HTML file',
    },
    bullets: {
      bn: [
        'Matrix Rain অ্যানিমেশন + Hacker Green প্রিমিয়াম থিম',
        'Profile Card — ছবি, নাম, Title, Skill Badge, Terminal Intro',
        'Facebook, Instagram, Telegram, X, GitHub, Spotify, Discord, TikTok, WhatsApp — সব লিংক এক জায়গায়',
        'মাত্র একটা HTML ফাইল — GitHub Pages / Netlify-তে ফ্রি হোস্টিং',
        'নিরাপদ One-Time Download — শুধু আপনার অর্ডারের ফোন নম্বর দিয়েই ডাউনলোড হবে',
      ],
      en: [
        'Matrix rain animation with a hacker-green premium theme',
        'Profile card — photo, name, title, skill badges, terminal intro',
        'Facebook, Instagram, Telegram, X, GitHub, Spotify, Discord, TikTok, WhatsApp in one place',
        'A single HTML file — free hosting on GitHub Pages / Netlify',
        'Secure one-time download — only with your order phone number',
      ],
    },
  },
];
