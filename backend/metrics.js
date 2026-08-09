const client = require('prom-client');

// ─── Default Metrics (CPU, Memory, Heap, GC, Event Loop, etc.) ───────────────
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// ─── Booking Counters ─────────────────────────────────────────────────────────

// Labelled by serviceType so Grafana can break down bookings per category
const totalBookingRequests = new client.Counter({
  name: 'serviceexpress_booking_requests_total',
  help: 'Total number of booking requests received',
  labelNames: ['serviceType']
});

const bookingsConfirmed = new client.Counter({
  name: 'serviceexpress_bookings_confirmed_total',
  help: 'Total number of bookings confirmed'
});

const bookingsCancelled = new client.Counter({
  name: 'serviceexpress_bookings_cancelled_total',
  help: 'Total number of bookings cancelled'
});

const bookingsCompleted = new client.Counter({
  name: 'serviceexpress_bookings_completed_total',
  help: 'Total number of bookings completed successfully'
});

// ─── Payment Counters ─────────────────────────────────────────────────────────

const paymentSuccess = new client.Counter({
  name: 'serviceexpress_payment_success_total',
  help: 'Total number of successful payments'
});

const paymentFailures = new client.Counter({
  name: 'serviceexpress_payment_failures_total',
  help: 'Total number of failed payments'
});

// ─── Notification Counters ────────────────────────────────────────────────────

const notificationSuccess = new client.Counter({
  name: 'serviceexpress_notification_success_total',
  help: 'Total number of notifications sent successfully'
});

const notificationFailures = new client.Counter({
  name: 'serviceexpress_notification_failures_total',
  help: 'Total number of failed notifications'
});

// ─── Gauges ───────────────────────────────────────────────────────────────────

const activeBookings = new client.Gauge({
  name: 'serviceexpress_active_bookings',
  help: 'Number of currently active bookings'
});

const queueLength = new client.Gauge({
  name: 'serviceexpress_queue_length',
  help: 'Current number of bookings waiting in queue for professional assignment'
});

// ─── Histograms ───────────────────────────────────────────────────────────────

// Time from queuing to professional assignment (seconds)
const professionalAssignmentTime = new client.Histogram({
  name: 'serviceexpress_professional_assignment_time_seconds',
  help: 'Time taken to assign a professional to a booking (seconds)',
  buckets: [1, 2, 5, 10, 20, 30, 60]
});

// End-to-end booking latency: creation → completion (seconds)
const averageBookingLatency = new client.Histogram({
  name: 'serviceexpress_booking_latency_seconds',
  help: 'End-to-end latency of a booking from creation to completion (seconds)',
  buckets: [60, 300, 600, 1800, 3600, 7200, 14400]
});

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  client,
  totalBookingRequests,
  bookingsConfirmed,
  bookingsCancelled,
  bookingsCompleted,
  paymentSuccess,
  paymentFailures,
  notificationSuccess,
  notificationFailures,
  activeBookings,
  queueLength,
  professionalAssignmentTime,
  averageBookingLatency
};
