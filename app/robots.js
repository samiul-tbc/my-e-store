export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/tbcadsonia', '/api/', '/checkout', '/payment', '/order-success'] }],
    sitemap: 'https://e-service-tbc-official.vercel.app/sitemap.xml',
  };
}
