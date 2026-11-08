// E-Services catalogue — v1 data file (front-end first, like Samiul's other
// projects). Each service deep-links to its Hub Cart product page, where the
// payment + delivery systems already run. Move to a database later if needed.

export const SERVICES = [
  {
    slug: 'birthday-wish-card',
    title: 'Premium Birthday Wish Card',
    price: 199,
    oldPrice: 350,
    image: '/birthday-card.jpg',
    hubcartUrl: 'https://hubcart.vercel.app/product/29',
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
    slug: 'bio-website-source',
    title: 'Premium Bio Website Source Code',
    price: 850,
    oldPrice: 2999,
    image: '/bio-source-cover.jpg',
    hubcartUrl: 'https://hubcart.vercel.app/product/30',
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

export const getService = (slug) => SERVICES.find((s) => s.slug === slug);
