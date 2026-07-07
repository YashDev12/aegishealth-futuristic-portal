// AegisHealth Patient Portal - Expanded Datastore

const mockData = {
  // Family Members profile switchers
  familyMembers: [
    {
      id: "PAT-00719",
      name: "Shivam",
      relationship: "Self",
      dob: "2007-07-05", // Age 19 in 2026
      gender: "Male",
      phone: "+1 (555) 998-1234",
      email: "shivam@aegishealth.com",
      address: "742 Evergreen Terrace, Seattle, WA",
      bloodGroup: "B+",
      allergies: "Sulfonamides",
      emergencyContact: "Rajesh Sharma (Father) - +1 (555) 443-8899",
      chronic: "Mild Cardiovascular Palpitations",
      surgeries: "Appendectomy (2020)",
      vitals: {
        heartRate: { value: 72, unit: "bpm", status: "Normal" },
        bloodPressure: { value: "118/76", unit: "mmHg", status: "Optimal" },
        oxygen: { value: 99, unit: "%", status: "Excellent" },
        temperature: { value: 98.4, unit: "°F", status: "Normal" },
        bloodSugar: { value: 94, unit: "mg/dL", status: "Normal" }
      },
      healthScore: 88,
      prescriptions: [
        { id: "RX-884", name: "Amoxicillin 500mg", dosage: "1 capsule, 3x daily", duration: "7 Days", purpose: "Streptococcal Infection", status: "Active", refilled: "2/3 Refills" },
        { id: "RX-291", name: "Cetirizine 10mg", dosage: "1 tablet, nightly", duration: "As Needed", purpose: "Allergic Rhinitis", status: "Active", refilled: "No Refills" }
      ]
    },
    {
      id: "PAT-00720",
      name: "Rajesh Sharma",
      relationship: "Father",
      dob: "1974-03-12", // Age 52
      gender: "Male",
      phone: "+1 (555) 443-8899",
      email: "rajesh.sharma@email.com",
      address: "742 Evergreen Terrace, Seattle, WA",
      bloodGroup: "O+",
      allergies: "Penicillin, Contrast Dye",
      emergencyContact: "Shivam (Son) - +1 (555) 998-1234",
      chronic: "Hypertension (Stage 1), Type-2 Diabetes",
      surgeries: "Gallbladder Removal (2018)",
      vitals: {
        heartRate: { value: 84, unit: "bpm", status: "Elevated" },
        bloodPressure: { value: "135/88", unit: "mmHg", status: "Mild Hypertension" },
        oxygen: { value: 96, unit: "%", status: "Normal" },
        temperature: { value: 98.6, unit: "°F", status: "Normal" },
        bloodSugar: { value: 132, unit: "mg/dL", status: "Borderline High" }
      },
      healthScore: 74,
      prescriptions: [
        { id: "RX-551", name: "Lisinopril 10mg", dosage: "1 tablet daily, mornings", duration: "Chronic", purpose: "Blood Pressure control", status: "Active", refilled: "5/5 Refills" },
        { id: "RX-990", name: "Metformin 500mg", dosage: "1 tablet, with dinners", duration: "Chronic", purpose: "Type-2 Diabetes Control", status: "Active", refilled: "4/5 Refills" }
      ]
    },
    {
      id: "PAT-00721",
      name: "Priya Sharma",
      relationship: "Sister",
      dob: "2012-11-18", // Age 14
      gender: "Female",
      phone: "+1 (555) 998-9900",
      email: "priya@email.com",
      address: "742 Evergreen Terrace, Seattle, WA",
      bloodGroup: "B+",
      allergies: "Peanuts, Cashews",
      emergencyContact: "Rajesh Sharma (Father) - +1 (555) 443-8899",
      chronic: "Mild Exercise-induced Asthma",
      surgeries: "None",
      vitals: {
        heartRate: { value: 76, unit: "bpm", status: "Normal" },
        bloodPressure: { value: "110/72", unit: "mmHg", status: "Optimal" },
        oxygen: { value: 99, unit: "%", status: "Excellent" },
        temperature: { value: 98.2, unit: "°F", status: "Normal" },
        bloodSugar: { value: 88, unit: "mg/dL", status: "Normal" }
      },
      healthScore: 92,
      prescriptions: [
        { id: "RX-412", name: "Albuterol Inhaler", dosage: "2 puffs as needed", duration: "PRN", purpose: "Asthma rescue", status: "Active", refilled: "2/2 Refills" }
      ]
    }
  ],

  patient: {
    id: "PAT-00719",
    name: "Shivam",
    dob: "2007-07-05",
    gender: "Male",
    phone: "+1 (555) 998-1234",
    email: "shivam@aegishealth.com",
    address: "742 Evergreen Terrace, Seattle, WA",
    bloodGroup: "B+",
    allergies: "Sulfonamides",
    emergencyContact: "Rajesh Sharma (Father) - +1 (555) 443-8899",
    insurance: {
      carrier: "BlueCross Premium PPO",
      memberId: "BC-9988271",
      groupId: "AEGIS-72",
      coveragePct: "85%",
      status: "Verified & Active"
    }
  },

  services: [
    { 
      name: "General Medicine", 
      icon: "fa-stethoscope", 
      desc: "Comprehensive primary health checkups, disease screening, and family physician care.", 
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80",
      details: {
        headline: "Primary Care & Prevention Medicine",
        overview: "The General Medicine department at AegisHealth serves as the patient's first point of contact, offering comprehensive diagnostic evaluations, preventative screenings, vaccination protocols, and chronic disease management. Our team coordinates your overall clinical care pathway.",
        symptoms: ["Unexplained fever", "Chronic fatigue", "Stomach aches & nausea", "Persistent coughs", "Seasonal allergies"],
        procedures: ["Annual Physical Wellness Audits", "Flu & Travel Immunizations", "Chronic Care Coordination (Hypertension, Diabetes)", "Basic Diagnostic Blood Panels"],
        fee: "$120",
        waitTime: "10 mins",
        consultingHours: "08:00 AM - 08:00 PM (Mon-Sat)"
      }
    },
    { 
      name: "Cardiology", 
      icon: "fa-heart-pulse", 
      desc: "Expert assessment of heart murmurs, cardiovascular functions, EKG readings, and vascular health.", 
      img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
      details: {
        headline: "Vascular & Cardiovascular Health Center",
        overview: "AegisHealth Cardiology is at the forefront of diagnosing and managing complex cardiac anomalies. Our board-certified cardiologists utilize non-invasive telemetry, high-resolution echocardiography, and vascular diagnostic fanners to safeguard your heart.",
        symptoms: ["Chest pressure or tightness", "Heart racing or palpitations", "Shortness of breath on exertion", "Sudden unexplained dizziness"],
        procedures: ["12-Lead Electrocardiogram (EKG)", "Echocardiography (Heart Ultrasound)", "Stress Testing & Holter Telemetry", "Lipid & Hypertension Management"],
        fee: "$250",
        waitTime: "15 mins",
        consultingHours: "09:00 AM - 05:00 PM (Mon-Fri)"
      }
    },
    { 
      name: "Neurology", 
      icon: "fa-brain", 
      desc: "Diagnosis and treatments for cognitive impairments, chronic migraines, sleep disorders, and motor nerves.", 
      img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
      details: {
        headline: "Advanced Neurological & Brain Sciences",
        overview: "Our Neurological Center resolves complex conditions affecting the central and peripheral nervous systems. We specialize in migraine diagnosis, neuromuscular disorders, sleep dysfunctions, and stroke rehabilitation metrics.",
        symptoms: ["Chronic migraine headaches", "Numbness or tingling in extremities", "Dizziness or balance loss", "Memory fluctuations", "Uncontrolled muscle tremors"],
        procedures: ["Electroencephalogram (EEG)", "Sleep Quality Studies (Polysomnography)", "Electromyography (EMG)", "Stroke Risk Auditing & Prevention"],
        fee: "$280",
        waitTime: "20 mins",
        consultingHours: "08:30 AM - 04:30 PM (Mon-Fri)"
      }
    },
    { 
      name: "Pediatrics", 
      icon: "fa-baby", 
      desc: "Caring, child-friendly checkups, vaccination timetables, physical growth monitors, and infant wellness plans.", 
      img: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=400&q=80",
      details: {
        headline: "Infant, Child & Adolescent Wellness Clinic",
        overview: "AegisHealth Pediatrics provides a caring, reassuring environment for children from birth through adolescence. We prioritize physical development, immunization compliance, early childhood screenings, and nutritional guidance.",
        symptoms: ["Pediatric high fevers", "Childhood rashes & spots", "Developmental delay concerns", "Persistent earaches or sore throats"],
        procedures: ["Well-Child Growth Checkups", "School & Sports Physicals", "Adolescent Immunization Programs", "Early Developmental Screening & Autistic Markers"],
        fee: "$100",
        waitTime: "8 mins",
        consultingHours: "09:00 AM - 06:00 PM (Mon-Sat)"
      }
    },
    { 
      name: "Orthopedics", 
      icon: "fa-bone", 
      desc: "Treatment of sprains, bone fractures, ligament tears, arthritis, joint replacements, and structural support.", 
      img: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=400&q=80",
      details: {
        headline: "Bone, Joint & Musculoskeletal Care",
        overview: "AegisHealth Orthopedics offers comprehensive treatments for sports injuries, structural fractures, joint arthritis, and muscle tears. Our surgical and non-surgical physical specialists focus on restoring mobility quickly.",
        symptoms: ["Joint swelling or severe stiffness", "Inability to bear limb weight", "Acute bone fractures", "Ligament sprains & muscle tears"],
        procedures: ["High-Resolution Joint X-rays", "Casting & Orthotic Splinting", "Physical Rehabilitation Therapy", "Arthroscopic Minimally Invasive Surgery"],
        fee: "$200",
        waitTime: "12 mins",
        consultingHours: "10:00 AM - 06:00 PM (Mon-Fri)"
      }
    },
    { 
      name: "Oncology", 
      icon: "fa-dna", 
      desc: "Advanced tumor screenings, chemotherapy plans, genetic risk assessments, and personalized oncology paths.", 
      img: "https://images.unsplash.com/photo-1579154261294-a101d257a977?auto=format&fit=crop&w=400&q=80",
      details: {
        headline: "Personalized Genomic Cancer Center",
        overview: "The Oncology department integrates genomic profiling with advanced therapies to treat diverse oncological cases. We focus on early cancer detection, chemotherapy, immunotherapy, and dedicated patient care paths.",
        symptoms: ["Unexplained rapid weight loss", "Sudden lymphatic swellings", "Persistent night sweats", "Changes in mole configurations"],
        procedures: ["Genomic Cancer Risk Screening", "Oncology Chemotherapy Cycles", "PET/CT Diagnostic Imaging Reviews", "Targeted Monoclonal Antibody Immunotherapy"],
        fee: "$320",
        waitTime: "18 mins",
        consultingHours: "08:00 AM - 04:00 PM (Mon-Fri)"
      }
    },
    { 
      name: "Dermatology", 
      icon: "fa-hand-dots", 
      desc: "Dermatological checks for skin rashes, eczema, mole screenings, skin cancer screening, and acne management.", 
      img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80",
      details: {
        headline: "Comprehensive Skin & Cutaneous Wellness",
        overview: "Dermatology at AegisHealth addresses conditions affecting the skin, hair, and nails. We specialize in inflammatory skin conditions (eczema, psoriasis), mole mapping, skin cancer detection, and therapeutic dermabrasion.",
        symptoms: ["Itchy spreading skin rashes", "Unusual changes in moles/spots", "Chronic severe acne", "Scalp or hair loss issues"],
        procedures: ["Whole-Body Mole Mapping", "Skin Biopsy & Tumor Resections", "Cryotherapy for Benign Lesions", "Allergen Contact Patch Testing"],
        fee: "$150",
        waitTime: "12 mins",
        consultingHours: "09:00 AM - 05:00 PM (Mon-Fri)"
      }
    },
    { 
      name: "Mental Health", 
      icon: "fa-head-side-virus", 
      desc: "Support for anxiety disorders, depression guidance, psychotherapy, coping strategies, and psychological counseling.", 
      img: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee1?auto=format&fit=crop&w=400&q=80",
      details: {
        headline: "Psychotherapy & Cognitive Wellness Services",
        overview: "Mental Health services offer a supportive, fully confidential environment for patients facing emotional hurdles. Our psychiatrists and licensed clinical counselors provide evidence-based psychotherapy and stress mitigation strategies.",
        symptoms: ["Chronic anxiety or panic attacks", "Persistent depressive states", "Severe insomnia & sleep panic", "Unmanageable work stress"],
        procedures: ["Cognitive Behavioral Therapy (CBT)", "Panic Mitigation Counseling", "Insomnia Rehabilitation Programs", "Confidential Crisis Interventions"],
        fee: "$140",
        waitTime: "5 mins",
        consultingHours: "08:00 AM - 07:00 PM (Mon-Sat)"
      }
    }
  ],

  doctors: [
    {
      id: "DOC-01",
      name: "Dr. Robert Vance",
      specialty: "Cardiology",
      experience: "12 Years",
      rating: "4.9",
      languages: "English",
      slots: ["09:00 AM", "10:30 AM", "11:00 AM"],
      status: "Online",
      aiRecommended: true,
      img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: "DOC-02",
      name: "Dr. Clara Thorne",
      specialty: "Dermatology",
      experience: "8 Years",
      rating: "4.8",
      languages: "English, Spanish",
      slots: ["02:15 PM", "03:00 PM", "04:30 PM"],
      status: "Online",
      aiRecommended: true,
      img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: "DOC-03",
      name: "Dr. James Fletcher",
      specialty: "Orthopedics",
      experience: "15 Years",
      rating: "4.9",
      languages: "English",
      slots: ["10:00 AM", "11:30 AM", "12:00 PM"],
      status: "Offline",
      aiRecommended: false,
      img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: "DOC-04",
      name: "Dr. Alicia Vance",
      specialty: "General Medicine",
      experience: "10 Years",
      rating: "4.7",
      languages: "English, Hindi",
      slots: ["01:00 PM", "02:30 PM", "03:45 PM"],
      status: "Online",
      aiRecommended: false,
      img: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: "DOC-05",
      name: "Dr. Liam Foster",
      specialty: "Neurology",
      experience: "18 Years",
      rating: "5.0",
      languages: "English, German",
      slots: ["08:30 AM", "09:45 AM", "11:15 AM"],
      status: "Online",
      aiRecommended: true,
      img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: "DOC-06",
      name: "Dr. Sarah Jenkins",
      specialty: "Mental Health",
      experience: "9 Years",
      rating: "4.8",
      languages: "English, French",
      slots: ["03:00 PM", "04:15 PM", "05:30 PM"],
      status: "Online",
      aiRecommended: false,
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80"
    }
  ],

  vitals: {
    heartRate: { value: 72, unit: "bpm", status: "Normal", trend: "stable" },
    bloodPressure: { value: "118/76", unit: "mmHg", status: "Optimal", trend: "stable" },
    oxygen: { value: 99, unit: "%", status: "Excellent", trend: "stable" },
    temperature: { value: 98.4, unit: "°F", status: "Normal", trend: "stable" },
    bloodSugar: { value: 94, unit: "mg/dL", status: "Normal", trend: "stable" },
    activity: { steps: 7842, target: 10000, sleep: 8.2, targetSleep: 8.0, calories: 340 }
  },

  prescriptions: [
    { id: "RX-884", name: "Amoxicillin 500mg", dosage: "1 capsule, 3x daily", duration: "7 Days", purpose: "Streptococcal Infection", status: "Active" },
    { id: "RX-291", name: "Cetirizine 10mg", dosage: "1 tablet, nightly", duration: "As Needed", purpose: "Allergic Rhinitis", status: "Active" }
  ],

  labReports: [
    {
      id: "REP-9921",
      name: "Lipid Panel (Cholesterol Test)",
      date: "2026-06-15",
      facility: "AegisHealth Diagnostic Labs",
      rawText: `
TEST: LIPID PANEL
SAMPLE DATE: JUNE 15, 2026

TEST PARAMETERS                 RESULT          REFERENCE RANGE
-----------------------------------------------------------------
TOTAL CHOLESTEROL               245 mg/dL       < 200 mg/dL (Desirable)
TRIGLYCERIDES                   185 mg/dL       < 150 mg/dL (Normal)
HDL CHOLESTEROL (GOOD)          38 mg/dL        > 40 mg/dL (Desirable)
LDL CHOLESTEROL (BAD)           162 mg/dL       < 100 mg/dL (Optimal)
CHOL/HDL RATIO                  6.4             < 5.0 (Desirable)
      `,
      interpretation: {
        title: "AI Report Translation: Lipid Panel Analysis",
        summary: "Your lipid panel suggests high cholesterol levels, primarily driven by elevated LDL (Bad) Cholesterol and high Triglycerides, accompanied by slightly low HDL (Good) Cholesterol.",
        points: [
          "Total Cholesterol (245 mg/dL) is in the High category (recommended to be under 200).",
          "LDL 'Bad' Cholesterol (162 mg/dL) is significantly elevated (optimal is under 100). This indicates fatty build-up risks in blood vessels.",
          "HDL 'Good' Cholesterol (38 mg/dL) is below the recommended 40, meaning your body is less efficient at clearing 'bad' cholesterol.",
          "Triglycerides (185 mg/dL) is Borderline High, which can result from high carbohydrate intake or low physical activity."
        ],
        actions: "We recommend scheduling a follow-up with Dr. Alicia Vance to discuss dietary modifications (reducing saturated fats, increasing fiber) or potential medical management."
      }
    }
  ],

  preparations: [
    { id: "PREP-01", name: "Blood Test & Lipid Panel Fasting Rules", urgency: "Routine Prep", description: "Patients must fast strictly for 10-12 hours before a lipid or glucose blood draw. Do not eat any solid food or drink beverages other than plain water. Continue regular medications unless instructed otherwise." },
    { id: "PREP-02", name: "Magnetic Resonance Imaging (MRI) Scan Checklist", urgency: "High Compliance", description: "No fasting is required unless abdomen/pelvis MRI. You MUST remove all metal items, hairpins, watches, keys, jewelry, and piercings. Wear metal-free hospital gown. Inform staff if you have metal implants, artificial joints, or pacemakers." },
    { id: "PREP-03", name: "Abdominal Ultrasound Guidelines", urgency: "Important Prep", description: "Do not eat or drink anything (including water) for 8 hours prior to your scan. Refrain from chewing gum or smoking on the day of the exam, as this introduces air into the GI tract, blocking ultrasound waves." }
  ],

  blogArticles: [
    { 
      title: "Understanding Blood Pressure Readings", 
      category: "Heart Health", 
      readTime: "5 min read", 
      img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80", 
      summary: "A comprehensive guide to understanding what systolic and diastolic blood pressure numbers mean for your long-term cardiovascular health.",
      fullText: "Systolic and diastolic pressures represent the two crucial stages of your cardiac heartbeat cycle. Systolic pressure (the top number) measures the force your heart exerts on blood vessel walls when it beats, forcing oxygen-rich blood out. Diastolic pressure (the bottom number) represents the pressure when the heart muscle rests between beats. Maintaining a level under 120/80 mmHg prevents long-term vascular damage, arterial stiffening, and kidney filtering issues.",
      aiSummaryBullets: [
        "**Systolic (Top)** is pressure when the heart beats; **Diastolic (Bottom)** is pressure during rest.",
        "A regular reading under **120/80 mmHg** is optimal for young adults.",
        "Elevated readings above **130/80 mmHg** indicate hypertension stage 1, requiring clinical tracking."
      ]
    },
    { 
      title: "The Role of Diet in Managing Cholesterol", 
      category: "Nutrition", 
      readTime: "4 min read", 
      img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80", 
      summary: "Discover how increasing soluble fibers, reducing saturated fats, and consuming phytosterols can significantly lower LDL cholesterol naturally.",
      fullText: "Your liver produces 80% of your body's cholesterol, while the rest is ingested through food. Elevated LDL (Low-Density Lipoprotein) cholesterol transports fats to your arteries, causing narrowing plaques, while HDL (High-Density Lipoprotein) clears it. Reducing saturated fats and hydrogenated oils directly reduces circulating LDL. Simultaneously, consuming soluble fiber (such as oats or kidney beans) traps dietary cholesterol in the gut, forcing its excretion.",
      aiSummaryBullets: [
        "**LDL** acts as an arterial plaster; **HDL** acts as a cleaning vehicle clearing fats.",
        "Soluble fiber binds cholesterol in the digestive tract, lowering systemic levels.",
        "Daily intake of saturated fats should be limited to under **13 grams** for a 2000 calorie diet."
      ]
    },
    { 
      title: "Sleep Hygiene: Tips for Better Rest", 
      category: "Wellness", 
      readTime: "3 min read", 
      img: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?auto=format&fit=crop&w=400&q=80", 
      summary: "Explore behavioral changes and bedroom adjustments to improve sleep quality, support brain recovery, and boost daytime alertness.",
      fullText: "Quality sleep is the foundation of cognitive restoration and cardiovascular repair. The circadian cycle is heavily regulated by melatonin release, which is blocked by blue light wavelengths emitted from phones and monitors. Restricting screens for 60 minutes before bedtime allows natural hormone escalation. Additionally, keeping the bedroom temperature cool (around 65°F / 18°C) matches the body's natural nocturnal core cooling pathway, enabling rapid deep sleep transition.",
      aiSummaryBullets: [
        "**Circadian cycles** trigger sleep; blue light blocks melatonin synthesis.",
        "Restricting digital screens **60 minutes** before bedtime significantly accelerates sleep latency.",
        "Maintaining a cool bedroom (**65°F / 18°C**) matches natural thermal drops enabling deep recovery."
      ]
    }
  ],

  faqs: [
    { q: "How do I schedule a virtual video consultation?", a: "To book a video consultation, navigate to the Appointment Booking section, choose your doctor and department, select the 'Video Consultation' consultation format toggle, and click confirm. A secure video link will be sent to your email and accessible inside your portal dashboard." },
    { q: "Is the AI Healthcare Agent a substitute for a real doctor?", a: "No. The AI Agent provides educational information, symptom checks, and clinic routing suggestions based on your queries. It is NOT a licensed medical professional and does NOT provide binding medical diagnoses. For severe, worsening, or urgent symptoms, contact emergency services (911) immediately." },
    { q: "How do I upload and translate my clinical lab reports?", a: "You can click on the 'Upload my lab report' quick action in the AI Doctor Chat interface, or open the Diagnostic Lab Translator panel. The AI will parse the clinical chemistry results and provide a layman-friendly translation of abnormal biomarkers." },
    { q: "Does AegisHealth support health insurance clearance?", a: "Yes. AegisHealth matches your digital intake files with over 40 leading health insurance networks. You can upload insurance cards during the intake workflow to receive instant coverage estimations and copay breakdowns." }
  ],

  testimonials: [
    { name: "Emma Watson", comment: "The AI agent redirected my chest tightness to Cardiology immediately, and the check-in sheet was fully compiled by the time I walked into the clinic building. Incredible technology!", rating: 5, img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
    { name: "John Doe", comment: "Translating laboratory blood results used to take days of waiting and searching online. AegisHealth decoded my LDL scores in 5 seconds with easy-to-follow actions.", rating: 5, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" }
  ],

  medicalSymptomsDatabase: [
    {
      keywords: ["chest pain", "chest tightness", "palpitations", "heart racing", "chest pressure", "breathless"],
      department: "Cardiology",
      doctor: "Dr. Robert Vance",
      urgency: "HIGH URGENCY",
      statusClass: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      guidance: "Sit upright, remain calm, and avoid physical exertion. Try slow, deep box breathing to stabilize heart rate levels.",
      redFlags: "If chest pain is severe, crushing, radiates to your left arm, shoulder, neck or jaw, or is accompanied by cold sweats or sudden vomiting, this may indicate a **myocardial infarction (Heart Attack)**. Call **emergency services (911)** immediately."
    },
    {
      keywords: ["skin rash", "itchy spot", "red bumps", "mole changing", "skin spots", "hives", "eczema"],
      department: "Dermatology",
      doctor: "Dr. Clara Thorne",
      urgency: "Routine Care",
      statusClass: "text-cyanAccent bg-cyanAccent/10 border-cyanAccent/20",
      guidance: "Keep the area clean, dry, and cool. Apply mild moisturizers or calamine lotion if it is itchy. Avoid direct scratching.",
      redFlags: "Seek urgent care if the rash spreads extremely rapidly, blisters open, is intensely painful, or is accompanied by a **high fever** or joint swelling."
    },
    {
      keywords: ["bone", "joint", "fracture", "sprain", "knee", "back", "muscle", "pain"],
      department: "Orthopedics",
      doctor: "Dr. James Fletcher",
      urgency: "Moderate Urgency",
      statusClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      guidance: "Practice the **RICE protocol**: **R**est the joint, **I**ce for 15 minutes, apply light **C**ompression wrapping, and **E**levate the limb.",
      redFlags: "Go to emergency clinic if there is visible bone deformation, complete inability to bear any weight, severe local swelling, or loss of sensation in fingers/toes."
    },
    {
      keywords: ["fever", "cough", "sore throat", "flu", "stomach pain", "nausea", "vomiting", "cold"],
      department: "General Medicine",
      doctor: "Dr. Alicia Vance",
      urgency: "Routine Care",
      statusClass: "text-emeraldGreen bg-emeraldGreen/10 border-emeraldGreen/20",
      guidance: "Drink plenty of warm water, prioritize bed rest, and monitor body temperature. Warm saltwater gargles can soothe throat pain.",
      redFlags: "Consult immediately if body temperature exceeds **103°F (39.4°C)**, symptoms persist for over 3-4 days, or you experience persistent severe abdominal pain."
    },
    {
      keywords: ["headache", "migraine", "dizziness", "numbness", "tingling", "tremors", "confusion"],
      department: "Neurology",
      doctor: "Dr. Liam Foster",
      urgency: "Moderate to High Urgency",
      statusClass: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      guidance: "Rest in a completely dark, quiet room. Limit screens. Stay hydrated and track when symptoms began.",
      redFlags: "Seek emergency care immediately if you experience the **FAST warning signs**: **F**acial drooping, **A**rm weakness, **S**peech slurring, or if it is a sudden 'thunderclap' headache (worst headache of your life)."
    },
    {
      keywords: ["anxiety", "depression", "panic attack", "insomnia", "stress", "lonely", "fear"],
      department: "Mental Health",
      doctor: "Dr. Sarah Jenkins",
      urgency: "Supportive Care",
      statusClass: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      guidance: "Practice calming breathing cycles: inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. Ground yourself by naming 5 things you can see.",
      redFlags: "If you feel overwhelming despair or thoughts of self-harm, contact suicide prevention lifelines or go to the nearest emergency department immediately."
    }
  ],

  aiDoctorRules: {
    greet: "Hello Shivam! I am your Aegis AI Healthcare Assistant. I am an intelligent virtual guide. I can assess symptoms, recommend matching specialists, explain prescriptions, translate lab files, or schedule consultations. \n\n*Disclaimer: I provide health guidance only. I do not replace a licensed medical professional. For medical emergencies, call emergency services immediately.*",
    symptomsCheck: "Let's perform a symptom assessment. What physical discomforts are you experiencing? (Please detail severity and duration).",
    hospitals: "AegisHealth is integrated with multiple facilities: \n1. **Aegis Central Hospital** - Main campus (12 mins away) \n2. **Aegis Urgent Care Clinic** - East Wing (5 mins away) \n3. **Aegis Medical Labs** - Diagnostic center (8 mins away).",
    prescription: "To explain a prescription, please input the medication name or active components (e.g., 'Amoxicillin'). I will detail common dosages, durations, and instructions.",
    lab: "You have a **Lipid Panel (June 15)** archived. I can interpret total cholesterol, LDL, HDL, and triglycerides. Would you like me to translate it?",
    medication: "You currently have two active medications: \n1. **Amoxicillin 500mg** (3x daily) - 2 days remaining \n2. **Cetirizine 10mg** (nightly) - active allergy management.",
    followUp: "I've flagged a follow-up note for your next consultation with **Dr. Robert Vance** on July 8. Would you like to schedule an additional reminder?"
  },

  appointments: [
    {
      id: "APT-2029",
      doctor: "Dr. Robert Vance",
      specialty: "Cardiology",
      date: "2026-07-08",
      time: "10:30 AM",
      location: "Main Clinic Building, Floor 2, Room 204",
      status: "Confirmed",
      type: "In-Person"
    },
    {
      id: "APT-1940",
      doctor: "Dr. Clara Thorne",
      specialty: "Dermatology",
      date: "2026-07-22",
      time: "02:15 PM",
      location: "Virtual Consultation Room Link",
      status: "Scheduled",
      type: "Video Call"
    }
  ],

  // Invoices billing records
  billingInvoices: [
    { id: "INV-9921", date: "2026-06-15", doc: "Dr. Alicia Vance", service: "Genomic Blood Screening", fee: "$250.00", coverage: "85%", copay: "$37.50", status: "Paid", receipt: "aegis_receipt_9921.pdf" },
    { id: "INV-8874", date: "2026-06-02", doc: "Dr. Robert Vance", service: "Cardiology Diagnostic EKG", fee: "$350.00", coverage: "85%", copay: "$52.50", status: "Paid", receipt: "aegis_receipt_8874.pdf" },
    { id: "INV-1029", date: "2026-07-05", doc: "Dr. Liam Foster", service: "Neurological Outpatient Check", fee: "$280.00", coverage: "0%", copay: "$280.00", status: "Unpaid", receipt: "pending" }
  ],

  claims: [
    { id: "CLM-883", date: "2026-06-15", service: "Genomic Blood Screening", carrier: "BlueCross Premium PPO", amount: "$212.50", status: "Approved & Settled" },
    { id: "CLM-712", date: "2026-06-02", service: "Cardiology Diagnostic EKG", carrier: "BlueCross Premium PPO", amount: "$297.50", status: "Approved & Settled" }
  ],

  vaccinationSchedule: [
    { name: "Influenza (Flu Shot)", date: "2025-10-15", facility: "Aegis Health Clinic", status: "Completed" },
    { name: "COVID-19 Booster", date: "2025-11-20", facility: "Care Pharmacy Seattle", status: "Completed" },
    { name: "Tdap (Tetanus, Diphtheria, Pertussis)", date: "2026-07-15", facility: "Aegis Central Hospital", status: "Upcoming" }
  ],

  notifications: [
    { id: "NOT-01", type: "Medication", title: "Amoxicillin Dose Alert", text: "Time to take Amoxicillin 500mg (1 capsule). Please take with water.", time: "10 mins ago", read: false },
    { id: "NOT-02", type: "Billing", title: "Outstanding Balance Invoice", text: "Invoice INV-1029 ($280.00) for Dr. Liam Foster is due by July 15.", time: "2 hours ago", read: false },
    { id: "NOT-03", type: "Lab", title: "Lipid Panel Report Loaded", text: "Your June 15 Cholesterol Panel has been translated by the AI Assistant.", time: "1 day ago", read: true }
  ],

  analyticsHistory: {
    weeks: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    heartRate: [68, 72, 70, 75, 71, 73, 72],
    bloodPressureSys: [120, 118, 119, 122, 117, 118, 118],
    bloodPressureDia: [80, 78, 78, 82, 75, 76, 76],
    bloodSugar: [95, 92, 98, 94, 91, 95, 94],
    sleep: [7.8, 8.0, 7.5, 8.2, 6.9, 8.5, 8.2],
    steps: [8400, 9100, 6200, 7842, 11200, 9400, 8900],
    mood: [4, 5, 4, 4, 3, 5, 5] // 1-5 scale
  }
};

// Expose globally
if (typeof window !== "undefined") {
  window.mockData = mockData;
}
