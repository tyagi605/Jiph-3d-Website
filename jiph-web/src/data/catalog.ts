/**
 * Product data transcribed from the JIPH catalogue (136 pages).
 * This file stands in for the CMS until Payload + PostgreSQL are wired up;
 * every getter in src/lib/catalog.ts is the only thing pages import, so the
 * swap is local to that file.
 *
 * VERIFY WITH JIPH before launch (catalogue layout made these ambiguous):
 *  - Scholar 90: 3-seater (1104) and 4-seater (1105) widths 1500 / 1800 mm.
 *  - Formula-1 / Formula-2 overall dimensions (pairing of 2440 vs 2406 mm).
 *  - Codes 2612 and 2613 are shared by Wisdom-30/Focus-3/Formula-1 and
 *    Wisdom-50/Formula-2 in the catalogue. Slugs are used as identity here.
 */

export type Kind =
  | "desk-bench"
  | "lecture-row"
  | "teacher-table"
  | "reading-table"
  | "cafe-table"
  | "lab-table"
  | "kids-table"
  | "rack"
  | "bed"
  | "bunk"
  | "wardrobe"
  | "audi-chair";

export type Size = {
  code: string;
  label: string;
  seats?: number;
  /** W × D × H in millimetres */
  dims: [number, number, number];
};

export type Product = {
  slug: string;
  name: string;
  code: string;
  range: string;
  kind: Kind;
  tagline: string;
  description: string;
  features: string[];
  sizes: Size[];
  tags: string[];
  /** Laminate and powder-coat options apply; false for e.g. colour-moulded kids furniture */
  finishes?: boolean;
  colours?: { name: string; code: string; hex: string }[];
  govtProject?: string;
};

export type Range = {
  slug: string;
  name: string;
  building: string;
  segment: "institutional" | "office";
  summary: string;
};

export const ranges: Range[] = [
  { slug: "lecture-hall-seating", name: "Lecture Hall Seating", building: "Academic block", segment: "institutional", summary: "Fixed, tiered desking with tip-up seats, writing tops and power modules for universities and medical colleges." },
  { slug: "classroom-desks", name: "Classroom Desks", building: "Academic block", segment: "institutional", summary: "Desk-and-bench systems trusted on UP, Delhi and A.P. government school projects." },
  { slug: "kids-furniture", name: "Kids Furniture", building: "Primary wing", segment: "institutional", summary: "Colourful modular tables for preschools, Montessori and early-learning rooms." },
  { slug: "teacher-tables", name: "Teacher Tables", building: "Academic block", segment: "institutional", summary: "Mentor series tables sized for teaching material, laptops and daily use." },
  { slug: "library", name: "Library Furniture", building: "Library", segment: "institutional", summary: "Book racks, periodical displays and reading tables built for heavy daily use." },
  { slug: "hostel", name: "Hostel Furniture", building: "Hostel", segment: "institutional", summary: "Beds with storage, bunk and loft beds, and wardrobes for student housing." },
  { slug: "cafeteria", name: "Cafeteria Furniture", building: "Cafeteria", segment: "institutional", summary: "Cantina dining tables with heavy-duty steel frames for canteens and food courts." },
  { slug: "laboratory", name: "Laboratory Furniture", building: "Science labs", segment: "institutional", summary: "Island lab tables with reagent shelving, power hubs and chemical-resistant tops." },
  { slug: "auditorium", name: "Auditorium Seating", building: "Auditorium", segment: "institutional", summary: "Upholstered tip-up auditorium chairs with seat numbering and aisle lighting." },
];

export const laminates = [
  { code: "638", name: "Lorrian", hex: "#B08A63" },
  { code: "620", name: "Exotic Teak", hex: "#9A6A43" },
  { code: "606", name: "Thansau", hex: "#C9A57C" },
  { code: "630", name: "Dark Acacia", hex: "#5E4130" },
  { code: "PW", name: "Persian Walnut", hex: "#6F4B35" },
  { code: "WM", name: "Walnut Maple", hex: "#C69D6E" },
];

