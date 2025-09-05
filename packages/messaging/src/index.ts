import { Queue, QueueEvents, Worker, JobsOptions } from 'bullmq';

export type PaymentExpiryJob = {
  tenantId: string;
  appointmentId: string;
};

export const QUEUE_PAYMENT_EXPIRY = 'payment-expiry';
export const QUEUE_EMAIL = 'email';

export interface QueueConfig {
  connection: {
    host: string;
    port: number;
    password?: string;
    username?: string;
  };
  prefix?: string;
}

export function createPaymentExpiryQueue(config: QueueConfig) {
  const queue = new Queue<PaymentExpiryJob>(QUEUE_PAYMENT_EXPIRY, {
    connection: config.connection,
    prefix: config.prefix,
  });
  const events = new QueueEvents(QUEUE_PAYMENT_EXPIRY, {
    connection: config.connection,
    prefix: config.prefix,
  });
  return { queue, events };
}

export function createDelayedJobOptions(delayMs: number): JobsOptions {
  return {
    delay: delayMs,
    attempts: 1,
    removeOnComplete: 1000,
    removeOnFail: 1000,
  };
}

export type EmailJob = {
  to: string;
  subject: string;
  html: string;
};

export function createEmailQueue(config: QueueConfig) {
  const queue = new Queue<EmailJob>(QUEUE_EMAIL, {
    connection: config.connection,
    prefix: config.prefix,
  });
  const events = new QueueEvents(QUEUE_EMAIL, {
    connection: config.connection,
    prefix: config.prefix,
  });
  return { queue, events };
}

