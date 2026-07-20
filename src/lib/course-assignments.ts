import { addDays, getWeekMonday, toDateKey } from "@/lib/timetable-week";

export type AssignmentBlueprint = {
  title: string;
  description: string;
  dueWeek: number;
};

export type CourseAssignment = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueWeek: number;
};

export type AssignmentStatus = "pending" | "submitted" | "overdue";

export type DueDateFilter = "all" | "this-week" | "next-week" | "this-month" | "overdue";

export type StatusFilter = "all" | AssignmentStatus;

const ASSIGNMENT_BLUEPRINTS: Record<string, AssignmentBlueprint[]> = {
  "COM100-computing": [
    { title: "ER Diagram & Normalization Report", description: "Design an entity-relationship model and normalize tables to 3NF for a campus library system.", dueWeek: 3 },
    { title: "SQL Query Optimization Lab", description: "Write and tune SQL queries for complex joins, aggregations, and indexing scenarios.", dueWeek: 7 },
    { title: "Database Design Project Submission", description: "Submit a complete relational database schema with sample data and query documentation.", dueWeek: 12 },
  ],
  "COM101-computing": [
    { title: "Control Structures Programming Exercise", description: "Implement programs using loops, conditionals, and functions to solve structured problems.", dueWeek: 3 },
    { title: "Debugging & Testing Challenge", description: "Identify logic errors in provided code and document your debugging process with test cases.", dueWeek: 7 },
    { title: "Capstone Console Application", description: "Build a menu-driven application demonstrating OOP concepts and clean code practices.", dueWeek: 12 },
  ],
  "COM104-computing": [
    { title: "Data Cleaning & EDA Notebook", description: "Preprocess a raw dataset and produce exploratory visualizations with written insights.", dueWeek: 3 },
    { title: "Predictive Modeling Report", description: "Train and evaluate a basic machine learning model with performance metrics analysis.", dueWeek: 7 },
    { title: "Data Science Case Study Portfolio", description: "Present an end-to-end analysis from data collection through model interpretation.", dueWeek: 12 },
  ],
  "COM105-computing": [
    { title: "OSI Model Protocol Mapping", description: "Map real-world network scenarios to OSI layers and explain protocol responsibilities.", dueWeek: 3 },
    { title: "Subnetting & Routing Lab", description: "Calculate IP subnets and configure routing tables for a small enterprise network.", dueWeek: 7 },
    { title: "Network Security Audit Report", description: "Assess vulnerabilities in a sample network topology and propose security controls.", dueWeek: 12 },
  ],
  "COM110-computing": [
    { title: "Search Algorithm Comparison", description: "Implement and compare heuristic search algorithms on a grid navigation problem.", dueWeek: 3 },
    { title: "Neural Network Mini-Project", description: "Train a simple neural network on a classification dataset and analyze results.", dueWeek: 7 },
    { title: "NLP Text Classification Task", description: "Build a pipeline for text preprocessing and sentiment classification with evaluation.", dueWeek: 12 },
  ],
  "BUS100-business": [
    { title: "Journal Entries Workbook", description: "Record business transactions using double-entry bookkeeping principles.", dueWeek: 3 },
    { title: "Trial Balance & Adjustments", description: "Prepare adjusted trial balance entries for a fictional trading company.", dueWeek: 7 },
    { title: "Financial Statements Preparation", description: "Compile income statement and balance sheet from provided ledger accounts.", dueWeek: 12 },
  ],
  "BUS101-business": [
    { title: "Leadership Style Analysis", description: "Analyze leadership approaches in a case organization using management theories.", dueWeek: 3 },
    { title: "Strategic Planning Brief", description: "Develop SWOT analysis and strategic objectives for a selected company.", dueWeek: 7 },
    { title: "Management Decision Case Study", description: "Evaluate a complex management dilemma and recommend a justified course of action.", dueWeek: 12 },
  ],
  "BUS102-business": [
    { title: "Descriptive Analytics Dashboard", description: "Create visual summaries of business KPIs using sample sales and operations data.", dueWeek: 3 },
    { title: "Regression Forecasting Report", description: "Apply regression techniques to forecast demand and interpret model coefficients.", dueWeek: 7 },
    { title: "Business Intelligence Presentation", description: "Deliver data-driven recommendations supported by statistical evidence.", dueWeek: 12 },
  ],
  "BUS105-business": [
    { title: "Time Value of Money Worksheet", description: "Solve present value, future value, and annuity problems with step-by-step workings.", dueWeek: 3 },
    { title: "Capital Budgeting Analysis", description: "Evaluate investment projects using NPV, IRR, and payback period methods.", dueWeek: 7 },
    { title: "Corporate Finance Case Report", description: "Assess financing options and risk-return trade-offs for a growth-stage firm.", dueWeek: 12 },
  ],
  "BUS107-business": [
    { title: "Recruitment Process Design", description: "Outline a fair talent acquisition workflow including job analysis and selection tools.", dueWeek: 3 },
    { title: "Performance Appraisal Framework", description: "Design a performance review system aligned with organizational goals.", dueWeek: 7 },
    { title: "HR Policy Recommendation Paper", description: "Propose HR policies addressing training, retention, and labor relations.", dueWeek: 12 },
  ],
  "BUS112-business": [
    { title: "Market Segmentation Profile", description: "Define target segments using demographic, psychographic, and behavioral criteria.", dueWeek: 3 },
    { title: "Marketing Mix Strategy Plan", description: "Develop product, price, place, and promotion strategies for a new product launch.", dueWeek: 7 },
    { title: "Integrated Campaign Proposal", description: "Submit a full marketing campaign with budget allocation and channel rationale.", dueWeek: 12 },
  ],
  "ENG100-engineering": [
    { title: "First Law Thermodynamics Problems", description: "Solve energy balance problems for closed and open systems with heat and work terms.", dueWeek: 3 },
    { title: "Entropy & Efficiency Analysis", description: "Calculate entropy changes and thermal efficiency for heat engine cycles.", dueWeek: 7 },
    { title: "Thermal Systems Design Report", description: "Model a practical thermal system and evaluate performance under design constraints.", dueWeek: 12 },
  ],
  "ENG101-engineering": [
    { title: "Calculus Application Set", description: "Apply differentiation and integration to engineering rate and area problems.", dueWeek: 3 },
    { title: "Differential Equations Lab", description: "Solve first- and second-order differential equations modelling physical systems.", dueWeek: 7 },
    { title: "Linear Algebra Engineering Project", description: "Use matrix methods to solve a multi-variable engineering computation problem.", dueWeek: 12 },
  ],
  "ENG102-engineering": [
    { title: "2D Technical Drawing Submission", description: "Produce orthographic projections following engineering drafting standards.", dueWeek: 3 },
    { title: "3D CAD Modelling Assignment", description: "Model a mechanical component with dimensions, constraints, and assembly views.", dueWeek: 7 },
    { title: "CAD Design Portfolio", description: "Submit annotated CAD drawings with design rationale and revision history.", dueWeek: 12 },
  ],
  "ENG103-engineering": [
    { title: "Transfer Function Modelling", description: "Derive transfer functions for linear systems and plot step responses.", dueWeek: 3 },
    { title: "Stability Analysis Exercise", description: "Apply Routh-Hurwitz and root locus methods to assess system stability.", dueWeek: 7 },
    { title: "Controller Design Project", description: "Design and simulate a PID controller for a given plant model.", dueWeek: 12 },
  ],
  "ENG108-engineering": [
    { title: "Static Equilibrium Problems", description: "Analyse forces on rigid bodies in static equilibrium using free-body diagrams.", dueWeek: 3 },
    { title: "Stress-Strain Analysis", description: "Calculate normal and shear stress for structural members under load.", dueWeek: 7 },
    { title: "Mechanics Design Report", description: "Evaluate structural behaviour and recommend design improvements.", dueWeek: 12 },
  ],
  "ENG109-engineering": [
    { title: "DC Circuit Analysis Quiz", description: "Apply Ohm's and Kirchhoff's laws to series-parallel circuit networks.", dueWeek: 3 },
    { title: "AC Impedance Laboratory", description: "Analyse AC circuits with resistors, capacitors, and inductors.", dueWeek: 7 },
    { title: "Circuit Design Project", description: "Design and document a functional circuit meeting specified performance criteria.", dueWeek: 12 },
  ],
  "LAW100-law": [
    { title: "Contract Formation Case Brief", description: "Analyse offer, acceptance, and consideration in a contractual dispute scenario.", dueWeek: 3 },
    { title: "Terms & Breach Memorandum", description: "Evaluate express and implied terms and remedies available for breach.", dueWeek: 7 },
    { title: "Contract Law Problem Question", description: "Provide structured legal advice on a multi-issue contract law scenario.", dueWeek: 12 },
  ],
  "LAW102-law": [
    { title: "Primary Source Research Task", description: "Locate and summarise relevant statutes and case law for a given legal issue.", dueWeek: 3 },
    { title: "Legal Argument Outline", description: "Construct a coherent argument using authoritative legal sources.", dueWeek: 7 },
    { title: "Research Memorandum Submission", description: "Submit a formal legal memo with citations and counter-argument analysis.", dueWeek: 12 },
  ],
  "LAW105-law": [
    { title: "Negligence Elements Analysis", description: "Apply duty, breach, causation, and remoteness to a tort law fact pattern.", dueWeek: 3 },
    { title: "Nuisance & Trespass Brief", description: "Compare land-related torts and available remedies in given scenarios.", dueWeek: 7 },
    { title: "Tort Law Problem Question", description: "Advise parties on liability and damages in a complex tort dispute.", dueWeek: 12 },
  ],
  "LAW106-law": [
    { title: "Separation of Powers Essay", description: "Discuss constitutional limits on executive, legislative, and judicial powers.", dueWeek: 3 },
    { title: "Fundamental Rights Case Review", description: "Analyse a landmark decision on constitutional human rights protection.", dueWeek: 7 },
    { title: "Constitutional Reform Proposal", description: "Evaluate a constitutional amendment proposal with legal justification.", dueWeek: 12 },
  ],
  "LAW109-law": [
    { title: "Actus Reus & Mens Rea Worksheet", description: "Identify criminal elements in statutory and common law offences.", dueWeek: 3 },
    { title: "Defences in Criminal Law", description: "Apply general and specific defences to hypothetical criminal scenarios.", dueWeek: 7 },
    { title: "Criminal Law Problem Question", description: "Structure a prosecution or defence argument for a multi-count indictment.", dueWeek: 12 },
  ],
  "HEA100-health-science": [
    { title: "Skeletal System Labelling Task", description: "Identify major bones and joints with annotated anatomical diagrams.", dueWeek: 3 },
    { title: "Muscular & Nervous Systems Report", description: "Explain structural relationships between muscle groups and nerve pathways.", dueWeek: 7 },
    { title: "Anatomy Integration Assignment", description: "Integrate cardiovascular and musculoskeletal anatomy in a clinical context.", dueWeek: 12 },
  ],
  "HEA101-health-science": [
    { title: "Homeostasis Mechanisms Review", description: "Describe feedback loops maintaining internal physiological balance.", dueWeek: 3 },
    { title: "Organ System Function Analysis", description: "Explain coordinated function across respiratory, circulatory, and renal systems.", dueWeek: 7 },
    { title: "Physiology Case Application", description: "Apply physiological principles to interpret patient symptom presentations.", dueWeek: 12 },
  ],
  "HEA103-health-science": [
    { title: "Epidemiology Data Interpretation", description: "Analyse disease incidence and prevalence data for a community health issue.", dueWeek: 3 },
    { title: "Health Promotion Campaign Plan", description: "Design an evidence-based intervention targeting a public health priority.", dueWeek: 7 },
    { title: "Policy Impact Assessment", description: "Evaluate healthcare policy outcomes and recommend improvements.", dueWeek: 12 },
  ],
  "HEA107-health-science": [
    { title: "Clinical Communication Reflection", description: "Reflect on professional communication techniques in patient interactions.", dueWeek: 3 },
    { title: "Diagnostic Reasoning Case Log", description: "Document clinical reasoning steps for assigned patient scenarios.", dueWeek: 7 },
    { title: "Clinical Skills Portfolio", description: "Submit competency evidence for core clinical assessment procedures.", dueWeek: 12 },
  ],
  "HEA110-health-science": [
    { title: "Macronutrient Analysis Worksheet", description: "Calculate and interpret macronutrient intake against dietary guidelines.", dueWeek: 3 },
    { title: "Metabolism & Health Report", description: "Explain metabolic pathways linking nutrition to chronic disease risk.", dueWeek: 7 },
    { title: "Personalised Nutrition Plan", description: "Develop a nutrition plan supported by evidence-based recommendations.", dueWeek: 12 },
  ],
  "SOC100-social-science": [
    { title: "Social Institution Analysis", description: "Examine roles of family, education, or religion in shaping social behaviour.", dueWeek: 3 },
    { title: "Inequality & Stratification Essay", description: "Discuss structural factors contributing to social inequality.", dueWeek: 7 },
    { title: "Sociological Field Observation Report", description: "Present findings from structured observation of social interaction.", dueWeek: 12 },
  ],
  "SOC101-social-science": [
    { title: "Cognitive Development Summary", description: "Compare major theories of cognitive development with examples.", dueWeek: 3 },
    { title: "Personality Assessment Review", description: "Critically evaluate a personality framework using research evidence.", dueWeek: 7 },
    { title: "Psychology Applied Case Study", description: "Apply psychological concepts to explain behaviour in a real-world setting.", dueWeek: 12 },
  ],
  "SOC102-social-science": [
    { title: "Research Design Proposal", description: "Draft a research question, hypothesis, and methodology for a social study.", dueWeek: 3 },
    { title: "Data Collection Instrument", description: "Design a survey or interview guide with validity considerations.", dueWeek: 7 },
    { title: "Research Report Submission", description: "Submit findings with ethical considerations and academic writing standards.", dueWeek: 12 },
  ],
  "SOC105-social-science": [
    { title: "Ethical Theory Comparison", description: "Contrast deontological and consequentialist approaches to moral dilemmas.", dueWeek: 3 },
    { title: "Professional Ethics Case Analysis", description: "Apply ethical frameworks to a workplace misconduct scenario.", dueWeek: 7 },
    { title: "Ethics Position Paper", description: "Argue a reasoned stance on a contemporary societal ethical issue.", dueWeek: 12 },
  ],
  "COM100-communication": [
    { title: "Creative Brief Development", description: "Produce an advertising creative brief with target audience insights.", dueWeek: 3 },
    { title: "Copywriting Portfolio", description: "Submit ad copy variants for print and digital channels.", dueWeek: 7 },
    { title: "Integrated Ad Campaign Plan", description: "Present media planning and campaign strategy for a product launch.", dueWeek: 12 },
  ],
  "COM101-communication": [
    { title: "Stakeholder Mapping Exercise", description: "Identify stakeholders and communication priorities for a brand crisis.", dueWeek: 3 },
    { title: "Press Release & Media Kit", description: "Draft PR materials aligned with reputation management objectives.", dueWeek: 7 },
    { title: "Crisis Communication Plan", description: "Develop a full crisis response strategy with key messages and channels.", dueWeek: 12 },
  ],
  "COM103-communication": [
    { title: "News Lead Writing Task", description: "Write compelling leads for hard news and feature stories.", dueWeek: 3 },
    { title: "Investigative Story Pitch", description: "Pitch an investigative topic with source plan and ethical safeguards.", dueWeek: 7 },
    { title: "Multi-Platform News Package", description: "Submit a complete news story with edits for web and print formats.", dueWeek: 12 },
  ],
  "COM105-communication": [
    { title: "Social Content Calendar", description: "Plan a two-week content calendar with platform-specific assets.", dueWeek: 3 },
    { title: "Video Editing Project", description: "Edit a short-form video applying pacing, captions, and branding.", dueWeek: 7 },
    { title: "Digital Media Campaign Portfolio", description: "Present a cohesive digital campaign with analytics goals.", dueWeek: 12 },
  ],
  "HOS100-hospitality": [
    { title: "Menu Costing Worksheet", description: "Calculate food costs and pricing for a restaurant menu section.", dueWeek: 3 },
    { title: "Kitchen Safety Audit", description: "Evaluate HACCP compliance and safety procedures in a service operation.", dueWeek: 7 },
    { title: "Food Service Operations Plan", description: "Design workflow and quality controls for a dining service shift.", dueWeek: 12 },
  ],
  "HOS101-hospitality": [
    { title: "Event Concept Proposal", description: "Outline theme, audience, and objectives for a planned event.", dueWeek: 3 },
    { title: "Event Budget & Logistics Plan", description: "Prepare detailed budget, timeline, and vendor coordination schedule.", dueWeek: 7 },
    { title: "Event Risk Management Report", description: "Assess operational risks and mitigation strategies for event delivery.", dueWeek: 12 },
  ],
  "HOS104-hospitality": [
    { title: "Destination SWOT Analysis", description: "Evaluate tourism strengths and constraints for a selected destination.", dueWeek: 3 },
    { title: "Sustainable Tourism Framework", description: "Propose sustainability measures for destination development.", dueWeek: 7 },
    { title: "Tourism Master Plan Summary", description: "Submit a strategic tourism plan with stakeholder impact analysis.", dueWeek: 12 },
  ],
  "HOS107-hospitality": [
    { title: "Front Office Procedure Manual", description: "Document check-in, reservation, and guest service standard procedures.", dueWeek: 3 },
    { title: "Service Quality Assessment", description: "Evaluate guest experience metrics and service recovery practices.", dueWeek: 7 },
    { title: "Lodging Operations Case Study", description: "Recommend operational improvements for a hotel performance scenario.", dueWeek: 12 },
  ],
  "LAN100-language": [
    { title: "Academic Summary Writing Task", description: "Summarise a scholarly article using formal academic register.", dueWeek: 3 },
    { title: "Argumentative Essay Draft", description: "Develop a thesis-driven essay with cited supporting evidence.", dueWeek: 7 },
    { title: "Research Presentation Script", description: "Prepare an oral presentation script with structured academic argumentation.", dueWeek: 12 },
  ],
  "LAN101-language": [
    { title: "Professional Email Portfolio", description: "Compose workplace emails for negotiation, inquiry, and follow-up scenarios.", dueWeek: 3 },
    { title: "Meeting Minutes & Agenda Pack", description: "Prepare formal meeting documents demonstrating professional tone.", dueWeek: 7 },
    { title: "Business Presentation Delivery", description: "Submit slides and speaker notes for a stakeholder presentation.", dueWeek: 12 },
  ],
  "LAN104-language": [
    { title: "Malay Grammar Exercise Set", description: "Complete structured grammar tasks on sentence formation and tatabahasa.", dueWeek: 3 },
    { title: "Reading Comprehension Response", description: "Answer comprehension questions on a formal Malay text passage.", dueWeek: 7 },
    { title: "Malay Formal Writing Assignment", description: "Write a formal letter or essay demonstrating intermediate Malay proficiency.", dueWeek: 12 },
  ],
  "LAN112-language": [
    { title: "Pinyin & Character Practice", description: "Complete vocabulary and character writing exercises with tone accuracy.", dueWeek: 3 },
    { title: "Conversational Mandarin Recording", description: "Submit a spoken dialogue demonstrating basic conversational structures.", dueWeek: 7 },
    { title: "Mandarin Composition Task", description: "Write a short composition using taught grammatical patterns and vocabulary.", dueWeek: 12 },
  ],
  "BUI100-built-environment": [
    { title: "Construction Method Comparison", description: "Compare traditional and modern construction techniques for a building element.", dueWeek: 3 },
    { title: "Site Works Planning Brief", description: "Outline site preparation, sequencing, and safety requirements.", dueWeek: 7 },
    { title: "Construction Technology Report", description: "Evaluate structural system selection for a specified building type.", dueWeek: 12 },
  ],
  "BUI102-built-environment": [
    { title: "Material Properties Worksheet", description: "Analyse physical properties of steel, concrete, timber, and masonry.", dueWeek: 3 },
    { title: "Material Selection Case Study", description: "Recommend materials based on durability and environmental conditions.", dueWeek: 7 },
    { title: "Building Materials Specification", description: "Prepare material specifications for a construction detail package.", dueWeek: 12 },
  ],
  "BUI104-built-environment": [
    { title: "Measurement Takeoff Exercise", description: "Measure quantities from drawings using standard QS conventions.", dueWeek: 3 },
    { title: "Cost Estimate Preparation", description: "Prepare elemental cost estimate with assumptions and rate build-up.", dueWeek: 7 },
    { title: "BOQ & Contract Documentation", description: "Submit bill of quantities and supporting contract documentation.", dueWeek: 12 },
  ],
  "ACC100-accountancy": [
    { title: "Audit Risk Assessment Memo", description: "Identify inherent and control risks for an audit engagement.", dueWeek: 3 },
    { title: "Substantive Testing Workpaper", description: "Design audit tests for key financial statement assertions.", dueWeek: 7 },
    { title: "Audit Report Draft", description: "Prepare audit findings and reporting recommendations.", dueWeek: 12 },
  ],
  "ACC101-accountancy": [
    { title: "Individual Tax Computation", description: "Calculate chargeable income and tax liability for sample taxpayers.", dueWeek: 3 },
    { title: "Corporate Tax Scenario Analysis", description: "Apply corporate tax rules to business income and allowable deductions.", dueWeek: 7 },
    { title: "Tax Compliance Case Report", description: "Advise on tax compliance obligations and planning considerations.", dueWeek: 12 },
  ],
  "ACC104-accountancy": [
    { title: "Cost Classification Exercise", description: "Classify costs by behaviour and relevance for managerial decisions.", dueWeek: 3 },
    { title: "Budget Variance Analysis", description: "Analyse budget versus actual performance with management commentary.", dueWeek: 7 },
    { title: "Management Accounting Report", description: "Recommend pricing and production decisions using cost-volume-profit analysis.", dueWeek: 12 },
  ],
  "ACC105-accountancy": [
    { title: "Journal & Ledger Preparation", description: "Record transactions and post to ledger accounts under accounting standards.", dueWeek: 3 },
    { title: "Financial Statement Draft", description: "Prepare draft financial statements with required disclosures.", dueWeek: 7 },
    { title: "Accounting Standards Application", description: "Apply selected standards to complex reporting scenarios.", dueWeek: 12 },
  ],
  "GEN100-general": [
    { title: "Integrity Reflection Journal", description: "Reflect on personal and professional integrity in academic settings.", dueWeek: 3 },
    { title: "Anti-Corruption Case Review", description: "Analyse governance failures and anti-corruption controls in a case study.", dueWeek: 7 },
    { title: "Ethical Leadership Essay", description: "Discuss integrity as a foundation for responsible leadership.", dueWeek: 12 },
  ],
  "GEN102-general": [
    { title: "Etika & Peradaban Reading Response", description: "Respond critically to readings on ethics and Malaysian civilization.", dueWeek: 3 },
    { title: "Nilai Kebangsaan Discussion Paper", description: "Discuss national unity values in contemporary Malaysian society.", dueWeek: 7 },
    { title: "Penghayatan Etika Final Essay", description: "Write an integrative essay on ethics, culture, and citizenship.", dueWeek: 12 },
  ],
  "GEN103-general": [
    { title: "Logical Fallacies Worksheet", description: "Identify fallacies in sample arguments and propose corrections.", dueWeek: 3 },
    { title: "Structured Argument Analysis", description: "Evaluate argument strength using reasoning frameworks.", dueWeek: 7 },
    { title: "Critical Thinking Position Paper", description: "Construct a well-reasoned argument on a complex decision problem.", dueWeek: 12 },
  ],
  "GEN105-general": [
    { title: "Opportunity Recognition Canvas", description: "Identify and validate a startup opportunity using market signals.", dueWeek: 3 },
    { title: "Business Model Draft", description: "Draft business model components including value proposition and revenue streams.", dueWeek: 7 },
    { title: "Startup Business Plan Submission", description: "Submit a complete business plan with funding and growth strategy.", dueWeek: 12 },
  ],
};

