const metrics = require('../metrics');

// Simulator configuration
const SIMULATOR_INTERVAL = 5000; // Generate a new booking every 5 seconds

// Service types used for the serviceType label
const SERVICE_TYPES = ['Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Carpentry', 'Spa'];

// State to keep track of active bookings
const activeBookingsList = new Map();

function simulateBookingWorkflow() {
  const bookingId = `BKG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const startTime = Date.now();
  const serviceType = SERVICE_TYPES[Math.floor(Math.random() * SERVICE_TYPES.length)];

  // 1. Customer creates a booking (labelled by service type)
  metrics.totalBookingRequests.labels(serviceType).inc();
  metrics.queueLength.inc();

  // Track in active bookings
  activeBookingsList.set(bookingId, { state: 'CREATED', startTime, serviceType });
  metrics.activeBookings.set(activeBookingsList.size);

  // Simulate workflow steps asynchronously
  setTimeout(() => assignProfessional(bookingId), getRandomLatency(1000, 3000));
}

function assignProfessional(bookingId) {
  const booking = activeBookingsList.get(bookingId);
  if (!booking) return;

  const assignStart = Date.now();
  
  // Simulate assignment latency (sometimes it takes longer than 10 seconds to trigger alert)
  const isSlowAssignment = Math.random() < 0.1; // 10% chance of slow assignment
  const latency = isSlowAssignment ? getRandomLatency(11000, 15000) : getRandomLatency(2000, 5000);
  
  setTimeout(() => {
    metrics.queueLength.dec(); // Assigned, no longer in queue
    
    // Record assignment time
    const assignmentDurationSec = (Date.now() - assignStart) / 1000;
    metrics.professionalAssignmentTime.observe(assignmentDurationSec);
    
    booking.state = 'ASSIGNED';
    
    // Move to next step
    setTimeout(() => confirmBooking(bookingId), getRandomLatency(1000, 2000));
  }, latency);
}

function confirmBooking(bookingId) {
  const booking = activeBookingsList.get(bookingId);
  if (!booking) return;
  
  // 95% chance of confirmation, 5% chance of cancellation at this stage
  if (Math.random() > 0.05) {
    metrics.bookingsConfirmed.inc();
    booking.state = 'CONFIRMED';
    
    setTimeout(() => processPayment(bookingId), getRandomLatency(2000, 4000));
  } else {
    cancelBooking(bookingId, 'CANCELLED_BEFORE_CONFIRM');
  }
}

function processPayment(bookingId) {
  const booking = activeBookingsList.get(bookingId);
  if (!booking) return;

  // 10% chance of payment failure (to trigger > 5% alert)
  const paymentFailed = Math.random() < 0.10;

  if (paymentFailed) {
    metrics.paymentFailures.inc();
    cancelBooking(bookingId, 'PAYMENT_FAILED');
  } else {
    metrics.paymentSuccess.inc();
    booking.state = 'PAID';

    // 5% chance of notification failure
    if (Math.random() < 0.05) {
      metrics.notificationFailures.inc();
    } else {
      metrics.notificationSuccess.inc();
    }

    setTimeout(() => completeBooking(bookingId), getRandomLatency(5000, 10000));
  }
}

function completeBooking(bookingId) {
  const booking = activeBookingsList.get(bookingId);
  if (!booking) return;

  metrics.bookingsCompleted.inc();

  // Record overall latency
  const totalLatencySec = (Date.now() - booking.startTime) / 1000;
  metrics.averageBookingLatency.observe(totalLatencySec);

  activeBookingsList.delete(bookingId);
  metrics.activeBookings.set(activeBookingsList.size);

  // Send completion notification — 5% chance of failure
  if (Math.random() < 0.05) {
    metrics.notificationFailures.inc();
  } else {
    metrics.notificationSuccess.inc();
  }
}

function cancelBooking(bookingId, reason) {
  const booking = activeBookingsList.get(bookingId);
  if (!booking) return;

  metrics.bookingsCancelled.inc();
  
  activeBookingsList.delete(bookingId);
  metrics.activeBookings.set(activeBookingsList.size);
}

function getRandomLatency(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let simulatorInterval;

function startSimulator() {
  console.log('Starting Booking Workflow Simulator for Metrics...');
  simulatorInterval = setInterval(simulateBookingWorkflow, SIMULATOR_INTERVAL);
}

function stopSimulator() {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
  }
}

module.exports = {
  startSimulator,
  stopSimulator
};
