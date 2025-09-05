import { Worker } from 'bullmq';
import { QUEUE_PAYMENT_EXPIRY, PaymentExpiryJob, QUEUE_EMAIL, EmailJob } from '@salon/messaging';
import { getPrisma } from '@salon/data-access';
import { sendEmail } from '@salon/notifications';

// Minimal, typed worker that cancels pending_payment appointments past TTL
const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || '6379'),
};

const prisma = getPrisma();

const worker = new Worker<PaymentExpiryJob>(
  QUEUE_PAYMENT_EXPIRY,
  async (job) => {
    const { tenantId, appointmentId } = job.data;
    await prisma.appointment.updateMany({
      where: {
        id: appointmentId,
        tenantId,
        status: 'pending_payment',
      },
      data: {
        status: 'cancelled',
      },
    });
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log('Expired payment handled', job.id);
});

worker.on('failed', (job, err) => {
  console.error('Worker failed', job?.id, err);
});

// Email worker
const emailWorker = new Worker<EmailJob>(
  QUEUE_EMAIL,
  async (job) => {
    await sendEmail({ to: job.data.to, subject: job.data.subject, html: job.data.html });
  },
  { connection }
);

emailWorker.on('completed', (job) => {
  console.log('Email sent', job.id);
});

emailWorker.on('failed', (job, err) => {
  console.error('Email worker failed', job?.id, err);
});

