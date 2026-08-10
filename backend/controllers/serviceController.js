const Service = require("../models/Service");
const Professional = require("../models/Professional");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET ALL SERVICES
const getServices = async (req, res) => {
  try {
    const services = await Service.find({});

    return res.status(200).json({
      success: true,
      services
    });
  } catch (error) {
    console.error("GET SERVICES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again"
    });
  }
};

// GET ALL PROFESSIONALS
const getProfessionals = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = category
      ? { category }
      : {};

    const professionals =
      await Professional.find(filter);

    return res.status(200).json({
      success: true,
      professionals
    });
  } catch (error) {
    console.error("GET PROFESSIONALS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again"
    });
  }
};

// SEED DATABASE FUNCTION
const seedDatabase = async () => {
  try {
    // ── Seed Admin User (only if none exists) ──────────────────────────
    const adminExists = await User.findOne({
      role: "admin"
    });

    if (!adminExists) {
      const hashedPassword =
        await bcrypt.hash("Admin@123", 10);

      await User.create({
        name: "Admin",
        email: "admin@homeease.com",
        password: hashedPassword,
        role: "admin"
      });

      console.log(
        "✅ Admin user seeded → admin@homeease.com / Admin@123"
      );
    } else {
      console.log(
        "ℹ️ Admin user already exists, skipping admin seed."
      );
    }

    // Seed services database ONLY if no services exist
    const count = await Service.countDocuments();

    if (count === 0) {
      console.log("Seeding services database...");

      const dummyServices = [
        // Spa
        {
          name: "Premium Haircut & Styling",
          category: "Spa",
          price: 499,
          description:
            "Trendy haircut, relaxing hair wash, and blow dry styling by top experts.",
          image:
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80",
          duration: "1 hour",
          rating: 4.9,
          numRatings: 25,
          products: [
            {
              name: "Standard Shampoo",
              brand: "Matrix",
              extraPrice: 0
            },
            {
              name: "Premium Nourishing Therapy",
              brand: "L'Oreal Professional",
              extraPrice: 199
            },
            {
              name: "Luxury Organic Hair Care",
              brand: "Kerastase",
              extraPrice: 399
            }
          ]
        },
        {
          name: "Organic Hair Coloring",
          category: "Spa",
          price: 899,
          description:
            "Ammonia-free organic hair color application for ultimate shine and root coverage.",
          image:
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80",
          duration: "1.5 hours",
          rating: 4.8,
          numRatings: 12,
          products: [
            {
              name: "Basic Shade",
              brand: "Garnier",
              extraPrice: 0
            },
            {
              name: "Rich Color & Hydration",
              brand: "L'Oreal Majirel",
              extraPrice: 299
            },
            {
              name: "Luxury Salon Color Treatment",
              brand: "Schwarzkopf",
              extraPrice: 499
            }
          ]
        },
        {
          name: "Relaxing Aromatherapy Massage",
          category: "Spa",
          price: 1299,
          description:
            "Full body massage with essential oils, relieves pain, tension, and stress.",
          image:
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80",
          duration: "1.5 hours",
          rating: 4.9,
          numRatings: 22,
          products: [
            {
              name: "Jasmine Essential Oil",
              brand: "Kama Ayurveda",
              extraPrice: 0
            },
            {
              name: "Premium Deep Tissue Oil",
              brand: "Forest Essentials",
              extraPrice: 199
            }
          ]
        },
        {
          name: "Glowing Gold Facial",
          category: "Spa",
          price: 1499,
          description:
            "Premium skin cleansing, de-tan scrub, massage, and gold dust foil pack for instant glow.",
          image:
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80",
          duration: "1.5 hours",
          rating: 4.8,
          numRatings: 18,
          products: [
            {
              name: "Standard Face Pack",
              brand: "VLCC",
              extraPrice: 0
            },
            {
              name: "De-tan & Whitening Scrub",
              brand: "O3+",
              extraPrice: 249
            },
            {
              name: "Premium Anti-Aging Gold Facial",
              brand: "Cheryl's",
              extraPrice: 499
            }
          ]
        },

        // Plumbing
        {
          name: "Dripping Tap & Leaks Repair",
          category: "Plumbing",
          price: 349,
          description:
            "Fix leaking valves, faucet repairs, pipe washers, and silicone sealing.",
          image:
            "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
          duration: "45 mins",
          rating: 4.5,
          numRatings: 56,
          products: [
            {
              name: "Standard Washers & Teflon Tape",
              brand: "Champion",
              extraPrice: 0
            },
            {
              name: "Premium Brass Spindle replacement",
              brand: "Jaguar",
              extraPrice: 199
            },
            {
              name: "Designer Faucet Replacement",
              brand: "Kohler",
              extraPrice: 899
            }
          ]
        },
        {
          name: "Water Tank Leakage & Issue Diagnostics",
          category: "Plumbing",
          price: 799,
          description:
            "Diagnosis of water tank leaks, automatic water level controller fix, and plumbing pipe routing.",
          image:
            "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=600&q=80",
          duration: "1.5 hours",
          rating: 4.7,
          numRatings: 21,
          products: [
            {
              name: "Standard PVC pipe couplings",
              brand: "Supreme",
              extraPrice: 0
            },
            {
              name: "Premium Leak Proof Adhesive & Brass Connectors",
              brand: "M-Seal & Astral",
              extraPrice: 249
            }
          ]
        },
        {
          name: "Drain & Pipe Blockage Unclogging",
          category: "Plumbing",
          price: 449,
          description:
            "Mechanical springs & eco-friendly acids to clear bathroom, kitchen, or balcony blockages.",
          image:
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
          duration: "1 hour",
          rating: 4.6,
          numRatings: 37,
          products: [
            {
              name: "Standard Chemical Cleaner",
              brand: "Kiwi Dranex",
              extraPrice: 0
            },
            {
              name: "Heavy Duty Acidic Declogger + Drain Strainer",
              brand: "Klean-All",
              extraPrice: 129
            }
          ]
        },
        {
          name: "Toilet Flush & Commode Repair",
          category: "Plumbing",
          price: 599,
          description:
            "Repair internal tank flush valves, syphon mechanisms, float balls, and seat alignments.",
          image:
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
          duration: "1 hour",
          rating: 4.5,
          numRatings: 19,
          products: [
            {
              name: "Standard Syphon Kit",
              brand: "Champion",
              extraPrice: 0
            },
            {
              name: "Heavy Duty Flush Fittings",
              brand: "Parryware",
              extraPrice: 349
            }
          ]
        },

        // Carpentry
        {
          name: "Bed & Wardrobe Assembly",
          category: "Carpentry",
          price: 599,
          description:
            "Assembly of large furniture, adjustments, and alignment check.",
          image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
          duration: "2 hours",
          rating: 4.8,
          numRatings: 42,
          products: [
            {
              name: "Standard Screws & Glue",
              brand: "Fevicol",
              extraPrice: 0
            },
            {
              name: "Heavy Duty L-Brackets & Alignment Pins",
              brand: "Hettich",
              extraPrice: 149
            }
          ]
        },
        {
          name: "Door & Window Lock Fixing",
          category: "Carpentry",
          price: 299,
          description:
            "Repair or new installation of doors, handles, locks, latches, or hydraulic closers.",
          image:
            "https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2?auto=format&fit=crop&w=600&q=80",
          duration: "30 mins",
          rating: 4.7,
          numRatings: 28,
          products: [
            {
              name: "Basic Latches",
              brand: "Local Hardware",
              extraPrice: 0
            },
            {
              name: "Stainless Steel Handle & Lock Set",
              brand: "Godrej",
              extraPrice: 499
            },
            {
              name: "Premium Double Bullet Keypad Lock Set",
              brand: "Yale",
              extraPrice: 1199
            }
          ]
        },
        {
          name: "Sofa Frame & Cabinet Repair",
          category: "Carpentry",
          price: 499,
          description:
            "Fixing creaky wooden sofa joints, cabinet hinge alignments, and drawer sliders.",
          image:
            "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80",
          duration: "1 hour",
          rating: 4.6,
          numRatings: 18,
          products: [
            {
              name: "Standard Hardware Nails",
              brand: "Champion",
              extraPrice: 0
            },
            {
              name: "Premium Self-Closing Hinge Upgrades",
              brand: "Hettich",
              extraPrice: 199
            }
          ]
        },

        // Electrician
        {
          name: "Ceiling Fan Installation & Repair",
          category: "Electrician",
          price: 399,
          description:
            "Professional assembly, safe wiring mounting, and speed regulator checking.",
          image:
            "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
          duration: "45 mins",
          rating: 4.6,
          numRatings: 32,
          products: [
            {
              name: "Standard Wires",
              brand: "Anchor",
              extraPrice: 0
            },
            {
              name: "Heavy Duty FR-LSH Wires & Anchor Fasteners",
              brand: "Finolex",
              extraPrice: 99
            },
            {
              name: "Premium Modular Switch & Wires Kit",
              brand: "Legrand",
              extraPrice: 199
            }
          ]
        },
        {
          name: "Complete Home Safety Wiring Check",
          category: "Electrician",
          price: 1199,
          description:
            "Full checkup of socket load, main distribution board, MCBs, earthing, and switches.",
          image:
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
          duration: "2 hours",
          rating: 4.9,
          numRatings: 15,
          products: [
            {
              name: "Inspection Report Only",
              brand: "Standard Check",
              extraPrice: 0
            },
            {
              name: "Inspection + Standard MCB Replacement",
              brand: "Havells",
              extraPrice: 349
            },
            {
              name: "Inspection + Premium Smart Wi-Fi Relay Box",
              brand: "Sonoff",
              extraPrice: 699
            }
          ]
        },
        {
          name: "Switchboard Repair & Socket Installation",
          category: "Electrician",
          price: 249,
          description:
            "Quick diagnostic and repair of faulty switches, new socket configurations, or modular replacements.",
          image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
          duration: "30 mins",
          rating: 4.7,
          numRatings: 44,
          products: [
            {
              name: "Anchor Socket Only",
              brand: "Anchor",
              extraPrice: 0
            },
            {
              name: "Roma Modular Premium Switches",
              brand: "Panasonic Roma",
              extraPrice: 49
            },
            {
              name: "Goldmedal Smart Connected Socket",
              brand: "Goldmedal",
              extraPrice: 199
            }
          ]
        },

        // Security
        {
          name: "CCTV Camera Installation",
          category: "Security",
          price: 1499,
          description:
            "Mounting, cable routing, DVR config, mobile viewing setup for security cameras.",
          image:
            "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
          duration: "2 hours",
          rating: 4.9,
          numRatings: 21,
          products: [
            {
              name: "Installation labor only (customer provides camera)",
              brand: "N/A",
              extraPrice: 0
            },
            {
              name: "1080P Smart Dome Camera Bundle",
              brand: "Hikvision",
              extraPrice: 1999
            },
            {
              name: "Premium 2K Smart Wi-Fi PTZ Camera Bundle",
              brand: "CP Plus",
              extraPrice: 2999
            }
          ]
        },
        {
          name: "Smart Wi-Fi Door Lock Setup",
          category: "Security",
          price: 999,
          description:
            "Precise wood carving, lock insertion, biometric fingerprint registration, and app sync.",
          image:
            "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
          duration: "1.5 hours",
          rating: 4.8,
          numRatings: 13,
          products: [
            {
              name: "Smart lock installation only (customer provides lock)",
              brand: "N/A",
              extraPrice: 0
            },
            {
              name: "Fingerprint & Pin lock with Wi-Fi",
              brand: "Godrej Advantis",
              extraPrice: 8999
            },
            {
              name: "High-End Smart Video Door Lock",
              brand: "Yale Smart Living",
              extraPrice: 14999
            }
          ]
        },

        // Repair (AC/Cleaning)
        {
          name: "Deep House Cleaning",
          category: "Repair",
          price: 1499,
          description:
            "Deep scrubbing of floors, kitchen tiles, washroom sanitization, and dust cobweb removal.",
          image:
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
          duration: "4 hours",
          rating: 4.9,
          numRatings: 64,
          products: [
            {
              name: "Eco-friendly cleaning agents",
              brand: "GreenClean",
              extraPrice: 0
            },
            {
              name: "Deep Disinfectant & Fragrant Floor Wash",
              brand: "Taski Diversey",
              extraPrice: 299
            }
          ]
        },
        {
          name: "AC Deep Filter & Foam Service",
          category: "Repair",
          price: 649,
          description:
            "High-pressure water pump cleaning, indoor cooling coil foaming, and drain tray flush.",
          image:
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
          duration: "1.2 hours",
          rating: 4.7,
          numRatings: 49,
          products: [
            {
              name: "Water Jet Filter Wash",
              brand: "Standard",
              extraPrice: 0
            },
            {
              name: "Eco Jet Cleaning + Anti-bacterial Foam treatment",
              brand: "3M",
              extraPrice: 199
            }
          ]
        },
        {
          name: "Sofa & Upholstery Dry Cleaning",
          category: "Repair",
          price: 899,
          description:
            "Deep chemical scrubbing, vacuum extraction, dust mite removal, and fabric refresh.",
          image:
            "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80",
          duration: "2 hours",
          rating: 4.8,
          numRatings: 33,
          products: [
            {
              name: "Standard Fabric Cleanse",
              brand: "EcoWash",
              extraPrice: 0
            },
            {
              name: "Organic Deep Foam Wash & Stain Protection Guard",
              brand: "3M Scotchgard",
              extraPrice: 199
            }
          ]
        }
      ];

      await Service.insertMany(dummyServices);

      console.log(
        "Services seeded successfully!"
      );
    } else {
      console.log(
        `ℹ️ ${count} services already exist, skipping service seed.`
      );
    }

    // Seed professionals database ONLY if none exist
    const profCount =
      await Professional.countDocuments();

    if (profCount === 0) {
      console.log(
        "Seeding professionals database..."
      );

      const dummyProfessionals = [
        // Spa
        {
          name: "Aria Montgomery",
          category: "Spa",
          rating: 4.9,
          experience: 5,
          image:
            "https://randomuser.me/api/portraits/women/44.jpg",
          status: "Available"
        },
        {
          name: "Priya Sharma",
          category: "Spa",
          rating: 4.8,
          experience: 3,
          image:
            "https://randomuser.me/api/portraits/women/65.jpg",
          status: "Available"
        },
        {
          name: "Nina Kapoor",
          category: "Spa",
          rating: 4.7,
          experience: 6,
          image:
            "https://randomuser.me/api/portraits/women/68.jpg",
          status: "Available"
        },

        // Electrician
        {
          name: "David Vance",
          category: "Electrician",
          rating: 4.8,
          experience: 8,
          image:
            "https://randomuser.me/api/portraits/men/32.jpg",
          status: "Available"
        },
        {
          name: "Rajan Mehta",
          category: "Electrician",
          rating: 4.7,
          experience: 5,
          image:
            "https://randomuser.me/api/portraits/men/45.jpg",
          status: "Available"
        },
        {
          name: "Samuel Torres",
          category: "Electrician",
          rating: 4.6,
          experience: 7,
          image:
            "https://randomuser.me/api/portraits/men/55.jpg",
          status: "Available"
        },

        // Carpentry
        {
          name: "John Carpenter",
          category: "Carpentry",
          rating: 4.7,
          experience: 12,
          image:
            "https://randomuser.me/api/portraits/men/22.jpg",
          status: "Available"
        },
        {
          name: "Vikram Singh",
          category: "Carpentry",
          rating: 4.8,
          experience: 9,
          image:
            "https://randomuser.me/api/portraits/men/67.jpg",
          status: "Available"
        },
        {
          name: "Arun Pillai",
          category: "Carpentry",
          rating: 4.6,
          experience: 4,
          image:
            "https://randomuser.me/api/portraits/men/71.jpg",
          status: "Available"
        },

        // Plumbing
        {
          name: "Robert Wade",
          category: "Plumbing",
          rating: 4.6,
          experience: 6,
          image:
            "https://randomuser.me/api/portraits/men/36.jpg",
          status: "Available"
        },
        {
          name: "Suresh Kumar",
          category: "Plumbing",
          rating: 4.7,
          experience: 10,
          image:
            "https://randomuser.me/api/portraits/men/43.jpg",
          status: "Available"
        },
        {
          name: "James Patel",
          category: "Plumbing",
          rating: 4.5,
          experience: 3,
          image:
            "https://randomuser.me/api/portraits/men/81.jpg",
          status: "Available"
        },

        // Security
        {
          name: "Marcus Shield",
          category: "Security",
          rating: 4.9,
          experience: 9,
          image:
            "https://randomuser.me/api/portraits/men/14.jpg",
          status: "Available"
        },
        {
          name: "Kiran Nair",
          category: "Security",
          rating: 4.8,
          experience: 7,
          image:
            "https://randomuser.me/api/portraits/men/29.jpg",
          status: "Available"
        },

        // Repair
        {
          name: "Elena Rostova",
          category: "Repair",
          rating: 4.8,
          experience: 4,
          image:
            "https://randomuser.me/api/portraits/women/12.jpg",
          status: "Available"
        },
        {
          name: "Meera Iyer",
          category: "Repair",
          rating: 4.7,
          experience: 6,
          image:
            "https://randomuser.me/api/portraits/women/33.jpg",
          status: "Available"
        },
        {
          name: "Asha Reddy",
          category: "Repair",
          rating: 4.6,
          experience: 5,
          image:
            "https://randomuser.me/api/portraits/women/57.jpg",
          status: "Available"
        },

        // General
        {
          name: "Raj Kumar",
          category: "General",
          rating: 4.5,
          experience: 3,
          image:
            "https://randomuser.me/api/portraits/men/90.jpg",
          status: "Available"
        },
        {
          name: "Anita Desai",
          category: "General",
          rating: 4.6,
          experience: 5,
          image:
            "https://randomuser.me/api/portraits/women/90.jpg",
          status: "Available"
        }
      ];

      await Professional.insertMany(
        dummyProfessionals
      );

      console.log(
        "Professionals seeded successfully!"
      );
    } else {
      console.log(
        `ℹ️ ${profCount} professionals already exist, skipping professional seed.`
      );
    }
  } catch (error) {
    console.error(
      "SEEDING DATABASE ERROR:",
      error
    );
  }
};

module.exports = {
  getServices,
  getProfessionals,
  seedDatabase
};