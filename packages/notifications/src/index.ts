export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export function renderBookingConfirmed(params: { customerName: string; datetime: string; serviceName: string; }) {
  const { customerName, datetime, serviceName } = params;
  return `
    <h1>Booking Confirmed</h1>
    <p>Hi ${customerName},</p>
    <p>Your appointment for <strong>${serviceName}</strong> is confirmed at <strong>${datetime}</strong>.</p>
  `;
}

export function renderBookingPendingPayment(params: { customerName: string; datetime: string; serviceName: string; }) {
  const { customerName, datetime, serviceName } = params;
  return `
    <h1>Payment Pending</h1>
    <p>Hi ${customerName},</p>
    <p>Your appointment for <strong>${serviceName}</strong> at <strong>${datetime}</strong> is pending payment. Please complete payment to confirm.</p>
  `;
}

// Console-based sender stub (replace with Postmark/SendGrid)
export async function sendEmail(msg: EmailMessage): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[email] to=%s subject=%s', msg.to, msg.subject);
}

