export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return jsonResponse({ success: true }, 200);
    }

    if (request.method === "GET" && url.pathname === "/quote") {
      return jsonResponse({
        success: true,
        message: "Sureways quote endpoint is live. Submit the website form to send a quote request."
      }, 200);
    }

    if (request.method === "POST" && url.pathname === "/quote") {
      try {
        const formData = await request.formData();
        const data = Object.fromEntries(formData.entries());

        const required = ["name","email","phone","pickup","delivery","load_type","weight","pickup_date","delivery_date"];
        const missing = required.filter((field) => !data[field] || String(data[field]).trim() === "");

        if (missing.length > 0) {
          return jsonResponse({ success: false, message: "Missing required fields: " + missing.join(", ") }, 400);
        }

        const emailBody = `
New Quote Request from Sureways Trucking Company Website

Customer Information:
Name: ${data.name}
Company: ${data.company || "N/A"}
Email: ${data.email}
Phone: ${data.phone}

Load Details:
Pickup: ${data.pickup}
Delivery: ${data.delivery}
Load Type: ${data.load_type}
Weight: ${data.weight} lbs
Pickup Date: ${data.pickup_date}
Delivery Date: ${data.delivery_date}

Additional Notes:
${data.notes || "None"}
`;

        if (env.SENDGRID_API_KEY) {
          const sgResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.SENDGRID_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: "sales@surewaystruckingcompany.com" }], subject: "New Freight Quote Request - Sureways Trucking" }],
              from: { email: "sales@surewaystruckingcompany.com", name: "Sureways Trucking Website" },
              reply_to: { email: data.email, name: data.name },
              content: [{ type: "text/plain", value: emailBody }]
            })
          });

          if (!sgResponse.ok) {
            const sgText = await sgResponse.text();
            return jsonResponse({ success: false, message: "Email service error. Please call (562) 647-0284.", detail: sgText }, 502);
          }

          ctx.waitUntil(fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.SENDGRID_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: data.email }], subject: "We Received Your Freight Quote Request" }],
              from: { email: "sales@surewaystruckingcompany.com", name: "Sureways Trucking Company" },
              content: [{ type: "text/plain", value: `Hello ${data.name},

Thank you for contacting Sureways Trucking Company.

Your quote request has been received and our team will review it shortly.

If this request is urgent, please call us directly at (562) 647-0284.

Thank you,
Sureways Trucking Company
sales@surewaystruckingcompany.com` }]
            })
          }));
        } else {
          console.log("SENDGRID_API_KEY is not set. Quote received:", JSON.stringify(data));
        }

        return jsonResponse({ success: true, message: "Your quote request has been sent. We will contact you shortly." }, 200);
      } catch (err) {
        return jsonResponse({ success: false, message: "Server error: " + err.message }, 500);
      }
    }

    return new Response("Sureways Trucking Worker is running. Quote endpoint: /quote", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
};

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
