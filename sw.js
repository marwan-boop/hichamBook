const CACHE_NAME = 'worker-tracker-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght=400;500;700;900&display=swap',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// 1. تثبيت الـ Service Worker وحفظ الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // تفعيل الكود الجديد فوراً
  );
});

// 2. مسح الكاش القديم فاش يتحدث التطبيق
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. جلب الملفات من الكاش ف حالة غياب الأنترنيت (Offline)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// 4. التذكير اليومي مع الـ 6 د العشية (Period Sync) ف الخلفية
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-6pm-reminder') {
    const now = new Date();
    // 18 تعني الـ 6 د العشية
    if (now.getHours() === 18 && now.getMinutes() === 0) {
      self.registration.showNotification("📋 تذكير العمال اليومي", {
        body: "ساعة 6 د العشية هادي! ما تنساش تسجل الأيام والمصاريف ديال الخدامة د اليوم.",
        icon: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png",
        vibrate: [200, 100, 200],
        badge: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png"
      });
    }
  }
});

// 5. في حالة صيفطتي إشعار Push مستقبلاً من Firebase
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "تذكير العمال اليومي";
  const options = {
    body: data.body || "ما تنساش تقيد حسابات الخدامة د اليوم!",
    icon: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png",
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
