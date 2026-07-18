const admin = require('firebase-admin');

let initialized = false;
function ensureInit() {
  if (initialized) return;
  // Expects a service-account JSON path in GOOGLE_APPLICATION_CREDENTIALS,
  // or you can inline admin.credential.cert({...}) with env vars.
  try {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    initialized = true;
  } catch (e) {
    console.warn('FCM not initialized (no credentials found):', e.message);
  }
}

// Phase 7: push notification fan-out on emergency announcement create.
// Subscribes all devices to the "emergency" topic client-side (Android),
// so the backend just publishes to that topic.
async function sendEmergencyPush(announcement) {
  ensureInit();
  if (!initialized) return;
  await admin.messaging().send({
    topic: 'emergency',
    notification: {
      title: `🚨 ${announcement.title}`,
      body: announcement.message
    },
    data: { announcementId: String(announcement.id), type: 'emergency' }
  });
}

module.exports = { sendEmergencyPush };
