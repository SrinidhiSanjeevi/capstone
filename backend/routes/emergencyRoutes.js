const express = require("express");
const router = express.Router();
const {
  dispatchEmergency,
  updateEmergencyStatus,
  getActiveEmergencies,
  getAllEmergencies
} = require("../controllers/emergencyController");
const { protect } = require("../middleware/authMiddleware");

// PROTECTED ROUTES
router.use(protect);

router.post("/dispatch", dispatchEmergency);
router.get("/active", getActiveEmergencies);
router.get("/history", getAllEmergencies);
router.put("/:id/status", updateEmergencyStatus);

module.exports = router;
