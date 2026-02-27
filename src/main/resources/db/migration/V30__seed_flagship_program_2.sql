-- Seed: Food Safety Officer Level 3 flagship program
-- background_image is seeded by FlagshipImageInitializer on startup
INSERT INTO flagship_program (
    title, tagline, slug, card_description, card_highlights,
    background_image, background_image_content_type,
    sections, course_id, active, display_order, created_at
) VALUES (
    'Food Safety Officer - Level 3',
    'Government Recognised',
    'food-safety-officer-level-3',
    'Prepare for the FSSAI Food Safety Officer examination with comprehensive coverage of food safety law, quality standards, and inspection techniques.',
    '["3 Days / 24 Hrs","Online, Self-paced","Certificate Provided","FSSAI Aligned","Govt. Recognised"]',
    NULL, NULL,
    '[
      {
        "type":"overview",
        "title":"Program Overview",
        "items":[
          "Duration: 3 Days / 24 Hours",
          "Mode: Online, Self-paced",
          "Certificate: Food Safety Officer Level 3",
          "Standard: FSSAI & Codex Alimentarius",
          "Delivery: Video lectures + case studies",
          "Support: Expert trainer Q&A"
        ]
      },
      {
        "type":"text",
        "title":"About This Program",
        "content":"The Food Safety Officer Level 3 programme is designed for individuals seeking government-recognised food safety competency in line with FSSAI regulations. This course provides a thorough grounding in Indian food safety law, inspection protocols, food hygiene principles, and risk communication. Learners gain practical skills required for roles as designated Food Safety Officers, compliance managers, or quality assurance supervisors within food businesses regulated under the Food Safety and Standards Act, 2006."
      },
      {
        "type":"text",
        "title":"Course Duration",
        "content":"This programme is delivered over 3 training days (24 hours total). The self-paced online format allows you to complete modules at your own schedule within a 60-day access window. Each day covers approximately 8 hours of learning content, including video lectures, reading materials, and regulatory case studies. Live Q&A sessions with the trainer are held fortnightly."
      },
      {
        "type":"bullets",
        "title":"Target Audience",
        "items":[
          "Aspiring Food Safety Officers (FSOs) under FSSAI or state food authorities",
          "Quality assurance and compliance managers in food businesses",
          "Food business operators (FBOs) seeking regulatory competence",
          "Graduates in food science, nutrition, microbiology, or related disciplines",
          "Hotel, catering, and hospitality professionals responsible for food safety",
          "Healthcare professionals involved in nutrition and public health",
          "Regulatory officers in municipal corporations and health departments"
        ]
      },
      {
        "type":"modules",
        "title":"Course Modules",
        "modules":[
          {
            "title":"Module 1: Food Safety Law & Regulation in India",
            "description":"Comprehensive overview of Indian food safety legislation and the FSSAI regulatory framework.",
            "points":[
              "Food Safety and Standards Act, 2006 — structure and scope",
              "FSSAI licensing and registration requirements",
              "Food Safety Standards (FSS) Regulations overview",
              "Roles and responsibilities of Food Safety Officers",
              "Penalties and enforcement mechanisms under FSS Act"
            ]
          },
          {
            "title":"Module 2: Food Microbiology & Contamination Control",
            "description":"Understanding microbial hazards in food and implementing effective contamination prevention measures.",
            "points":[
              "Foodborne pathogens: bacteria, viruses, parasites, and moulds",
              "Conditions favouring microbial growth (FATTOM)",
              "Cross-contamination routes and prevention strategies",
              "Safe temperatures for storage, cooking, and chilling",
              "Investigating and responding to foodborne illness outbreaks"
            ]
          },
          {
            "title":"Module 3: Food Hygiene & Good Manufacturing Practices",
            "description":"Practical application of personal hygiene standards and GMP principles in food handling environments.",
            "points":[
              "Personal hygiene standards for food handlers",
              "Good Manufacturing Practices (GMP) and Good Hygiene Practices (GHP)",
              "Cleaning and disinfection schedules and validation",
              "Waste management and pest control in food premises",
              "Staff training requirements and documentation"
            ]
          },
          {
            "title":"Module 4: Food Inspection & Sampling Techniques",
            "description":"Methodology and legal framework for conducting food premises inspections and collecting food samples.",
            "points":[
              "Risk-based inspection methodology",
              "Food premises inspection checklist and scoring",
              "Legal food sampling procedures under FSS Act",
              "Sample packaging, chain of custody, and laboratory submission",
              "Non-conformance reporting and follow-up enforcement actions"
            ]
          }
        ]
      },
      {
        "type":"bullets",
        "title":"Assessment",
        "items":[
          "Online multiple-choice examination (45 questions, 60 minutes)",
          "Case study assignment based on a real food premises inspection scenario",
          "Minimum pass mark: 65% for MCQ examination",
          "Assignment evaluated by a certified food safety assessor",
          "Two resit attempts included within the 60-day access window",
          "Certificate issued digitally within 5 working days of successful completion"
        ]
      },
      {
        "type":"bullets",
        "title":"Exam Details",
        "items":[
          "Format: Online proctored multiple-choice exam",
          "Duration: 60 minutes",
          "Questions: 45 MCQs covering all 4 modules",
          "Passing criteria: 65% or above (30/45 correct)",
          "Language: English",
          "Retake policy: 2 free retakes within 60-day access period",
          "Result: Declared immediately upon submission"
        ]
      },
      {
        "type":"bullets",
        "title":"Course Outcomes",
        "items":[
          "Understand and apply key provisions of the Food Safety and Standards Act, 2006",
          "Identify, assess, and control microbiological and chemical hazards in food",
          "Implement Good Manufacturing Practices and personal hygiene standards",
          "Conduct risk-based food premises inspections using approved checklists",
          "Collect and handle food samples in compliance with legal requirements",
          "Communicate food safety risks effectively to food business operators",
          "Earn a government-recognised Food Safety Officer Level 3 certificate"
        ]
      }
    ]',
    NULL, TRUE, 1, NOW()
);
