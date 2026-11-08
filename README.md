# E-Store — Premium E-Services

Standalone storefront for Samiul's digital e-services (birthday wish cards,
website source code, and more). Next.js 14, dark + lime premium theme,
bilingual BN/EN.

v1 is front-end first: the catalogue lives in `lib/services.js` and every
service deep-links to its Hub Cart product page, where the secure checkout,
payment verification and delivery (card links + one-time downloads) already
run. A native catalogue/checkout can replace the data file later.
