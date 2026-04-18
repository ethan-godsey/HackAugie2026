export const CPT_DATABASE = {
  "90837": {
    name: "Individual psychotherapy, 60 min",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Office visit, moderate complexity",
    commonDenials: ["medical_necessity","visit_cap","prior_auth","documentation"],
    parityTrigger: "Insurer applies stricter medical-necessity criteria to therapy than to equivalent office visits",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "NQTLs for MH/SUD may not be more restrictive than for medical/surgical benefits",
    appealTemplate: "therapy_medical_necessity",
    verdictLogic: { RED: ["medical_necessity","visit_cap"], YELLOW: ["prior_auth","documentation"], GREEN: [] }
  },
  "90834": {
    name: "Individual psychotherapy, 45 min",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Office visit, moderate complexity",
    commonDenials: ["medical_necessity","documentation","wrong_cpt"],
    parityTrigger: "Same parity protections as 90837 apply",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "NQTLs must be comparable between MH and medical benefits",
    appealTemplate: "therapy_medical_necessity",
    verdictLogic: { RED: ["medical_necessity"], YELLOW: ["documentation","wrong_cpt"], GREEN: [] }
  },
  "90832": {
    name: "Individual psychotherapy, 30 min",
    medicalEquivalent: "99212",
    medicalEquivalentName: "Office visit, low complexity",
    commonDenials: ["medical_necessity","documentation"],
    parityTrigger: "Stricter documentation requirements than comparable medical visit",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(i)",
    statuteNote: "Documentation standards for MH cannot exceed those for medical/surgical",
    appealTemplate: "therapy_medical_necessity",
    verdictLogic: { RED: ["medical_necessity"], YELLOW: ["documentation"], GREEN: [] }
  },
  "90847": {
    name: "Family psychotherapy with patient, 50 min",
    medicalEquivalent: "99214",
    medicalEquivalentName: "Office visit, moderate-high complexity",
    commonDenials: ["medical_necessity","visit_cap","not_covered"],
    parityTrigger: "Family therapy denied while family medical counseling (99366) is covered",
    statute: "MHPAEA 29 CFR 2590.712(c)(2)",
    statuteNote: "Financial requirements and treatment limits must be no more restrictive for MH",
    appealTemplate: "family_therapy",
    verdictLogic: { RED: ["medical_necessity","not_covered"], YELLOW: ["visit_cap"], GREEN: [] }
  },
  "90853": {
    name: "Group psychotherapy",
    medicalEquivalent: "99213",
    medicalEquivalentName: "Office visit, moderate complexity",
    commonDenials: ["medical_necessity","visit_cap","prior_auth"],
    parityTrigger: "Group therapy session cap stricter than group physical therapy (97150)",
    statute: "MHPAEA 29 CFR 2590.712(c)(2)(ii)",
    statuteNote: "Quantitative treatment limits on MH group care must match medical group care limits",
    appealTemplate: "group_therapy",
    verdictLogic: { RED: ["visit_cap","medical_necessity"], YELLOW: ["prior_auth"], GREEN: [] }
  },
  "90792": {
    name: "Psychiatric diagnostic evaluation",
    medicalEquivalent: "99205",
    medicalEquivalentName: "New patient office visit, high complexity",
    commonDenials: ["prior_auth","not_covered","medical_necessity"],
    parityTrigger: "Psychiatric intake requires prior auth while specialist medical intake does not",
    statute: "MHPAEA 29 CFR 2590.712(c)(4)(ii)",
    statuteNote: "Prior auth requirements for MH must be comparable to medical/surgical",
    appealTemplate: "psychiatric_eval",
    verdictLogic: { RED: ["prior_auth","not_covered"], YELLOW: ["medical_necessity"], GREEN: [] }
  }
};

export const DENIAL_REASONS = {
  medical_necessity: "Not medically necessary",
  visit_cap:         "Visit limit exceeded",
  prior_auth:        "Prior authorization required / missing",
  documentation:     "Insufficient documentation",
  not_covered:       "Service not covered under plan",
  wrong_cpt:         "Incorrect CPT code / mismatch",
  out_of_network:    "Provider out of network",
  timely_filing:     "Timely filing limit exceeded"
};