export const powderCoats = [
  { name: "Dark Grey", hex: "#3C4046" },
  { name: "JIPH White", hex: "#EDEDEA" },
  { name: "Munsheel Grey", hex: "#8C9196" },
  { name: "Siemens Grey", hex: "#A7ACB0" },
  { name: "D.A. Gray", hex: "#6B7075" },
  { name: "Metallic Gray", hex: "#7F8489" },
  { name: "Silver Grey", hex: "#B9BCBF" },
];

const lectureFeatures = ["Powder-coated heavy steel frame", "Laminated wooden writing top", "Laminate in 6 shades, frame in 7 powder-coat shades", "Size tolerance ±5 mm"];

export const products: Product[] = [
  // ---------- Lecture hall ----------
  {
    slug: "scholar-213", name: "Scholar 213", code: "1004", range: "lecture-hall-seating", kind: "lecture-row",
    tagline: "Premium fixed lecture theatre seating system",
    description: "Ergonomic seating, integrated workspace and a heavy-duty steel framework in a fixed tiered configuration, built for universities, engineering and medical colleges, business schools and training centres.",
    features: ["Foldable seat", "Power socket on the writing top", ...lectureFeatures],
    sizes: [
      { code: "1004", label: "2 Seater", seats: 2, dims: [1200, 450, 750] },
      { code: "1005", label: "3 Seater", seats: 3, dims: [1800, 450, 750] },
      { code: "1006", label: "4 Seater", seats: 4, dims: [2400, 450, 750] },
    ],
    tags: ["university", "college", "medical"], finishes: true,
  },
  {
    slug: "scholar-105", name: "Scholar 105", code: "1008", range: "lecture-hall-seating", kind: "lecture-row",
    tagline: "Premium fixed lecture hall seating with upholstered flip-up seats",
    description: "Upholstered flip-up seats, continuous writing tops and a heavy-duty steel structure for efficient, durable lecture theatres.",
    features: ["Upholstered flip-up seat", "Power switch socket", ...lectureFeatures],
    sizes: [
      { code: "1008", label: "2 Seater", seats: 2, dims: [1050, 450, 750] },
      { code: "1009", label: "3 Seater", seats: 3, dims: [1530, 450, 750] },
      { code: "1010", label: "4 Seater", seats: 4, dims: [2010, 450, 750] },
    ],
    tags: ["university", "college", "medical"], finishes: true,
  },
  {
    slug: "scholar-02", name: "Scholar 02", code: "1011", range: "lecture-hall-seating", kind: "lecture-row",
    tagline: "Fixed lecture hall desk system with perforated modesty panel",
    description: "A robust steel frame with a perforated metal modesty panel. The tip-up wooden seat frees aisle space when unoccupied, and the integrated writing desk suits note-taking and laptops.",
    features: ["Tip-up wooden seat", "Under-desk storage rack", "Perforated metal modesty panel", ...lectureFeatures],
    sizes: [
      { code: "1011", label: "2 Seater", seats: 2, dims: [1100, 400, 750] },
      { code: "1012", label: "3 Seater", seats: 3, dims: [1600, 400, 750] },
      { code: "1013", label: "4 Seater", seats: 4, dims: [2100, 400, 750] },
    ],
    tags: ["university", "college"], finishes: true,
  },
  {
    slug: "scholar-229", name: "Scholar 229", code: "1014", range: "lecture-hall-seating", kind: "lecture-row",
    tagline: "Smart lecture hall seating system",
    description: "Space-saving tip-up seating, an integrated writing desk and a perforated modesty panel, grouted to the floor for a rigid, quiet installation.",
    features: ["Grouted floor mounting", "Under-desk storage racks", ...lectureFeatures],
    sizes: [
      { code: "1014", label: "2 Seater", seats: 2, dims: [1050, 350, 750] },
      { code: "1015", label: "3 Seater", seats: 3, dims: [1550, 350, 750] },
      { code: "1016", label: "4 Seater", seats: 4, dims: [2025, 400, 750] },
    ],
    tags: ["university", "college"], finishes: true,
  },
  {
    slug: "scholar-228", name: "Scholar 228", code: "1017", range: "lecture-hall-seating", kind: "lecture-row",
    tagline: "Professional lecture hall desking with desktop power",
    description: "Technology-ready desking for smart classrooms: an integrated desktop power module gives every student access to power for laptops and devices.",
    features: ["Desktop power module", ...lectureFeatures],
    sizes: [
      { code: "1017", label: "2 Seater", seats: 2, dims: [1200, 400, 760] },
      { code: "1018", label: "3 Seater", seats: 3, dims: [1800, 400, 760] },
      { code: "1019", label: "4 Seater", seats: 4, dims: [2400, 400, 760] },
    ],
    tags: ["university", "college", "smart-classroom"], finishes: true,
  },
  {
    slug: "scholar-25", name: "Scholar 25", code: "1020", range: "lecture-hall-seating", kind: "lecture-row",
    tagline: "Durable lecture hall seating system",
    description: "A heavy-duty CRCA steel frame, premium wooden worktop and wooden modesty panel for universities, engineering and medical colleges.",
    features: ["CRCA steel frame", "Wooden modesty panel", "Grouted floor mounting", ...lectureFeatures],
    sizes: [
      { code: "1020", label: "2 Seater", seats: 2, dims: [1050, 350, 750] },
      { code: "1021", label: "3 Seater", seats: 3, dims: [1600, 350, 750] },
      { code: "1022", label: "4 Seater", seats: 4, dims: [2100, 350, 750] },
    ],
    tags: ["university", "medical"], finishes: true,
  },
  {
    slug: "scholar-30", name: "Scholar 30", code: "1026", range: "lecture-hall-seating", kind: "lecture-row",
    tagline: "Curved lecture hall seating, installed at IIM Rohtak",
    description: "A curved layout for better sight-lines, a heavy-duty steel support structure and a premium laminated work surface.",
    features: ["Curved layout for visibility", "Heavy-duty steel support", "Premium laminated work surface", "Laminate in 6 shades, frame in 7 powder-coat shades"],
    sizes: [{ code: "1026", label: "4 Seater", seats: 4, dims: [2400, 600, 750] }],
    tags: ["university", "management-school"], finishes: true,
  },

  // ---------- Classroom ----------
  {
    slug: "scholar-90", name: "Scholar 90", code: "1102", range: "classroom-desks", kind: "desk-bench",
    tagline: "The trusted benchmark for classroom desks",
    description: "One of JIPH's most trusted classroom solutions: a robust steel structure, premium work surface and ergonomic seating, supplied to government education projects and leading private schools.",
    features: ["Heavy-duty steel frame", "Wooden seat and backrest", "Side bag hook", "Under-desk book storage"],
    sizes: [
      { code: "1102", label: "1 Seater", seats: 1, dims: [600, 930, 750] },
      { code: "1103", label: "2 Seater", seats: 2, dims: [1066, 930, 750] },
      { code: "1104", label: "3 Seater", seats: 3, dims: [1500, 930, 760] },
      { code: "1105", label: "4 Seater", seats: 4, dims: [1800, 930, 760] },
    ],
    tags: ["school", "government"], finishes: true,
  },
  {
    slug: "scholar-91", name: "Scholar 91", code: "1106", range: "classroom-desks", kind: "desk-bench",
    tagline: "Compact desk-bench for UP Government school projects",
    description: "A compact three-seater that maximises learning space in primary classrooms, with a powder-coated frame and pre-laminated seat.",
    features: ["Bag hook", "Powder-coated frame", "Pre-laminated seat"],
    sizes: [
      { code: "1106", label: "Scholar 91 · 3 Seater", seats: 3, dims: [1250, 775, 595] },
      { code: "1107", label: "Scholar 91/A · 3 Seater", seats: 3, dims: [1500, 850, 675] },
    ],
    tags: ["school", "government", "primary"], finishes: true, govtProject: "UP Government School Projects",
  },
  {
    slug: "scholar-15", name: "Scholar 15", code: "1109", range: "classroom-desks", kind: "desk-bench",
    tagline: "Reliable desk and bench system for high-usage classrooms",
    description: "A robust powder-coated steel frame and durable writing surface for schools, colleges and coaching institutes.",
    features: ["Bag hook", "Solid steel frame", "Pre-laminated seat"],
    sizes: [
      { code: "1109", label: "2 Seater", seats: 2, dims: [1050, 950, 750] },
      { code: "1110", label: "3 Seater", seats: 3, dims: [1500, 950, 750] },
      { code: "1111", label: "4 Seater", seats: 4, dims: [1800, 950, 750] },
    ],
    tags: ["school", "coaching"], finishes: true,
  },

  // ---------- Kids ----------
  {
    slug: "victor-1", name: "Victor-1", code: "1201", range: "kids-furniture", kind: "kids-table",
    tagline: "Modular kindergarten table",
    description: "Turns kindergarten classrooms into vibrant, interactive spaces. The modular design supports collaborative play, built with child-safe materials for preschools, daycare centres and Montessori schools.",
    features: ["Modular layouts", "Child-safe materials", "Four colours"],
    sizes: [{ code: "1201", label: "1 Seater", seats: 1, dims: [700, 600, 450] }],
    colours: [
      { name: "Red", code: "1201", hex: "#D8343B" },
      { name: "Blue", code: "1202", hex: "#2F6FD0" },
      { name: "Green", code: "1203", hex: "#3E9E5A" },
      { name: "Yellow", code: "1204", hex: "#F2B533" },
    ],
    tags: ["kindergarten", "preschool"],
  },

  // ---------- Teacher ----------
  {
    slug: "mentor-1", name: "Mentor-1", code: "1301", range: "teacher-tables", kind: "teacher-table",
    tagline: "Teacher table for modern classrooms",
    description: "A spacious surface for teaching material and devices at an ergonomic 750 mm height, with a durable build for everyday use.",
    features: ["Sturdy construction", "Spacious surface", "Ergonomic height", "Durable finish"],
    sizes: [{ code: "1301", label: "Standard", dims: [1200, 600, 750] }],
    tags: ["school", "college"], finishes: true,
  },
  {
    slug: "mentor-2", name: "Mentor-2", code: "1302", range: "teacher-tables", kind: "teacher-table",
    tagline: "Large teacher table",
    description: "A wider worktop for teaching material, a laptop and personal workspace.",
    features: ["Sturdy construction", "Spacious surface", "Ergonomic height"],
    sizes: [{ code: "1302", label: "Large", dims: [1500, 750, 750] }],
    tags: ["school", "college"], finishes: true,
  },

  // ---------- Library ----------
  {
    slug: "wisdom-1", name: "Wisdom-1", code: "4102", range: "library", kind: "rack",
    tagline: "Low-height library rack",
    description: "Structural cross-bracing at the rear keeps it wobble-free. Easy-access, high-capacity storage for books, journals and files without dominating the room.",
    features: ["Rear cross-bracing", "Low height for open sight-lines", "Steel shelves"],
    sizes: [{ code: "4102", label: "Standard", dims: [900, 600, 1080] }],
    tags: ["library", "school", "college"], finishes: true,
  },
  {
    slug: "wisdom-10", name: "Wisdom-10", code: "4104", range: "library", kind: "rack",
    tagline: "Periodical display rack",
    description: "Robust slanted steel shelves with a front retaining lip display magazines and journals without slipping. Metal or wooden outer frame.",
    features: ["Slanted display shelves", "Front retaining lip", "Metal or wooden frame"],
    sizes: [{ code: "4104", label: "Standard", dims: [900, 600, 1835] }],
    tags: ["library"], finishes: true,
  },
  {
    slug: "wisdom-3", name: "Wisdom-3", code: "4103", range: "library", kind: "rack",
    tagline: "Tall double-sided book rack",
    description: "Robust steel shelves, a central spine support and metal side panels for high-capacity collections.",
    features: ["Central spine support", "Metal side panels", "Steel shelves"],
    sizes: [{ code: "4103", label: "Standard", dims: [1200, 590, 2078] }],
    tags: ["library", "university"], finishes: true,
  },
  {
    slug: "wisdom-27", name: "Wisdom-27", code: "2608", range: "library", kind: "reading-table",
    tagline: "Heavy-duty library reading table",
    description: "A rock-solid powder-coated steel apron and heavy-gauge tubular legs for school libraries, universities and seminar rooms.",
    features: ["Powder-coated steel apron", "Heavy-gauge tubular legs", "Scratch-resistant top"],
    sizes: [{ code: "2608", label: "Standard", dims: [1800, 900, 750] }],
    tags: ["library", "seminar"], finishes: true,
  },
  {
    slug: "wisdom-50", name: "Wisdom-50", code: "2613", range: "library", kind: "reading-table",
    tagline: "Modern reading table",
    description: "Ample workspace and a clean, contemporary design for libraries, study zones and collaborative spaces.",
    features: ["Ample workspace", "Durable construction"],
    sizes: [{ code: "2613", label: "Standard", dims: [1200, 600, 750] }],
    tags: ["library", "study"], finishes: true,
  },

  // ---------- Hostel ----------
  {
    slug: "magnum-7", name: "MAGNUM-7", code: "5010", range: "hostel", kind: "bed",
    tagline: "Single hostel bed",
    description: "A durable white metal square-pipe frame with a dark wood-grain headboard and footboard.",
    features: ["Square-pipe metal frame", "Wood-grain head and foot panels"],
    sizes: [{ code: "5010", label: "Single", dims: [2005, 950, 920] }],
    tags: ["hostel"], finishes: true,
  },
  {
    slug: "magnum-24", name: "MAGNUM-24", code: "5011", range: "hostel", kind: "bed",
    tagline: "Classic single hostel bed",
    description: "A heavy-duty powder-coated black iron frame with arched metal railings on the headboard and footboard.",
    features: ["Powder-coated iron frame", "Arched head and foot railings"],
    sizes: [{ code: "5011", label: "Single", dims: [1930, 945, 810] }],
    tags: ["hostel"], finishes: true,
  },
  {
    slug: "magnum-29", name: "MAGNUM-29", code: "5601", range: "hostel", kind: "bunk",
    tagline: "Hostel loft bed with workstation",
    description: "A modular loft bed with fall-protection guardrails, anti-slip storage steps and an integrated study space below.",
    features: ["Modular, future-proof design", "Safety guardrails", "Anti-slip storage steps", "Integrated utility storage"],
    sizes: [{ code: "5601", label: "Loft", dims: [1985, 912, 1820] }],
    tags: ["hostel"], finishes: true,
  },
  {
    slug: "magnum-12", name: "MAGNUM-12", code: "5602", range: "hostel", kind: "bunk",
    tagline: "Knock-down bunk bed",
    description: "Precision knock-down modular engineering for quick installation in student housing.",
    features: ["Knock-down construction", "Modular engineering"],
    sizes: [{ code: "5602", label: "Bunk", dims: [1930, 952, 1635] }],
    tags: ["hostel"], finishes: true,
  },
  {
    slug: "stack-8", name: "STACK-8", code: "4204", range: "hostel", kind: "wardrobe",
    tagline: "Metal hostel almirah",
    description: "A full-height metal almirah for student rooms.",
    features: ["Powder-coated steel", "Full-height storage"],
    sizes: [{ code: "4204", label: "Standard", dims: [1200, 560, 2100] }],
    tags: ["hostel"], finishes: true,
  },
  {
    slug: "stack-5", name: "STACK-5", code: "4201", range: "hostel", kind: "wardrobe",
    tagline: "Metal and wood hostel almirah",
    description: "A tall almirah combining a steel body with wooden doors.",
    features: ["Metal body, wooden shutters", "Full-height storage"],
    sizes: [{ code: "4201", label: "Standard", dims: [1170, 570, 2180] }],
    tags: ["hostel"], finishes: true,
  },

  // ---------- Cafeteria ----------
  {
    slug: "cantina-1", name: "Cantina-1", code: "2701", range: "cafeteria", kind: "cafe-table",
    tagline: "Cafeteria table with attached seating",
    description: "A spacious tabletop for comfortable dining and an ergonomic seating layout on a heavy-duty steel frame, for corporate cafeterias, canteens, universities and food courts.",
    features: ["Heavy-duty steel frame", "Spacious tabletop", "Ergonomic seating layout"],
    sizes: [{ code: "2701", label: "Standard", dims: [1220, 1750, 780] }],
    tags: ["cafeteria", "university"], finishes: true,
  },
  {
    slug: "cantina-2", name: "Cantina-2", code: "2702", range: "cafeteria", kind: "cafe-table",
    tagline: "Compact cafeteria table with attached seating",
    description: "The Cantina layout in a slightly more compact footprint.",
    features: ["Heavy-duty steel frame", "Ergonomic seating layout"],
    sizes: [{ code: "2702", label: "Standard", dims: [1210, 1700, 780] }],
    tags: ["cafeteria"], finishes: true,
  },

  // ---------- Laboratory ----------
  {
    slug: "formula-1", name: "Formula-1", code: "2612", range: "laboratory", kind: "lab-table",
    tagline: "Biology lab island table",
    description: "A back-to-back island with overhead reagent shelving, a laboratory power and data hub, and twin under-desk storage cabinets.",
    features: ["Overhead reagent shelving", "Power and data hub", "Back-to-back island", "Chemical-resistant work surface", "Dual under-desk cabinets"],
    sizes: [{ code: "2612", label: "Island", dims: [2440, 1220, 900] }],
    tags: ["lab", "school", "college"], finishes: true,
  },
  {
    slug: "formula-2", name: "Formula-2", code: "2613", range: "laboratory", kind: "lab-table",
    tagline: "Chemistry lab island table",
    description: "The Formula island configured for chemistry labs, with centralised reagent shelving and chemical-resistant tops.",
    features: ["Overhead reagent shelving", "Power and data hub", "Chemical-resistant work surface"],
    sizes: [{ code: "2613", label: "Island", dims: [2406, 1220, 865] }],
    tags: ["lab", "school", "college"], finishes: true,
  },

  // ---------- Auditorium ----------
  {
    slug: "audi-04", name: "Audi-04", code: "3804", range: "auditorium", kind: "audi-chair",
    tagline: "Upholstered auditorium chair",
    description: "Moulded PU foam seating with row plates, aisle lights and individual seat numbering for auditoriums and convocation halls.",
    features: ["Moulded PU foam, 48–52 density", "Row plate and aisle light", "Individual seat numbering", "Tip-up seat"],
    sizes: [{ code: "3804", label: "3-seat row (illustrative)", seats: 3, dims: [1650, 700, 1000] }],
    tags: ["auditorium", "university"],
  },
];

