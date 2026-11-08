export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/checkout', '/payment', '/order-success'] }],
    sitemap: 'https://e-service-tbc-official.vercel.app/sitemap.xml',
  };
}
