export const EMAIL_STYLES = {
    container: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    max-w: 600px;
    margin: 0 auto;
    padding: 20px;
    color: #333;
    line-height: 1.6;
  `,
    header: `
    font-size: 24px;
    font-weight: bold;
    color: #111;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  `,
    label: `
    font-weight: 600;
    color: #666;
  `,
    value: `
    margin-bottom: 16px;
    font-size: 16px;
  `,
    messageBox: `
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
    white-space: pre-wrap;
    border: 1px solid #eee;
  `,
    footer: `
    margin-top: 40px;
    pt: 20px;
    border-top: 1px solid #eee;
    font-size: 12px;
    color: #999;
    text-align: center;
  `,
};

export const getAdminNotificationTemplate = (
    name: string,
    email: string,
    company: string = "N/A",
    type: "Contact" | "Beta Access",
) => `
<div style="${EMAIL_STYLES.container}">
  <div style="${EMAIL_STYLES.header}">
    🚀 New ${type} Request
  </div>
  
  <div>
    <div style="${EMAIL_STYLES.label}">Name</div>
    <div style="${EMAIL_STYLES.value}">${name}</div>
    
    <div style="${EMAIL_STYLES.label}">Email</div>
    <div style="${EMAIL_STYLES.value}">
      <a href="mailto:${email}" style="color: #2563EB; text-decoration: none;">${email}</a>
    </div>
    
    ${
    company
        ? `
      <div style="${EMAIL_STYLES.label}">Company</div>
      <div style="${EMAIL_STYLES.value}">${company}</div>
    `
        : ""
}
  </div>

  <p style="margin-top: 30px; color: #666;">
    Reply to this email to respond directly to the user.
  </p>
</div>
`;

export const getContactMessageTemplate = (
    name: string,
    email: string,
    message: string,
) => `
<div style="${EMAIL_STYLES.container}">
  <div style="${EMAIL_STYLES.header}">
    📬 New Message from ${name}
  </div>
  
  <div>
    <div style="${EMAIL_STYLES.label}">From</div>
    <div style="${EMAIL_STYLES.value}">${name} (<a href="mailto:${email}">${email}</a>)</div>
  </div>

  <div style="${EMAIL_STYLES.label}">Message</div>
  <div style="${EMAIL_STYLES.messageBox}">
    ${message}
  </div>
</div>
`;

export const getUserConfirmationTemplate = (name: string) => `
<div style="${EMAIL_STYLES.container}">
  <div style="${EMAIL_STYLES.header}">
    We received your request!
  </div>
  
  <p>Hi ${name},</p>
  
  <p>Thanks for your interest in <strong>Bevisly</strong>. We have received your request for beta access.</p>
  
  <p>We are currently onboarding teams in small batches to ensure the best experience. You have been added to our priority waitlist, and we will send you an invitation code as soon as a spot opens up.</p>
  
  <p>In the meantime, if you have any urgent questions, feel free to reply to this email.</p>
  
  <br>
  <p>Best regards,</p>
  <p><strong>The Bevisly Team</strong></p>
  
  <div style="${EMAIL_STYLES.footer}">
    © ${new Date().getFullYear()} Bevisly. All rights reserved.
  </div>
</div>
`;
