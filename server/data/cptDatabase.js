/**
 * COMPLETE MENTAL HEALTH CPT CODE DATABASE
 *
 * Structure per entry:
 *  - name:                  plain English description
 *  - timeRange:             session duration in minutes (if time-based)
 *  - category:              code grouping for UI filtering
 *  - medicalEquivalent:     the physical health CPT used as parity comparison
 *  - medicalEquivalentName: plain name of that equivalent
 *  - commonDenials:         denial reason keys most likely for this code
 *  - parityTrigger:         the parity argument in plain English
 *  - statute:               exact MHPAEA CFR citation
 *  - statuteNote:           what that statute says in plain English
 *  - appealTemplate:        which letter template to use
 *  - verdictLogic:          which denial reasons trigger RED vs YELLOW
 */

export const CPT_DATABASE = {

  // ─── DIAGNOSTIC EVALUATIONS ────────────────────────────────────────────────

  "90791": {
    name: "Psychiatric diagnostic evaluation (no medical services)",
    timeRange: "60-90 min",
    category: "diagnostic",
    medicalEquivalent: "99205",
    medicalEquivalentName: "New patient office visit, high complexity",
    commonDenials: ["not_covered", "prior_auth", "medical_necessity", "wrong_cpt"],
    parityTrigger: "Initial psychiatric evaluation denied while equivalent new-patient medical specialist visit (99205) is covered without prior auth",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(ii)",
    statuteNote: "Prior authorization requirements for MH/SUD benefits may not be more restrictive than for medical/surgical benefits",
    appealTemplate: "diagnostic_eval",
    verdictLogic: {
      RED:    ["not_covered", "prior_auth"],
      YELLOW: ["medical_necessity", "wrong_cpt"],
      GREEN:  []
    }
  },

  "90792": {
    name: "Psychiatric diagnostic evaluation with medical services (includes medication management)",
    timeRange: "60-90 min",
    category: "diagnostic",
    medicalEquivalent: "99205",
    medicalEquivalentName: "New patient office visit, high complexity",
    commonDenials: ["prior_auth", "not_covered", "medical_necessity"],
    parityTrigger: "Psychiatric intake requiring prior auth while specialist medical intake (99205) does not require it under same plan",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(ii)",
    statuteNote: "Prior auth requirements for MH must be comparable to medical/surgical equivalents",
    appealTemplate: "diagnostic_eval",
    verdictLogic: {
      RED:    ["prior_auth", "not_covered"],
      YELLOW: ["medical_necessity"],
      GREEN:  []
    }
  },

  // ─── INDIVIDUAL PSYCHOTHERAPY ───────────────────────────────────────────────

  "90832": {
    name: "Individual psychotherapy, 30 minutes (16–37 min)",
    timeRange: "16-37 min",
    category: "individual_therapy",
    medicalEquivalent: "99212",
    medicalEquivalentName: "Established patient office visit, low complexity",
    commonDenials: ["medical_necessity", "documentation", "timely_filing"],
    parityTrigger: "30-min therapy session denied for medical necessity while equivalent low-complexity office visit (99212) is routinely covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "NQTLs for MH/SUD may not be more restrictive than those applied to medical/surgical benefits in the same classification",
    appealTemplate: "therapy_medical_necessity",
    verdictLogic: {
      RED:    ["medical_necessity"],
      YELLOW: ["documentation", "timely_filing"],
      GREEN:  []
    }
  },

  "90833": {
    name: "Psychotherapy add-on, 30 min with E/M service (billed with E/M code)",
    timeRange: "30 min add-on",
    category: "addon",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Established patient office visit, moderate complexity",
    commonDenials: ["bundling_error", "not_covered", "documentation"],
    parityTrigger: "Therapy add-on denied while equivalent medical add-on codes (e.g., 99354) are covered under same plan",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Coverage of add-on services for MH must match add-on coverage for medical/surgical",
    appealTemplate: "therapy_medical_necessity",
    verdictLogic: {
      RED:    ["not_covered"],
      YELLOW: ["bundling_error", "documentation"],
      GREEN:  []
    }
  },

  "90834": {
    name: "Individual psychotherapy, 45 minutes (38–52 min)",
    timeRange: "38-52 min",
    category: "individual_therapy",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Established patient office visit, moderate complexity",
    commonDenials: ["medical_necessity", "documentation", "wrong_cpt", "visit_cap"],
    parityTrigger: "45-min therapy denied for medical necessity while equivalent moderate-complexity office visit (99213) is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "NQTLs for MH/SUD may not be more restrictive than for medical/surgical benefits",
    appealTemplate: "therapy_medical_necessity",
    verdictLogic: {
      RED:    ["medical_necessity", "visit_cap"],
      YELLOW: ["documentation", "wrong_cpt"],
      GREEN:  []
    }
  },

  "90836": {
    name: "Psychotherapy add-on, 45 min with E/M service",
    timeRange: "45 min add-on",
    category: "addon",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Established patient office visit, moderate complexity",
    commonDenials: ["bundling_error", "not_covered", "documentation"],
    parityTrigger: "Therapy add-on denied while medical add-on codes covered under same plan",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Coverage of MH add-on services must match coverage of medical/surgical add-ons",
    appealTemplate: "therapy_medical_necessity",
    verdictLogic: {
      RED:    ["not_covered"],
      YELLOW: ["bundling_error", "documentation"],
      GREEN:  []
    }
  },

  "90837": {
    name: "Individual psychotherapy, 60 minutes (53+ min)",
    timeRange: "53+ min",
    category: "individual_therapy",
    medicalEquivalent: "99214",
    medicalEquivalentName: "Established patient office visit, moderate-high complexity",
    commonDenials: ["medical_necessity", "visit_cap", "prior_auth", "documentation"],
    parityTrigger: "60-min therapy denied for medical necessity while equivalent high-complexity office visit (99214) is covered without equivalent restrictions",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Non-quantitative treatment limitations for MH/SUD may not be more restrictive than for medical/surgical",
    appealTemplate: "therapy_medical_necessity",
    verdictLogic: {
      RED:    ["medical_necessity", "visit_cap"],
      YELLOW: ["prior_auth", "documentation"],
      GREEN:  []
    }
  },

  "90838": {
    name: "Psychotherapy add-on, 60 min with E/M service",
    timeRange: "60 min add-on",
    category: "addon",
    medicalEquivalent: "99214",
    medicalEquivalentName: "Established patient office visit, moderate-high complexity",
    commonDenials: ["bundling_error", "not_covered", "documentation"],
    parityTrigger: "60-min therapy add-on denied while equivalent medical add-on covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Coverage of MH add-ons must match medical/surgical add-on coverage",
    appealTemplate: "therapy_medical_necessity",
    verdictLogic: {
      RED:    ["not_covered"],
      YELLOW: ["bundling_error", "documentation"],
      GREEN:  []
    }
  },

  // ─── FAMILY THERAPY ─────────────────────────────────────────────────────────

  "90846": {
    name: "Family psychotherapy without patient present, 50 min",
    timeRange: "50 min",
    category: "family_therapy",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Established patient office visit, moderate complexity",
    commonDenials: ["not_covered", "medical_necessity", "prior_auth"],
    parityTrigger: "Family therapy without patient denied while equivalent family medical counseling is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(2)",
    statuteNote: "Financial requirements and treatment limits for MH must match medical/surgical benefits",
    appealTemplate: "family_therapy",
    verdictLogic: {
      RED:    ["not_covered", "medical_necessity"],
      YELLOW: ["prior_auth"],
      GREEN:  []
    }
  },

  "90847": {
    name: "Family psychotherapy with patient present, 50 min",
    timeRange: "50 min",
    category: "family_therapy",
    medicalEquivalent: "99214",
    medicalEquivalentName: "Office visit, moderate-high complexity",
    commonDenials: ["medical_necessity", "visit_cap", "not_covered"],
    parityTrigger: "Family therapy denied while family medical counseling (99366) is covered under same plan",
    statute: "MHPAEA 29 CFR 2590.712(c)(2)",
    statuteNote: "Financial requirements and treatment limits must be no more restrictive for MH than medical/surgical",
    appealTemplate: "family_therapy",
    verdictLogic: {
      RED:    ["medical_necessity", "not_covered"],
      YELLOW: ["visit_cap"],
      GREEN:  []
    }
  },

  // ─── GROUP THERAPY ───────────────────────────────────────────────────────────

  "90853": {
    name: "Group psychotherapy (not family)",
    timeRange: "45-90 min",
    category: "group_therapy",
    medicalEquivalent: "97150",
    medicalEquivalentName: "Therapeutic exercises, group (physical therapy)",
    commonDenials: ["medical_necessity", "visit_cap", "prior_auth", "not_covered"],
    parityTrigger: "Group therapy session cap or denial more restrictive than group physical therapy (97150) under same plan",
    statute: "MHPAEA 29 CFR 2590.712(c)(2)(ii)",
    statuteNote: "Quantitative treatment limits on MH group care must match limits on comparable medical group care",
    appealTemplate: "group_therapy",
    verdictLogic: {
      RED:    ["visit_cap", "medical_necessity"],
      YELLOW: ["prior_auth", "not_covered"],
      GREEN:  []
    }
  },

  // ─── ADD-ON / COMPLEXITY ─────────────────────────────────────────────────────

  "90785": {
    name: "Interactive complexity add-on (used with 90791, 90792, 90832, 90834, 90837, 90853)",
    timeRange: "add-on",
    category: "addon",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Established patient office visit, moderate complexity",
    commonDenials: ["not_covered", "bundling_error", "documentation"],
    parityTrigger: "Interactive complexity add-on denied while comparable medical add-on codes are covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Coverage of add-on services must be parity-compliant",
    appealTemplate: "therapy_medical_necessity",
    verdictLogic: {
      RED:    ["not_covered"],
      YELLOW: ["bundling_error", "documentation"],
      GREEN:  []
    }
  },

  // ─── CRISIS THERAPY ──────────────────────────────────────────────────────────

  "90839": {
    name: "Psychotherapy for crisis, first 60 minutes",
    timeRange: "60 min",
    category: "crisis",
    medicalEquivalent: "99285",
    medicalEquivalentName: "Emergency department visit, high complexity",
    commonDenials: ["medical_necessity", "not_covered", "prior_auth"],
    parityTrigger: "Crisis psychotherapy denied while high-complexity ER visit (99285) is covered for same crisis presentation",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Crisis MH care limitations may not exceed limitations on comparable emergency medical care",
    appealTemplate: "crisis_therapy",
    verdictLogic: {
      RED:    ["medical_necessity", "not_covered"],
      YELLOW: ["prior_auth"],
      GREEN:  []
    }
  },

  "90840": {
    name: "Psychotherapy for crisis, each additional 30 min (add-on with 90839)",
    timeRange: "30 min add-on",
    category: "crisis",
    medicalEquivalent: "99285",
    medicalEquivalentName: "Emergency department visit, high complexity",
    commonDenials: ["not_covered", "bundling_error", "medical_necessity"],
    parityTrigger: "Extended crisis therapy add-on denied while extended emergency medical services are covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Extended crisis MH care must receive parity with extended emergency medical care",
    appealTemplate: "crisis_therapy",
    verdictLogic: {
      RED:    ["not_covered", "medical_necessity"],
      YELLOW: ["bundling_error"],
      GREEN:  []
    }
  },

  // ─── PHARMACOLOGIC MANAGEMENT ────────────────────────────────────────────────

  "90863": {
    name: "Pharmacologic management (add-on after therapy, medication review)",
    timeRange: "add-on",
    category: "medication_management",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Established patient office visit, moderate complexity",
    commonDenials: ["not_covered", "wrong_cpt", "bundling_error"],
    parityTrigger: "Psychiatric medication management add-on denied while equivalent medical medication review is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "MH medication management must receive parity with medical medication management",
    appealTemplate: "medication_management",
    verdictLogic: {
      RED:    ["not_covered"],
      YELLOW: ["wrong_cpt", "bundling_error"],
      GREEN:  []
    }
  },

  // ─── PSYCHIATRIC E/M (used by psychiatrists for med management) ───────────

  "99212": {
    name: "Established patient office visit, low complexity (10 min) — psych med management",
    timeRange: "10 min",
    category: "psychiatric_em",
    medicalEquivalent: "99212",
    medicalEquivalentName: "Established patient office visit, low complexity",
    commonDenials: ["medical_necessity", "visit_cap", "documentation"],
    parityTrigger: "Psychiatric E/M visit denied while identical E/M code is covered for medical visits — same code, different treatment",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Identical CPT codes cannot be denied for MH diagnoses while approved for medical diagnoses",
    appealTemplate: "psychiatric_em",
    verdictLogic: {
      RED:    ["medical_necessity", "visit_cap"],
      YELLOW: ["documentation"],
      GREEN:  []
    }
  },

  "99213": {
    name: "Established patient office visit, moderate complexity (15 min) — psych med management",
    timeRange: "15 min",
    category: "psychiatric_em",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Established patient office visit, moderate complexity",
    commonDenials: ["medical_necessity", "visit_cap", "prior_auth", "documentation"],
    parityTrigger: "99213 denied for psychiatric diagnosis while same code approved for medical diagnosis under same plan",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Same CPT codes must receive same treatment regardless of whether diagnosis is MH or medical",
    appealTemplate: "psychiatric_em",
    verdictLogic: {
      RED:    ["medical_necessity", "visit_cap"],
      YELLOW: ["prior_auth", "documentation"],
      GREEN:  []
    }
  },

  "99214": {
    name: "Established patient office visit, moderate-high complexity (25 min) — psych med management",
    timeRange: "25 min",
    category: "psychiatric_em",
    medicalEquivalent: "99214",
    medicalEquivalentName: "Established patient office visit, moderate-high complexity",
    commonDenials: ["medical_necessity", "prior_auth", "documentation"],
    parityTrigger: "99214 denied for psychiatric diagnosis while same code covered for complex medical conditions",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "E/M codes cannot be denied selectively based on MH vs medical diagnosis",
    appealTemplate: "psychiatric_em",
    verdictLogic: {
      RED:    ["medical_necessity"],
      YELLOW: ["prior_auth", "documentation"],
      GREEN:  []
    }
  },

  "99215": {
    name: "Established patient office visit, high complexity (40 min) — psych med management",
    timeRange: "40 min",
    category: "psychiatric_em",
    medicalEquivalent: "99215",
    medicalEquivalentName: "Established patient office visit, high complexity",
    commonDenials: ["medical_necessity", "prior_auth", "documentation", "upcoding_flag"],
    parityTrigger: "High-complexity psychiatric visit denied while equivalent high-complexity medical visit is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "High-complexity MH visits must receive parity with high-complexity medical visits",
    appealTemplate: "psychiatric_em",
    verdictLogic: {
      RED:    ["medical_necessity"],
      YELLOW: ["prior_auth", "documentation", "upcoding_flag"],
      GREEN:  []
    }
  },

  // ─── PSYCHOLOGICAL TESTING ───────────────────────────────────────────────────

  "96130": {
    name: "Psychological testing evaluation services, first hour",
    timeRange: "60 min",
    category: "psychological_testing",
    medicalEquivalent: "95805",
    medicalEquivalentName: "Multiple sleep latency or maintenance of wakefulness testing (diagnostic study)",
    commonDenials: ["medical_necessity", "not_covered", "prior_auth"],
    parityTrigger: "Psychological testing denied while equivalent neurological diagnostic testing is covered under same plan",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Diagnostic testing for MH conditions must receive parity with diagnostic testing for medical conditions",
    appealTemplate: "psych_testing",
    verdictLogic: {
      RED:    ["not_covered", "medical_necessity"],
      YELLOW: ["prior_auth"],
      GREEN:  []
    }
  },

  "96131": {
    name: "Psychological testing evaluation services, each additional hour",
    timeRange: "60 min add-on",
    category: "psychological_testing",
    medicalEquivalent: "95806",
    medicalEquivalentName: "Sleep study, unattended (additional hour)",
    commonDenials: ["not_covered", "visit_cap", "medical_necessity"],
    parityTrigger: "Extended psychological testing add-on denied while extended medical diagnostic testing is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Extended MH diagnostic testing must receive parity with extended medical diagnostic testing",
    appealTemplate: "psych_testing",
    verdictLogic: {
      RED:    ["not_covered", "visit_cap"],
      YELLOW: ["medical_necessity"],
      GREEN:  []
    }
  },

  "96136": {
    name: "Psychological or neuropsychological test administration, first 30 min",
    timeRange: "30 min",
    category: "psychological_testing",
    medicalEquivalent: "95805",
    medicalEquivalentName: "Diagnostic sleep study",
    commonDenials: ["not_covered", "prior_auth", "medical_necessity"],
    parityTrigger: "Neuropsychological test administration denied while equivalent medical test administration is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "MH test administration must receive parity with medical test administration",
    appealTemplate: "psych_testing",
    verdictLogic: {
      RED:    ["not_covered"],
      YELLOW: ["prior_auth", "medical_necessity"],
      GREEN:  []
    }
  },

  // ─── COLLABORATIVE / INTEGRATED CARE ────────────────────────────────────────

  "99484": {
    name: "General behavioral health integration care management, 20+ min/month",
    timeRange: "20+ min/month",
    category: "care_management",
    medicalEquivalent: "99490",
    medicalEquivalentName: "Chronic care management, 20 min/month",
    commonDenials: ["not_covered", "medical_necessity", "documentation"],
    parityTrigger: "BHI care management denied while equivalent chronic care management (99490) for medical conditions is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Care management services for MH conditions must receive parity with care management for medical conditions",
    appealTemplate: "care_management",
    verdictLogic: {
      RED:    ["not_covered", "medical_necessity"],
      YELLOW: ["documentation"],
      GREEN:  []
    }
  },

  "99492": {
    name: "Initial psychiatric collaborative care management, first 70 min in first calendar month",
    timeRange: "70 min/month",
    category: "care_management",
    medicalEquivalent: "99490",
    medicalEquivalentName: "Chronic care management, 20 min/month",
    commonDenials: ["not_covered", "prior_auth", "medical_necessity"],
    parityTrigger: "Psychiatric collaborative care denied while equivalent medical collaborative care management is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Psychiatric collaborative care must receive parity with medical collaborative care",
    appealTemplate: "care_management",
    verdictLogic: {
      RED:    ["not_covered"],
      YELLOW: ["prior_auth", "medical_necessity"],
      GREEN:  []
    }
  },

  "99493": {
    name: "Subsequent psychiatric collaborative care management, first 60 min in subsequent month",
    timeRange: "60 min/month",
    category: "care_management",
    medicalEquivalent: "99490",
    medicalEquivalentName: "Chronic care management, 20 min/month",
    commonDenials: ["not_covered", "visit_cap", "medical_necessity"],
    parityTrigger: "Ongoing psychiatric collaborative care denied while equivalent ongoing medical care management is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Ongoing MH care management must receive parity with ongoing medical care management",
    appealTemplate: "care_management",
    verdictLogic: {
      RED:    ["not_covered", "visit_cap"],
      YELLOW: ["medical_necessity"],
      GREEN:  []
    }
  },

  // ─── HEALTH BEHAVIOR ASSESSMENT ─────────────────────────────────────────────

  "96156": {
    name: "Health behavior assessment and intervention, initial 30 min",
    timeRange: "30 min",
    category: "health_behavior",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Established patient office visit, moderate complexity",
    commonDenials: ["not_covered", "medical_necessity", "documentation"],
    parityTrigger: "Behavioral health intervention for medical condition denied while equivalent medical counseling is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Behavioral interventions tied to medical conditions must receive parity",
    appealTemplate: "therapy_medical_necessity",
    verdictLogic: {
      RED:    ["not_covered", "medical_necessity"],
      YELLOW: ["documentation"],
      GREEN:  []
    }
  },

  "96158": {
    name: "Health behavior intervention, individual, 30 min",
    timeRange: "30 min",
    category: "health_behavior",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Established patient office visit, moderate complexity",
    commonDenials: ["not_covered", "medical_necessity", "documentation"],
    parityTrigger: "Individual behavioral health intervention denied while equivalent medical counseling is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Individual MH behavioral interventions must receive parity",
    appealTemplate: "therapy_medical_necessity",
    verdictLogic: {
      RED:    ["not_covered"],
      YELLOW: ["medical_necessity", "documentation"],
      GREEN:  []
    }
  },

  // ─── TELEHEALTH SPECIFICS ────────────────────────────────────────────────────

  "G0459": {
    name: "Telehealth consultation for pharmacologic management, 20+ min",
    timeRange: "20+ min",
    category: "telehealth",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Established patient office visit, moderate complexity",
    commonDenials: ["not_covered", "wrong_modifier", "prior_auth"],
    parityTrigger: "Telehealth psychiatric medication management denied while equivalent telehealth medical consultations are covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(ii)",
    statuteNote: "Telehealth coverage for MH/SUD services must be comparable to telehealth coverage for medical services",
    appealTemplate: "telehealth",
    verdictLogic: {
      RED:    ["not_covered"],
      YELLOW: ["wrong_modifier", "prior_auth"],
      GREEN:  []
    }
  },

  "G2012": {
    name: "Brief virtual check-in, 5–10 min (telephone or video)",
    timeRange: "5-10 min",
    category: "telehealth",
    medicalEquivalent: "99442",
    medicalEquivalentName: "Telephone E/M service, 11–20 min",
    commonDenials: ["not_covered", "wrong_modifier", "documentation"],
    parityTrigger: "Brief MH virtual check-in denied while equivalent medical telephone check-in (99442) is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Virtual check-in coverage for MH must match virtual check-in coverage for medical services",
    appealTemplate: "telehealth",
    verdictLogic: {
      RED:    ["not_covered"],
      YELLOW: ["wrong_modifier", "documentation"],
      GREEN:  []
    }
  },

  // ─── SUBSTANCE USE DISORDER (covered under MHPAEA) ──────────────────────────

  "H0004": {
    name: "Behavioral health counseling and therapy, per 15 minutes (SUD)",
    timeRange: "15 min units",
    category: "substance_use",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Established patient office visit, moderate complexity",
    commonDenials: ["medical_necessity", "not_covered", "prior_auth", "visit_cap"],
    parityTrigger: "SUD counseling denied or visit-capped more strictly than equivalent medical counseling under same plan",
    statute: "MHPAEA 29 CFR 2590.712(c)(2)(ii)",
    statuteNote: "MHPAEA expressly covers substance use disorder benefits — treatment limits cannot exceed medical/surgical limits",
    appealTemplate: "substance_use",
    verdictLogic: {
      RED:    ["medical_necessity", "visit_cap"],
      YELLOW: ["prior_auth", "not_covered"],
      GREEN:  []
    }
  },

  "H0005": {
    name: "Alcohol and/or drug group counseling by a clinician (SUD)",
    timeRange: "group session",
    category: "substance_use",
    medicalEquivalent: "97150",
    medicalEquivalentName: "Therapeutic exercises, group",
    commonDenials: ["not_covered", "visit_cap", "medical_necessity"],
    parityTrigger: "SUD group counseling denied or limited more strictly than equivalent group physical therapy (97150)",
    statute: "MHPAEA 29 CFR 2590.712(c)(2)(ii)",
    statuteNote: "SUD group treatment limits must match limits on comparable medical group treatment",
    appealTemplate: "substance_use",
    verdictLogic: {
      RED:    ["not_covered", "visit_cap"],
      YELLOW: ["medical_necessity"],
      GREEN:  []
    }
  }
};