export const stats = [
  { value: "5,00,000+", label: "School desks made" },
  { value: "1,00,000+", label: "Workstations installed" },
  { value: "15,000+", label: "Clients across India" },
  { value: "1.5 lakh", label: "Sq ft manufacturing facility" },
];

export const projects = [
  { name: "Lovely Professional University", type: "University" },
  { name: "Chandigarh University", type: "University" },
  { name: "OP Jindal Global University", type: "University" },
  { name: "Aligarh Muslim University", type: "University" },
  { name: "IIM Rohtak", type: "Management school", products: ["scholar-30"] },
  { name: "Chitkara University", type: "University" },
  { name: "Rishihood University", type: "University" },
  { name: "K.R. Mangalam University", type: "University" },
  { name: "Indraprastha Medical College", type: "Medical college" },
  { name: "Maharaja Agrasen Medical College", type: "Medical college" },
  { name: "PGIMER", type: "Medical institute" },
  { name: "DPS Group", type: "School group" },
  { name: "UP Government School Projects", type: "Government", products: ["scholar-91"] },
  { name: "Delhi Government (DTTDC, PWD Delhi)", type: "Government" },
];

export const company = {
  name: "JIPH Furniture Pvt. Ltd.",
  since: 1996,
  address: "Grand Trunk Road, NH-1, near Liberty Shoe Factory, Gharaunda, Haryana 132114",
  phones: ["+91 74046 50000", "+91 98967 80087"],
  whatsapp: "917404650000",
  email: "enquiry@jiphfurniture.com",
  certifications: ["ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018", "MSME ZED Bronze"],
};
