export const csatData = [
  {
    sno: 1,
    prId: "PR001",
    cusId: "CUST001",
    score: 4.5,
    comments: "Excellent service delivery and communication throughout the project",
    account: "TechCorp Solutions",
    project: "Cloud Migration",
    bu: "Technology Services"
  },
  {
    sno: 2,
    prId: "PR002",
    cusId: "CUST002",
    score: 3.8,
    comments: "Good work but timeline could have been better managed",
    account: "Global Retail Inc",
    project: "E-commerce Platform",
    bu: "Digital Solutions"
  },
  {
    sno: 3,
    prId: "PR003",
    cusId: "CUST003",
    score: 5.0,
    comments: "Outstanding performance, exceeded all expectations",
    account: "Healthcare Systems",
    project: "Patient Portal",
    bu: "Healthcare IT"
  },
  {
    sno: 4,
    prId: "PR004",
    cusId: "CUST004",
    score: 4.2,
    comments: "Professional team with good technical expertise",
    account: "Finance Solutions Ltd",
    project: "Risk Management System",
    bu: "Financial Services"
  },
  {
    sno: 5,
    prId: "PR005",
    cusId: "CUST005",
    score: 3.5,
    comments: "Average performance, some delays in delivery",
    account: "Manufacturing Co",
    project: "ERP Implementation",
    bu: "Enterprise Solutions"
  },
  {
    sno: 6,
    prId: "PR006",
    cusId: "CUST006",
    score: 4.7,
    comments: "Very satisfied with the quality and support provided",
    account: "TechCorp Solutions",
    project: "Data Analytics Platform",
    bu: "Technology Services"
  },
  {
    sno: 7,
    prId: "PR007",
    cusId: "CUST007",
    score: 4.0,
    comments: "Good project management and technical delivery",
    account: "Global Retail Inc",
    project: "Mobile App Development",
    bu: "Digital Solutions"
  },
  {
    sno: 8,
    prId: "PR008",
    cusId: "CUST008",
    score: 4.8,
    comments: "Exceptional team collaboration and innovative solutions",
    account: "Healthcare Systems",
    project: "Telemedicine Platform",
    bu: "Healthcare IT"
  },
  {
    sno: 9,
    prId: "PR009",
    cusId: "CUST009",
    score: 3.9,
    comments: "Satisfactory delivery with room for improvement in communication",
    account: "Finance Solutions Ltd",
    project: "Compliance System",
    bu: "Financial Services"
  },
  {
    sno: 10,
    prId: "PR010",
    cusId: "CUST010",
    score: 4.3,
    comments: "Professional approach and good technical knowledge",
    account: "Manufacturing Co",
    project: "Supply Chain Management",
    bu: "Enterprise Solutions"
  },
  {
    sno: 11,
    prId: "PR011",
    cusId: "CUST011",
    score: 4.6,
    comments: "Excellent project execution and client communication",
    account: "TechCorp Solutions",
    project: "AI Integration",
    bu: "Technology Services"
  },
  {
    sno: 12,
    prId: "PR012",
    cusId: "CUST012",
    score: 4.1,
    comments: "Good quality work with timely delivery",
    account: "Global Retail Inc",
    project: "Inventory Management",
    bu: "Digital Solutions"
  },
  {
    sno: 13,
    prId: "PR013",
    cusId: "CUST013",
    score: 4.9,
    comments: "Outstanding performance and innovative solutions",
    account: "Healthcare Systems",
    project: "Electronic Health Records",
    bu: "Healthcare IT"
  },
  {
    sno: 14,
    prId: "PR014",
    cusId: "CUST014",
    score: 3.7,
    comments: "Adequate delivery but could improve in some areas",
    account: "Finance Solutions Ltd",
    project: "Trading Platform",
    bu: "Financial Services"
  },
  {
    sno: 15,
    prId: "PR015",
    cusId: "CUST015",
    score: 4.4,
    comments: "Very professional team with excellent technical skills",
    account: "Manufacturing Co",
    project: "Quality Management System",
    bu: "Enterprise Solutions"
  }
];

export const accounts = [...new Set(csatData.map(item => item.account))];
export const projects = [...new Set(csatData.map(item => item.project))];
export const businessUnits = [...new Set(csatData.map(item => item.bu))]; 