/**
 * Branded HTML email templates for PG Finder booking notifications.
 */

const baseStyle = `
  body { margin: 0; padding: 0; background: #f4f6fb; font-family: 'Segoe UI', Arial, sans-serif; }
  .container { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px 28px 24px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 22px; margin: 0 0 4px; font-weight: 700; }
  .header p { color: rgba(255,255,255,0.85); font-size: 13px; margin: 0; }
  .body { padding: 28px; }
  .greeting { font-size: 16px; color: #1e293b; margin: 0 0 16px; }
  .detail-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 18px 0; }
  .detail-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { color: #64748b; }
  .detail-value { color: #1e293b; font-weight: 600; text-align: right; }
  .message-box { background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 18px 0; }
  .message-box.approved { background: #f0fdf4; border-left-color: #22c55e; }
  .message-box.rejected { background: #fef2f2; border-left-color: #ef4444; }
  .message-box p { color: #334155; font-size: 14px; margin: 0; font-style: italic; }
  .cta-btn { display: inline-block; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 12px; }
  .cta-primary { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff !important; }
  .cta-success { background: #22c55e; color: #ffffff !important; }
  .cta-danger { background: #ef4444; color: #ffffff !important; }
  .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  .badge-pending { background: #fef3c7; color: #b45309; }
  .badge-approved { background: #dcfce7; color: #16a34a; }
  .badge-rejected { background: #fee2e2; color: #dc2626; }
  .footer { padding: 20px 28px; text-align: center; border-top: 1px solid #f1f5f9; }
  .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
`;

const wrap = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyle}</style></head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p>© ${new Date().getFullYear()} PG Finder — Find your perfect accommodation.</p>
      <p style="margin-top:6px;">This is an automated notification. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

