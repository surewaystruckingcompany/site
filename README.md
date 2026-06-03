# Sureways Trucking Company - Quote Fixed Package

This package fixes the Request a Quote form by adding a real `/quote` backend endpoint for Cloudflare Workers.

## Setup

1. Upload or replace `index.html` in your website repository.
2. Go to Cloudflare -> Workers & Pages -> site -> Edit Code.
3. Replace the current Worker code with `worker/worker.js`.
4. Save and deploy.
5. Add Cloudflare Worker variable:
   `SENDGRID_API_KEY = your_new_sendgrid_key`
6. Confirm Worker routes:
   - `surewaystruckingcompany.com/*`
   - `surewaystruckingcompany.com/quote`
7. Test:
   `https://surewaystruckingcompany.com/quote`

Expected response:
`{"success":true,"message":"Sureways quote endpoint is live. Submit the website form to send a quote request."}`
