-- Seed: HACCP Practitioner Level 4 flagship program
-- background_image is seeded by FlagshipImageInitializer on startup
INSERT INTO flagship_program (
    title, tagline, slug, card_description, card_highlights,
    background_image, background_image_content_type,
    sections, course_id, active, display_order, created_at
) VALUES (
    'HACCP Practitioner - Level 4',
    'In High Demand',
    'haccp-practitioner-level-4',
    'Gain globally recognised HACCP certification and become a certified food safety professional with hands-on practitioner skills.',
    '["5 Days / 40 Hrs","Online, Self-paced","Certificate Provided","ISO 22000 Aligned","Industry Recognised"]',
    NULL, NULL,
    '[
      {
        "type":"overview",
        "title":"Program Overview",
        "items":[
          "Duration: 5 Days / 40 Hours",
          "Mode: Online, Self-paced",
          "Certificate: HACCP Practitioner Level 4",
          "Standard: ISO 22000 & Codex Alimentarius",
          "Delivery: Video lectures + case studies",
          "Support: Expert trainer Q&A"
        ]
      },
      {
        "type":"text",
        "title":"About This Program",
        "content":"This Level 4 HACCP Practitioner program is designed for food safety professionals, quality managers, and production supervisors who need an in-depth understanding of Hazard Analysis and Critical Control Points (HACCP). The course covers the complete HACCP system from principles to implementation, including prerequisite programmes, hazard identification, CCP determination, and verification procedures. Upon completion you will be equipped to design, implement, and audit a HACCP plan in your organisation."
      },
      {
        "type":"text",
        "title":"Course Duration",
        "content":"This program is delivered over 5 training days (40 hours total). The self-paced online format allows you to complete modules at your own schedule within a 90-day access window. Each day covers approximately 8 hours of learning content, including video lectures, reading materials, and interactive case studies. Live Q&A sessions with the trainer are held weekly."
      },
      {
        "type":"bullets",
        "title":"Target Audience",
        "items":[
          "Food safety managers and quality assurance professionals",
          "Production supervisors and line managers in food manufacturing",
          "Graduates in food science, microbiology, or related disciplines",
          "ISO 22000 / FSSC 22000 internal auditors",
          "Regulatory compliance officers in food businesses",
          "Professionals seeking international food safety certification",
          "FSSAI-appointed food safety officers (FSOs) and designated officers"
        ]
      },
      {
        "type":"modules",
        "title":"Course Modules",
        "modules":[
          {
            "title":"Module 1: Introduction to Food Safety & HACCP",
            "description":"Foundation concepts of food safety management and the history and principles of HACCP.",
            "points":[
              "Food safety legislation and regulatory requirements",
              "The 7 principles of HACCP explained",
              "Codex Alimentarius guidelines",
              "Role of HACCP in ISO 22000 and FSSC 22000"
            ]
          },
          {
            "title":"Module 2: Prerequisite Programmes (PRPs)",
            "description":"Understanding and implementing the foundational prerequisites required before HACCP deployment.",
            "points":[
              "Facility design and hygiene",
              "Cleaning and disinfection procedures",
              "Pest control management",
              "Allergen management and cross-contact prevention",
              "Supplier approval and traceability systems"
            ]
          },
          {
            "title":"Module 3: Hazard Analysis",
            "description":"Systematic identification and evaluation of biological, chemical, and physical hazards.",
            "points":[
              "Biological hazards: pathogens, toxins, spoilage organisms",
              "Chemical hazards: pesticides, allergens, cleaning agents",
              "Physical hazards: foreign body contamination",
              "Risk assessment matrix and significance scoring",
              "Process flow diagram construction and verification"
            ]
          },
          {
            "title":"Module 4: Critical Control Points (CCPs)",
            "description":"Identifying and validating CCPs using the decision tree methodology.",
            "points":[
              "CCP decision tree application",
              "Establishing critical limits and operational limits",
              "Monitoring procedures and frequency",
              "Corrective action planning and documentation",
              "Difference between CCPs and operational PRPs (oPRPs)"
            ]
          },
          {
            "title":"Module 5: HACCP Plan Implementation & Verification",
            "description":"Practical implementation of a HACCP plan and ongoing verification activities.",
            "points":[
              "Documenting and maintaining the HACCP plan",
              "Internal verification and validation procedures",
              "Record-keeping requirements and document control",
              "Handling non-conformances, withdrawals, and recalls",
              "Preparing for third-party HACCP and ISO 22000 audits"
            ]
          }
        ]
      },
      {
        "type":"bullets",
        "title":"Assessment",
        "items":[
          "Online multiple-choice examination (60 questions, 90 minutes)",
          "Practical HACCP plan assignment based on a real food business scenario",
          "Minimum pass mark: 70% for MCQ examination",
          "Assignment evaluated by certified food safety assessor",
          "Two resit attempts included within the 90-day access window",
          "Certificate issued digitally within 5 working days of successful completion"
        ]
      },
      {
        "type":"bullets",
        "title":"Exam Details",
        "items":[
          "Format: Online proctored multiple-choice exam",
          "Duration: 90 minutes",
          "Questions: 60 MCQs covering all 5 modules",
          "Passing criteria: 70% or above (42/60 correct)",
          "Language: English",
          "Retake policy: 2 free retakes within 90-day access period",
          "Result: Declared immediately upon submission"
        ]
      },
      {
        "type":"bullets",
        "title":"Course Outcomes",
        "items":[
          "Design and implement a complete HACCP food safety plan from scratch",
          "Conduct systematic hazard analysis for any food manufacturing process",
          "Identify and validate critical control points using the CCP decision tree",
          "Establish effective monitoring, corrective action and verification procedures",
          "Develop and maintain HACCP documentation meeting regulatory requirements",
          "Prepare your facility for ISO 22000 / FSSC 22000 third-party certification",
          "Earn an internationally recognised HACCP Practitioner Level 4 certificate"
        ]
      }
    ]',
    NULL, TRUE, 0, NOW()
);