// ─── 1. Email to OWNER when a new booking request arrives ──────────
const newBookingRequestToOwner = ({ ownerName, tenantName, tenantEmail, tenantPhone, listingTitle, listingCity, rent, moveInDate, duration, message, dashboardUrl }) => {
  const formattedDate = new Date(moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return wrap(`
    <div class="header">
      <h1>📩 New Booking Request</h1>
      <p>Someone is interested in your listing!</p>
    </div>
    <div class="body">
      <p class="greeting">Hi <strong>${ownerName}</strong>,</p>
      <p style="color:#475569;font-size:14px;margin:0 0 8px;">You have received a new booking request for your property. Here are the details:</p>

      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">🏠 Listing</span><span class="detail-value">${listingTitle}</span></div>
        <div class="detail-row"><span class="detail-label">📍 City</span><span class="detail-value">${listingCity}</span></div>
        <div class="detail-row"><span class="detail-label">💰 Rent</span><span class="detail-value">₹${Number(rent).toLocaleString("en-IN")}/mo</span></div>
      </div>

      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">👤 Tenant</span><span class="detail-value">${tenantName}</span></div>
        <div class="detail-row"><span class="detail-label">✉️ Email</span><span class="detail-value">${tenantEmail}</span></div>
        ${tenantPhone ? `<div class="detail-row"><span class="detail-label">📞 Phone</span><span class="detail-value">${tenantPhone}</span></div>` : ""}
        <div class="detail-row"><span class="detail-label">📅 Move-in</span><span class="detail-value">${formattedDate}</span></div>
        <div class="detail-row"><span class="detail-label">⏱️ Duration</span><span class="detail-value">${duration} month(s)</span></div>
      </div>

      ${message ? `<div class="message-box"><p>"${message}"</p></div>` : ""}

      <p style="color:#475569;font-size:14px;">Log in to your dashboard to approve or reject this request:</p>
      <div style="text-align:center;">
        <a href="${dashboardUrl}" class="cta-btn cta-primary">Open Dashboard</a>
      </div>
    </div>
  `);
};

// ─── 2. Email to TENANT when owner APPROVES the booking ────────────
const bookingApprovedToTenant = ({ tenantName, ownerName, ownerEmail, ownerPhone, listingTitle, listingCity, listingAddress, rent, moveInDate, duration, ownerResponse, listingUrl }) => {
  const formattedDate = new Date(moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return wrap(`
    <div class="header" style="background:linear-gradient(135deg,#22c55e,#06b6d4);">
      <h1>🎉 Booking Approved!</h1>
      <p>Great news — your request has been accepted.</p>
    </div>
    <div class="body">
      <p class="greeting">Hi <strong>${tenantName}</strong>,</p>
      <p style="color:#475569;font-size:14px;margin:0 0 8px;">Your booking request has been <span class="status-badge badge-approved">Approved</span> by the property owner.</p>

      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">🏠 Listing</span><span class="detail-value">${listingTitle}</span></div>
        <div class="detail-row"><span class="detail-label">📍 Location</span><span class="detail-value">${listingAddress}, ${listingCity}</span></div>
        <div class="detail-row"><span class="detail-label">💰 Rent</span><span class="detail-value">₹${Number(rent).toLocaleString("en-IN")}/mo</span></div>
        <div class="detail-row"><span class="detail-label">📅 Move-in</span><span class="detail-value">${formattedDate}</span></div>
        <div class="detail-row"><span class="detail-label">⏱️ Duration</span><span class="detail-value">${duration} month(s)</span></div>
      </div>

      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">🏢 Owner</span><span class="detail-value">${ownerName}</span></div>
        <div class="detail-row"><span class="detail-label">✉️ Email</span><span class="detail-value">${ownerEmail}</span></div>
        ${ownerPhone ? `<div class="detail-row"><span class="detail-label">📞 Phone</span><span class="detail-value">${ownerPhone}</span></div>` : ""}
      </div>

      ${ownerResponse ? `<div class="message-box approved"><p><strong>Owner's message:</strong> "${ownerResponse}"</p></div>` : ""}

      <p style="color:#475569;font-size:14px;">You can contact the owner to finalize the details. View the listing:</p>
      <div style="text-align:center;">
        <a href="${listingUrl}" class="cta-btn cta-success">View Listing</a>
      </div>
    </div>
  `);
};

// ─── 3. Email to TENANT when owner REJECTS the booking ─────────────
const bookingRejectedToTenant = ({ tenantName, listingTitle, listingCity, rent, moveInDate, duration, ownerResponse, searchUrl }) => {
  const formattedDate = new Date(moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return wrap(`
    <div class="header" style="background:linear-gradient(135deg,#ef4444,#f97316);">
      <h1>😔 Booking Declined</h1>
      <p>Unfortunately, your request was not accepted.</p>
    </div>
    <div class="body">
      <p class="greeting">Hi <strong>${tenantName}</strong>,</p>
      <p style="color:#475569;font-size:14px;margin:0 0 8px;">Your booking request has been <span class="status-badge badge-rejected">Rejected</span> by the property owner.</p>

      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">🏠 Listing</span><span class="detail-value">${listingTitle}</span></div>
        <div class="detail-row"><span class="detail-label">📍 City</span><span class="detail-value">${listingCity}</span></div>
        <div class="detail-row"><span class="detail-label">💰 Rent</span><span class="detail-value">₹${Number(rent).toLocaleString("en-IN")}/mo</span></div>
        <div class="detail-row"><span class="detail-label">📅 Move-in</span><span class="detail-value">${formattedDate}</span></div>
        <div class="detail-row"><span class="detail-label">⏱️ Duration</span><span class="detail-value">${duration} month(s)</span></div>
      </div>

      ${ownerResponse ? `<div class="message-box rejected"><p><strong>Owner's reason:</strong> "${ownerResponse}"</p></div>` : ""}

      <p style="color:#475569;font-size:14px;">Don't worry — there are plenty of other great options! Browse more listings:</p>
      <div style="text-align:center;">
        <a href="${searchUrl}" class="cta-btn cta-primary">Browse Listings</a>
      </div>
    </div>
  `);
};

module.exports = {
  newBookingRequestToOwner,
  bookingApprovedToTenant,
  bookingRejectedToTenant,
};
