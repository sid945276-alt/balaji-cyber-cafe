# Balaji Cyber Cafe Premium Website

A responsive Node.js/Express customer-service portal for Balaji Cyber Cafe.

## Features
- Premium bilingual home page
- Services cards
- Online customer request form
- Document upload
- Automatic Request ID
- Customer request tracking
- Admin panel and status updates
- WhatsApp/call contact
- Payment-ready section
- SQLite database for development

## Run locally
1. Install Node.js 18+.
2. Run `npm install`.
3. Set a strong `ADMIN_KEY` environment variable.
4. Run `npm start`.
5. Open `http://localhost:3000`.
6. Admin: `http://localhost:3000/admin.html`.

## Production note
For a real public CSC service, use HTTPS, private object storage for documents, a persistent managed database, strong admin authentication, rate limiting, file-type validation, backups, and official payment-gateway server-side verification. Do not expose customer documents publicly.
