import React, { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Emergency from "./pages/Emergency";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import BookingModal from "./components/BookingModal";
import Toast from "./components/Toast";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Core Data
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeEmergencies, setActiveEmergencies] = useState([]);

  // Modals / Alerts
  const [bookingService, setBookingService] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
    setBookings([]);
    setActiveEmergencies([]);
    setActiveTab("dashboard");
    showToast("Logged out successfully", "success");
  };

  // FETCH SERVICES
  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (response.ok && data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error("Fetch Services Error:", error);
    }
  };

  // FETCH PROFESSIONALS
  const fetchProfessionals = async () => {
    try {
      const response = await fetch("/api/services/professionals");
      const data = await response.json();
      if (response.ok && data.success) {
        setProfessionals(data.professionals);
      }
    } catch (error) {
      console.error("Fetch Professionals Error:", error);
    }
  };

  // FETCH USER OR PROFESSIONAL BOOKINGS
  const fetchBookings = async () => {
    if (!token) return;
    try {
      const endpoint = user?.role === "professional" ? "/api/bookings/professional" : "/api/bookings/my-bookings";
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setBookings(data.bookings);
      } else {
        // Fallback endpoint
        const fbRes = await fetch("/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fbData = await fbRes.json();
        if (fbRes.ok && fbData.success) {
          setBookings(fbData.bookings);
        }
      }
    } catch (error) {
      console.error("Fetch Bookings Error:", error);
    }
  };

  // FETCH ACTIVE EMERGENCIES
  const fetchEmergencies = async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/emergency/active", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setActiveEmergencies(data.emergencies);
      }
    } catch (error) {
      console.error("Fetch Emergencies Error:", error);
    }
  };

  // INITIAL MOUNT LOADERS
  useEffect(() => {
    fetchServices();
    fetchProfessionals();
  }, []);

  // LOAD WHEN TOKEN / USER LOGS IN
  useEffect(() => {
    if (token) {
      fetchBookings();
      fetchEmergencies();
    }
  }, [token, user]);

  // BOOKING CREATION SUBMIT
  const handleBookSubmit = async (bookingData) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast(data.message, "success");
        setBookingService(null);
        fetchBookings();
        fetchProfessionals();
      } else {
        showToast(data.message || "Failed to book service", "error");
      }
    } catch (error) {
      console.error("Booking submit error:", error);
      showToast("Server communication error", "error");
    }
  };

  // PROFESSIONAL ACCEPT BOOKING (Triggers Payment & Notification Simulation)
  const handleAcceptBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast(data.message, "success");
        fetchBookings();
        fetchProfessionals();
      } else {
        showToast(data.message || "Failed to accept booking", "error");
      }
    } catch (error) {
      console.error("Accept booking error:", error);
      showToast("Server communication error", "error");
    }
  };

  // PROFESSIONAL COMPLETE BOOKING
  const handleCompleteBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast(data.message, "success");
        fetchBookings();
        fetchProfessionals();
      } else {
        showToast(data.message || "Failed to complete booking", "error");
      }
    } catch (error) {
      console.error("Complete booking error:", error);
      showToast("Server communication error", "error");
    }
  };

  // BOOKING CANCELLATION SUBMIT
  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Booking cancelled successfully", "success");
        fetchBookings();
        fetchProfessionals();
      } else {
        showToast(data.message || "Failed to cancel booking", "error");
      }
    } catch (error) {
      console.error("Booking cancellation error:", error);
      showToast("Server communication error", "error");
    }
  };

  // RATING SUBMIT
  const handleRateBooking = async (bookingId, rating, review) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/rate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, review }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Feedback submitted. Thank you!", "success");
        fetchBookings();
        fetchServices();
        fetchProfessionals();
      } else {
        showToast(data.message || "Failed to submit rating", "error");
      }
    } catch (error) {
      console.error("Rate booking error:", error);
      showToast("Server communication error", "error");
    }
  };

  // EMERGENCY DISPATCH SUBMIT
  const handleDispatchEmergency = async (emergencyData) => {
    try {
      const response = await fetch("/api/emergency/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emergencyData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast(data.message, "success");
        fetchEmergencies();
        fetchProfessionals();
      } else {
        showToast(data.message || "Failed to dispatch emergency", "error");
      }
    } catch (error) {
      console.error("Emergency dispatch error:", error);
      showToast("Server communication error", "error");
    }
  };

  // GUEST LOGIN SCREEN ROUTER
  if (!token || !user) {
    return (
      <>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
        <Auth onLoginSuccess={handleLoginSuccess} showToast={showToast} />
      </>
    );
  }

  // ADMIN PANEL ROUTER
  if (user?.role === "admin") {
    return (
      <>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
        <AdminDashboard token={token} user={user} onLogout={handleLogout} />
      </>
    );
  }

  return (
    <div>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>

        {activeTab === "dashboard" && (
          <Dashboard services={services} onBookClick={setBookingService} />
        )}

        {activeTab === "bookings" && (
          <Bookings
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onRateBooking={handleRateBooking}
            onAcceptBooking={handleAcceptBooking}
            onCompleteBooking={handleCompleteBooking}
            isProfessionalMode={user?.role === "professional"}
          />
        )}

        {activeTab === "emergency" && (
          <Emergency
            activeEmergencies={activeEmergencies}
            onDispatchEmergency={handleDispatchEmergency}
            showToast={showToast}
            token={token}
          />
        )}

        {activeTab === "profile" && (
          <Profile user={user} bookings={bookings} onLogout={handleLogout} />
        )}

      </div>

      {bookingService && (
        <BookingModal
          service={bookingService}
          onClose={() => setBookingService(null)}
          onSubmit={handleBookSubmit}
          professionals={professionals}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
