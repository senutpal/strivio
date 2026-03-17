# strivio

online course platform built with next.js, prisma, and stripe.

## stack

- next.js 15 (app router)
- prisma + postgresql (neon)
- better-auth (github oauth + email otp)
- stripe (payments + webhooks)
- aws s3 (file storage)
- shadcn/ui + tailwind css
- arcjet (rate limiting + bot detection)
- resend (transactional emails)

## setup

```bash
pnpm install
cp .env.example .env  # fill in your keys
npx prisma migrate dev
pnpm dev
```

## env vars

| variable | description |
|---|---|
| `DATABASE_URL` | postgresql connection string |
| `BETTER_AUTH_SECRET` | auth secret (min 20 chars) |
| `BETTER_AUTH_URL` | base url (e.g. http://localhost:3000) |
| `GITHUB_CLIENT_ID` | github oauth app client id |
| `GITHUB_CLIENT_SECRET` | github oauth app secret |
| `RESEND_API_KEY` | resend api key for emails |
| `ARCJET_KEY` | arcjet security key |
| `AWS_ACCESS_KEY_ID` | s3 access key |
| `AWS_SECRET_ACCESS_KEY` | s3 secret key |
| `AWS_ENDPOINT_URL_S3` | s3 endpoint |
| `AWS_ENDPOINT_URL_IAM` | iam endpoint |
| `AWS_REGION` | aws region |
| `STRIPE_SECRET_KEY` | stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | stripe webhook signing secret |
| `NEXT_PUBLIC_S3_BUCKET_NAME` | s3 bucket name |

## features

- course browsing with search and filtering (category, level)
- course detail pages with reviews and ratings
- stripe checkout with dynamic pricing
- webhook-driven enrollment activation
- course player with video playback and lesson navigation
- progress tracking (mark lessons complete, percentage bar)
- student dashboard with enrolled courses and progress
- certificate of completion (100% required)
- wishlist / favorites
- user settings (profile editing)
- admin dashboard with real analytics (revenue, users, enrollments)
- admin course management (create, edit, delete, reorder chapters/lessons)
- drag-and-drop course structure editor
- rich text editor for descriptions
- s3 file uploads (thumbnails, videos)
- email notifications (enrollment confirmation, otp verification)
- github oauth + email otp authentication
- role-based access control (admin/student)
- rate limiting and bot detection

## project structure

```
app/
  (auth)/          auth pages (login, verify)
  (public)/        public pages (home, courses, dashboard, settings)
  admin/           admin pages (dashboard, course management)
  api/             api routes (auth, s3, stripe webhook)
  data/            server-side data fetchers
components/        shared ui components
lib/               config, db, auth, stripe, s3, utils
prisma/            schema and migrations
```