export function getCourseAssignments(courseId: string): CourseAssignment[] {
  const blueprints = ASSIGNMENT_BLUEPRINTS[courseId];
  if (!blueprints) {
    return [];
  }

  return blueprints.map((blueprint, index) => ({
    id: `${courseId}-assignment-${index + 1}`,
    courseId,
    title: blueprint.title,
    description: blueprint.description,
    dueWeek: blueprint.dueWeek,
  }));
}

export function getAllCourseAssignments(courseIds: string[]): CourseAssignment[] {
  return courseIds.flatMap((courseId) => getCourseAssignments(courseId));
}

export function getAssignmentDueDate(semesterStartMonday: Date, dueWeek: number) {
  const semesterMonday = getWeekMonday(semesterStartMonday);
  return addDays(semesterMonday, (dueWeek - 1) * 7 + 4);
}

export function resolveAssignmentStatus(
  dueDate: Date,
  submitted: boolean,
  now = new Date(),
): AssignmentStatus {
  if (submitted) {
    return "submitted";
  }

  const dueEnd = new Date(dueDate);
  dueEnd.setHours(23, 59, 59, 999);

  if (now > dueEnd) {
    return "overdue";
  }

  return "pending";
}

export function formatAssignmentDueDate(dueDate: Date) {
  return dueDate.toLocaleDateString("en-MY", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDueCountdown(dueDate: Date, now = new Date()) {
  const dueEnd = new Date(dueDate);
  dueEnd.setHours(23, 59, 59, 999);
  const diffMs = dueEnd.getTime() - now.getTime();

  if (diffMs < 0) {
    const overdueDays = Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    return overdueDays === 1 ? "1 day overdue" : `${overdueDays} days overdue`;
  }

  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (daysLeft === 0) {
    return "Due today";
  }
  if (daysLeft === 1) {
    return "1 day left";
  }
  return `${daysLeft} days left`;
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function isDateInRange(date: Date, start: Date, end: Date) {
  const value = date.getTime();
  return value >= start.getTime() && value <= end.getTime();
}

export function matchesDueDateFilter(
  dueDate: Date,
  filter: DueDateFilter,
  now = new Date(),
  selectedDateKey?: string | null,
) {
  if (selectedDateKey) {
    return toDateKey(dueDate) === selectedDateKey;
  }

  if (filter === "all") {
    return true;
  }

  const today = startOfDay(now);
  const weekMonday = getWeekMonday(today);
  const weekSunday = endOfDay(addDays(weekMonday, 6));
  const nextWeekMonday = addDays(weekMonday, 7);
  const nextWeekSunday = endOfDay(addDays(nextWeekMonday, 6));
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));

  switch (filter) {
    case "this-week":
      return isDateInRange(dueDate, weekMonday, weekSunday);
    case "next-week":
      return isDateInRange(dueDate, nextWeekMonday, nextWeekSunday);
    case "this-month":
      return isDateInRange(dueDate, monthStart, monthEnd);
    case "overdue":
      return dueDate.getTime() < today.getTime();
    default:
      return true;
  }
}

export type StudentAssignment = CourseAssignment & {
  courseCode: string;
  courseName: string;
  dueDate: Date;
  dueDateKey: string;
  status: AssignmentStatus;
  submittedAt?: string;
};

export function buildStudentAssignments(
  courseIds: string[],
  courses: Array<{ id: string; code: string; name: string }>,
  semesterStartMonday: Date,
  submissions: Array<{ assignmentId: string; submittedAt: string }>,
  now = new Date(),
): StudentAssignment[] {
  const courseMap = new Map(courses.map((course) => [course.id, course]));

  return getAllCourseAssignments(courseIds)
    .flatMap((assignment) => {
      const course = courseMap.get(assignment.courseId);
      if (!course) {
        return [];
      }

      const submission = submissions.find((item) => item.assignmentId === assignment.id);
      const dueDate = getAssignmentDueDate(semesterStartMonday, assignment.dueWeek);
      const status = resolveAssignmentStatus(dueDate, Boolean(submission), now);

      return [
        {
          ...assignment,
          courseCode: course.code,
          courseName: course.name,
          dueDate,
          dueDateKey: toDateKey(dueDate),
          status,
          submittedAt: submission?.submittedAt,
        },
      ];
    })
    .sort((first, second) => first.dueDate.getTime() - second.dueDate.getTime());
}

export function filterStudentAssignments(
  assignments: StudentAssignment[],
  {
    courseId,
    status,
    dueDate,
    selectedDateKey,
    now = new Date(),
  }: {
    courseId: string;
    status: StatusFilter;
    dueDate: DueDateFilter;
    selectedDateKey?: string | null;
    now?: Date;
  },
) {
  return assignments.filter((assignment) => {
    if (courseId !== "all" && assignment.courseId !== courseId) {
      return false;
    }

    if (status !== "all" && assignment.status !== status) {
      return false;
    }

    if (!matchesDueDateFilter(assignment.dueDate, dueDate, now, selectedDateKey)) {
      return false;
    }

    return true;
  });
}
