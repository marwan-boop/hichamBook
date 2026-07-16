const CACHE_NAME = 'workers-tracker-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap',
  'https://cdn.tailwindcss.com'
];

// 1. تثبيت الـ Service Worker وتخزين الملفات الأساسية للأوفلاين
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. تشغيل التطبيق من الكاش فاش ما تكونش الأنترنيت (Offline Mode)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // غيجيب الملف من الكاش أولاً، وإلا غيجيبو من الأنترنيت
      return cachedResponse || fetch(e.request);
    })
  );
});

// 3. استقبال الإشعارات وعرضها للمستخدم
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || "تذكير يومي 👷‍♂️";
  const options = {
    body: data.body || "ما تنساش تسجل يومية الخدامة ديالك اليوم!",
    icon: 'https://cdn-icons-png.flaticon.com/512/3204/3204368.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3204/3204368.png',
    vibrate: [100, 50, 100]
  };

  e.waitUntil(
    self.registration.showNotification(title, options)
  );
});