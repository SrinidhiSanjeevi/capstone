const EmergencyRequest = require("../models/EmergencyRequest");
const Professional = require("../models/Professional");

// ─── Severity → Emergency Services Mapping ────────────────────────────────────
// Based on severity, determines whether fire engine / govt emergency is dispatched
const SEVERITY_CONFIG = {
  Low: {
    fireEngineDispatched: false,
    fireEngineNumber: null,
    emergencyServiceNumber: null,
    estimatedArrivalMinutes: 30,
    label: "Standard Response"
  },
  Medium: {
    fireEngineDispatched: false,
    fireEngineNumber: null,
    emergencyServiceNumber: "1800-SERV-HELP", // Platform helpline
    estimatedArrivalMinutes: 20,
    label: "Priority Response"
  },
  High: {
    fireEngineDispatched: true,
    fireEngineNumber: "FE-2024",        // Fire Engine unit number
    emergencyServiceNumber: "101",       // Fire brigade
    estimatedArrivalMinutes: 10,
    label: "High Priority — Fire/Emergency Services Alerted"
  },
  Critical: {
    fireEngineDispatched: true,
    fireEngineNumber: "FE-ALPHA-01",    // Critical response fire engine
    emergencyServiceNumber: "101",       // Fire brigade
    estimatedArrivalMinutes: 5,
    label: "CRITICAL — All Emergency Units Dispatched"
  }
};

// ─── Category → Recommended Severity ──────────────────────────────────────────
const CATEGORY_DEFAULT_SEVERITY = {
  Electrical: "High",    // Always potentially life-threatening
  Fire: "Critical",      // Always critical
  Medical: "Critical",   // Always critical
  Plumbing: "Medium",
  Security: "High"
};

// DISPATCH EMERGENCY SERVICE
const dispatchEmergency = async (req, res) => {
  try {
    const { category, severity, description, contactNumber, address } = req.body;
    const userId = req.user._id;

    const validCategories = ["Electrical", "Plumbing", "Security", "Fire", "Medical"];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid emergency category. Must be one of: ${validCategories.join(", ")}.`
      });
    }

    // Use provided severity or auto-detect from category
    const resolvedSeverity = severity || CATEGORY_DEFAULT_SEVERITY[category] || "Medium";
    const validSeverities = ["Low", "Medium", "High", "Critical"];
    if (!validSeverities.includes(resolvedSeverity)) {
      return res.status(400).json({
        success: false,
        message: `Invalid severity. Must be one of: ${validSeverities.join(", ")}.`
      });
    }

    const severityConfig = SEVERITY_CONFIG[resolvedSeverity];

    // Find the highest rated available professional for this category
    const professional = await Professional.findOne({
      category: category === "Fire" || category === "Medical" ? "Electrical" : category, // fallback mapping
      status: "Available"
    }).sort({ rating: -1 });

    if (professional) {
      professional.status = "Busy";
      await professional.save();
    }

    // Build emergency record
    const emergency = await EmergencyRequest.create({
      user: userId,
      category,
      severity: resolvedSeverity,
      description,
      contactNumber,
      address,
      status: "Dispatched",
      assignedProfessional: professional ? professional._id : null,
      fireEngineDispatched: severityConfig.fireEngineDispatched,
      fireEngineNumber: severityConfig.fireEngineNumber,
      emergencyServiceNumber: severityConfig.emergencyServiceNumber,
      estimatedArrivalMinutes: severityConfig.estimatedArrivalMinutes
    });

    // Populate for response
    const populatedEmergency = await EmergencyRequest.findById(emergency._id).populate(
      "assignedProfessional"
    );

    // Build response message
    let message = professional
      ? `Emergency dispatched! Assigned provider: ${professional.name}.`
      : "Emergency requested! Searching for an available nearby provider...";

    if (severityConfig.fireEngineDispatched) {
      message += ` Fire Engine ${severityConfig.fireEngineNumber} has been alerted. Call ${severityConfig.emergencyServiceNumber} for immediate fire/safety assistance.`;
    } else if (severityConfig.emergencyServiceNumber) {
      message += ` Helpline: ${severityConfig.emergencyServiceNumber}.`;
    }

    message += ` ETA: ~${severityConfig.estimatedArrivalMinutes} minutes.`;

    res.status(201).json({
      success: true,
      message,
      severity: resolvedSeverity,
      severityLabel: severityConfig.label,
      fireEngineDispatched: severityConfig.fireEngineDispatched,
      fireEngineNumber: severityConfig.fireEngineNumber,
      emergencyServiceNumber: severityConfig.emergencyServiceNumber,
      estimatedArrivalMinutes: severityConfig.estimatedArrivalMinutes,
      emergency: populatedEmergency
    });
  } catch (error) {
    console.error("EMERGENCY DISPATCH ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE EMERGENCY STATUS (OnTheWay → Arrived → Resolved)
const updateEmergencyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["OnTheWay", "Arrived", "Resolved", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}.`
      });
    }

    const emergency = await EmergencyRequest.findById(id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: "Emergency request not found" });
    }

    if (emergency.status === "Resolved" || emergency.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot update an emergency that is already ${emergency.status}.`
      });
    }

    emergency.status = status;
    if (status === "Resolved") {
      emergency.resolvedAt = new Date();
      // Free up the professional
      if (emergency.assignedProfessional) {
        await Professional.findByIdAndUpdate(emergency.assignedProfessional, { status: "Available" });
      }
    }

    await emergency.save();

    const populatedEmergency = await EmergencyRequest.findById(emergency._id).populate("assignedProfessional");

    res.status(200).json({
      success: true,
      message: `Emergency status updated to: ${status}`,
      emergency: populatedEmergency
    });
  } catch (error) {
    console.error("UPDATE EMERGENCY STATUS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ACTIVE EMERGENCIES FOR USER (all non-resolved)
const getActiveEmergencies = async (req, res) => {
  try {
    const userId = req.user._id;
    const emergencies = await EmergencyRequest.find({
      user: userId,
      status: { $nin: ["Resolved", "Cancelled"] }
    })
      .populate("assignedProfessional")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, emergencies });
  } catch (error) {
    console.error("GET EMERGENCIES ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL EMERGENCIES FOR USER (history)
const getAllEmergencies = async (req, res) => {
  try {
    const userId = req.user._id;
    const emergencies = await EmergencyRequest.find({ user: userId })
      .populate("assignedProfessional")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, emergencies });
  } catch (error) {
    console.error("GET ALL EMERGENCIES ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  dispatchEmergency,
  updateEmergencyStatus,
  getActiveEmergencies,
  getAllEmergencies
};
