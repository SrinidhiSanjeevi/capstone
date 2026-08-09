const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Professional = require("../models/Professional");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const {
  processPaymentSimulation,
  processNotificationSimulation,
  processCompletionEmailNotification
} = require("../services/simulationService");
const metrics = require("../metrics");

// CREATE NEW BOOKING (Directly Auto-Assigns & Confirms - No Admin Approval Needed)
const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      professionalId,
      date,
      timeSlot,
      address,
      contactNumber,
      notes,
      selectedProduct,
      paymentMethod,
      totalPrice,
      isCustom,
      customCategory,
      customDescription
    } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const userId = req.user._id;
    if (metrics && metrics.queueLength) metrics.queueLength.inc();

    let service = null;
    let professional = null;

    if (isCustom) {
      professional = await Professional.findOne({
        category: customCategory || "Spa",
        status: "Available"
      });
    } else {
      if (serviceId) {
        service = await Service.findById(serviceId);
      }
      
      if (professionalId) {
        professional = await Professional.findById(professionalId);
      } else if (service) {
        professional = await Professional.findOne({
          category: service.category,
          status: "Available"
        });
      }
    }

    // Derive service type for the Prometheus label (after service is resolved)
    const serviceType = isCustom
      ? (customCategory || 'Custom')
      : (service ? service.category : 'Unknown');
    if (metrics && metrics.totalBookingRequests) metrics.totalBookingRequests.labels(serviceType).inc();

    if (professional) {
      professional.status = "Busy";
      await professional.save();
    }

    // Normalize payment method label to an internal safe value
    const rawPaymentMethod = paymentMethod || "Online Payment (Simulated)";
    const isCash =
      rawPaymentMethod === "Cash" ||
      rawPaymentMethod === "Cash on Delivery" ||
      rawPaymentMethod.toLowerCase().includes("cash");

    // Map UI labels → internal stored value
    let normalizedPaymentMethod;
    if (isCash) {
      normalizedPaymentMethod = "Cash on Delivery";
    } else {
      normalizedPaymentMethod = "Online Payment (Simulated)";
    }

    // Create initial booking
    const booking = await Booking.create({
      user: userId,
      service: isCustom ? null : (serviceId || null),
      isCustom: !!isCustom,
      customCategory: customCategory || null,
      customDescription: customDescription || null,
      professional: professional ? professional._id : null,
      date: date ? new Date(date) : new Date(),
      timeSlot: timeSlot || "09:00 AM - 11:00 AM",
      address: address || "Default Address",
      contactNumber: contactNumber || "0000000000",
      notes: notes || "",
      selectedProduct: selectedProduct || null,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: isCash ? "Pending (Cash on Delivery)" : "Pending",
      status: professional ? "Confirmed" : "Assigned",
      totalPrice: totalPrice || 500
    });

    if (metrics && metrics.queueLength) metrics.queueLength.dec();

    // Process Payment Simulation
    const { success: paymentSuccess, payment } = await processPaymentSimulation(
      booking,
      userId,
      totalPrice || 500,
      paymentMethod || "Online Payment (Simulated)"
    );

    let notifications = [];
    if (paymentSuccess) {
      booking.paymentStatus = isCash ? "Pending (Cash on Delivery)" : "Paid";
      booking.status = "Confirmed";
      if (metrics && metrics.bookingsConfirmed) metrics.bookingsConfirmed.inc();
    } else {
      booking.paymentStatus = "Failed";
      booking.status = "Cancelled";
      if (metrics && metrics.bookingsCancelled) metrics.bookingsCancelled.inc();
      if (professional) {
        professional.status = "Available";
        await professional.save();
      }
    }

    // Send confirmation email asynchronously in background so response returns instantly (no blocking UX delay)
    processNotificationSimulation(booking, userId).catch((emailErr) => {
      console.error("Background email notification error:", emailErr.message);
    });

    await booking.save();
    if (metrics && metrics.activeBookings) metrics.activeBookings.inc();

    res.status(201).json({
      success: true,
      message: paymentSuccess
        ? (isCash ? "Booking confirmed! Payment will be collected in cash upon service completion." : "Booking created & payment confirmed!")
        : "Booking failed due to online payment simulation error.",
      booking,
      payment,
      notifications
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET USER BOOKINGS WITH PAYMENTS & NOTIFICATIONS
const getUserBookings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId })
      .populate("service")
      .populate("professional")
      .sort({ createdAt: -1 })
      .lean();

    const enrichedBookings = await Promise.all(
      (bookings || []).map(async (b) => {
        try {
          const payments = await Payment.find({ booking: b._id }).sort({ createdAt: -1 });
          const notifications = await Notification.find({ booking: b._id }).sort({ createdAt: -1 });
          return { ...b, payments: payments || [], notifications: notifications || [] };
        } catch (err) {
          return { ...b, payments: [], notifications: [] };
        }
      })
    );

    res.status(200).json({ success: true, bookings: enrichedBookings });
  } catch (error) {
    console.error("GET USER BOOKINGS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ASSIGNED BOOKINGS FOR PROFESSIONAL
const getProfessionalBookings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const userId = req.user._id;
    let pro = await Professional.findOne({ user: userId });
    
    let query = pro ? { professional: pro._id } : { professional: { $ne: null } };

    const bookings = await Booking.find(query)
      .populate("service")
      .populate("user", "name email phone address")
      .sort({ createdAt: -1 })
      .lean();

    const enrichedBookings = await Promise.all(
      (bookings || []).map(async (b) => {
        try {
          const payments = await Payment.find({ booking: b._id });
          const notifications = await Notification.find({ booking: b._id });
          return { ...b, payments: payments || [], notifications: notifications || [] };
        } catch (err) {
          return { ...b, payments: [], notifications: [] };
        }
      })
    );

    res.status(200).json({ success: true, bookings: enrichedBookings });
  } catch (error) {
    console.error("GET PROFESSIONAL BOOKINGS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ACCEPT BOOKING
const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "Cancelled" || booking.status === "Completed") {
      return res.status(400).json({ success: false, message: `Cannot accept booking in ${booking.status} status` });
    }

    booking.status = "Confirmed";
    if (booking.paymentMethod === "Cash" || booking.paymentMethod === "Cash on Delivery") {
      booking.paymentStatus = "Pending (Cash on Delivery)";
    } else {
      booking.paymentStatus = "Paid";
    }

    await booking.save();
    if (metrics && metrics.bookingsConfirmed) metrics.bookingsConfirmed.inc();

    res.status(200).json({
      success: true,
      message: "Booking accepted & confirmed!",
      booking
    });
  } catch (error) {
    console.error("ACCEPT BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// COMPLETE BOOKING (MARK COMPLETED & DISPATCH COMPLETION EMAIL)
const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Cannot complete a cancelled booking" });
    }

    booking.status = "Completed";
    
    if (booking.paymentMethod === "Cash" || booking.paymentMethod === "Cash on Delivery") {
      booking.paymentStatus = "Paid (Cash Collected)";
    } else {
      booking.paymentStatus = "Paid";
    }

    await booking.save();

    if (booking.professional) {
      await Professional.findByIdAndUpdate(booking.professional, { status: "Available" });
    }

    // Send completion email asynchronously in background
    processCompletionEmailNotification(booking, booking.user).catch((err) => {
      console.error("Background completion email error:", err.message);
    });

    if (metrics && metrics.bookingsCompleted) metrics.bookingsCompleted.inc();
    if (metrics && metrics.activeBookings) metrics.activeBookings.dec();

    res.status(200).json({
      success: true,
      message: "Service marked as COMPLETED! Completion email sent to customer email.",
      booking
    });
  } catch (error) {
    console.error("COMPLETE BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// CANCEL BOOKING
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "Cancelled" || booking.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled. Current status is ${booking.status}`
      });
    }

    booking.status = "Cancelled";
    await booking.save();

    if (booking.professional) {
      await Professional.findByIdAndUpdate(booking.professional, { status: "Available" });
    }

    if (metrics && metrics.bookingsCancelled) metrics.bookingsCancelled.inc();
    if (metrics && metrics.activeBookings) metrics.activeBookings.dec();

    res.status(200).json({ success: true, message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// RATE AND REVIEW BOOKING
const rateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Invalid rating value (1-5)" });
    }

    const booking = await Booking.findOne({ _id: id, user: userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.userRating = rating;
    booking.userReview = review || "";
    await booking.save();

    if (booking.service) {
      const service = await Service.findById(booking.service);
      if (service) {
        const currentTotalRatings = service.rating * service.numRatings;
        const newNumRatings = service.numRatings + 1;
        const newAverageRating = (currentTotalRatings + rating) / newNumRatings;

        service.rating = Math.round(newAverageRating * 10) / 10;
        service.numRatings = newNumRatings;
        await service.save();
      }
    }

    res.status(200).json({ success: true, message: "Thank you for your rating!", booking });
  } catch (error) {
    console.error("RATE BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getProfessionalBookings,
  acceptBooking,
  completeBooking,
  cancelBooking,
  rateBooking
};