// ─── DENIAL REASONS ─────────────────────────────────────────────────────────

export const DENIAL_REASONS = {
  medical_necessity:  "Not medically necessary",
  visit_cap:          "Visit limit / session cap exceeded",
  prior_auth:         "Prior authorization required or missing",
  documentation:      "Insufficient documentation",
  not_covered:        "Service not covered under plan",
  wrong_cpt:          "Incorrect CPT code or mismatch",
  bundling_error:     "Bundling / unbundling issue",
  wrong_modifier:     "Missing or incorrect modifier (e.g. -95 for telehealth)",
  out_of_network:     "Provider out of network",
  timely_filing:      "Timely filing limit exceeded",
  upcoding_flag:      "Flagged for potential upcoding",
  coordination:       "Coordination of benefits issue"
};

// ─── PLAN TYPES ──────────────────────────────────────────────────────────────

export const PLAN_TYPES = [
  "PPO", "HMO", "EPO", "HDHP",
  "Medicaid", "Medicare Advantage", "Marketplace ACA",
  "Employer self-funded", "TRICARE"
];

// ─── CATEGORIES (for UI filtering) ──────────────────────────────────────────

export const CATEGORIES = {
  diagnostic:          "Diagnostic Evaluations",
  individual_therapy:  "Individual Therapy",
  family_therapy:      "Family Therapy",
  group_therapy:       "Group Therapy",
  addon:               "Add-On Codes",
  crisis:              "Crisis Therapy",
  medication_management: "Medication Management",
  psychiatric_em:      "Psychiatric E/M Visits",
  psychological_testing: "Psychological Testing",
  care_management:     "Collaborative Care",
  health_behavior:     "Health Behavior Intervention",
  telehealth:          "Telehealth",
  substance_use:       "Substance Use Disorder"
};
