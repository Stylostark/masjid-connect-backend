# Masjid Connect Backend — Complete API (Phases 1-7)

Node.js + Express + PostgreSQL backend for Doctor Para Jame Masjid app.

## Setup
1. `npm install`
2. Copy `.env.example` → `.env`, fill in `DATABASE_URL`, JWT secrets, `RAZORPAY_KEY_ID`/`SECRET`, `GOOGLE_MAPS_API_KEY`, Cloudinary values.
3. `npm run migrate` — creates all tables.
4. `npm run dev` — starts on `http://localhost:5000`.

## All Endpoints

### Auth
| Method | Path | Auth |
|---|---|---|
| POST | /api/auth/register | No |
| POST | /api/auth/login | No |
| POST | /api/auth/refresh | No |
| GET | /api/auth/me | Yes |

### Content (Phase 2)
| Method | Path | Auth |
|---|---|---|
| GET | /api/announcements | No |
| GET | /api/announcements/all | Admin |
| POST | /api/announcements | Admin |
| PATCH | /api/announcements/:id | Admin |
| DELETE | /api/announcements/:id | Admin |
| GET | /api/namaz-timings | No |
| PUT | /api/namaz-timings | Admin |
| GET | /api/masjid-info | No |
| PUT | /api/masjid-info | Admin |

### Admissions (Phase 3)
| Method | Path | Auth |
|---|---|---|
| POST | /api/admissions | User |
| POST | /api/admissions/:id/pay | User |
| POST | /api/admissions/:id/verify-payment | User |
| GET | /api/admissions/my | User |
| GET | /api/admissions | Admin |
| PATCH | /api/admissions/:id | Admin |

### Donations (Phase 4)
| Method | Path | Auth |
|---|---|---|
| POST | /api/donations | No |
| POST | /api/donations/:id/pay | No |
| POST | /api/donations/:id/verify-payment | No |
| GET | /api/donations/total | No |
| GET | /api/donations | Admin |

### Expenses (Phase 5)
| Method | Path | Auth |
|---|---|---|
| GET | /api/expenses | No |
| GET | /api/expenses/balance | No |
| POST | /api/expenses | Admin |
| DELETE | /api/expenses/:id | Admin |

### Dashboard
| Method | Path | Auth |
|---|---|---|
| GET | /api/dashboard/stats | Admin |

## Payment flow (Razorpay)
1. Client calls `POST /:id/pay` → gets `order.id` + `keyId`
2. Android opens Razorpay Checkout SDK with that order
3. On success, client calls `POST /:id/verify-payment` with `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`
4. Server verifies HMAC signature, marks paid, (admissions) generates `DN-{year}-{seq}` token

## Emergency push (Phase 7)
Creating an announcement with `isEmergency: true` publishes to the FCM topic `emergency`. Requires a Firebase service account — set `GOOGLE_APPLICATION_CREDENTIALS` to the JSON key path, or extend `util/fcm.js` to use `admin.credential.cert()` with env vars.

## Deploy to Render
- New Web Service → Build: `npm install` → Start: `npm start`
- Attach Render Postgres, set `DATABASE_URL` to its Internal URL
- `NODE_ENV=production`
- Run `npm run migrate` once via Render Shell

**Developed by Stylo Stark**
# masjid-connect-backend
