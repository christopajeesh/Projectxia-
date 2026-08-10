export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Initial verified seed leads dispatched to theprojectxia@gmail.com
  const agencyLeads = [
    {
      _id: 'inq_lead_6a789fc22f356662d685273f',
      name: 'Priya Sharma',
      clientName: 'Priya Sharma',
      email: 'priya.sharma.tech@gmail.com',
      clientEmail: 'priya.sharma.tech@gmail.com',
      mobile: '+91 98451 23456',
      clientMobile: '+91 98451 23456',
      dept: 'Computer Science (AI & ML)',
      department: 'Computer Science (AI & ML)',
      projectTitle: 'AI Medical Imaging & Automated Diagnostic Bot',
      description: 'Need a custom deep learning PyTorch system capable of analyzing chest X-rays with Grad-CAM heatmaps and generating automated clinical reports. Need full source code, trained weights, and 4K demo walkthrough video.',
      requirements: 'Need a custom deep learning PyTorch system capable of analyzing chest X-rays with Grad-CAM heatmaps and generating automated clinical reports. Need full source code, trained weights, and 4K demo walkthrough video.',
      budget: '₹25,000 - ₹35,000',
      budgetRange: '₹25,000 - ₹35,000',
      timeline: '2 Weeks (Urgent Capstone)',
      targetDeadline: '2 Weeks (Urgent Capstone)',
      consultationMode: 'WHATSAPP_AND_CALL',
      status: 'ARCHITECT_REVIEW',
      adminNotes: 'Spoke on WhatsApp, reviewing model architecture and dataset specs.',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      _id: 'inq_lead_6a7898325534a577554c695e',
      name: 'Karthik Raja',
      clientName: 'Karthik Raja',
      email: 'karthik.raja.ece@gmail.com',
      clientEmail: 'karthik.raja.ece@gmail.com',
      mobile: '+91 97890 87654',
      clientMobile: '+91 97890 87654',
      dept: 'Electronics & Communication (ECE / IoT)',
      department: 'Electronics & Communication (ECE / IoT)',
      projectTitle: 'Smart Autonomous RFID Shopping Cart with Billing Display',
      description: 'ESP32 microcontroller circuit with RFID reader, barcode scanner, load cell weight theft detection, and cloud payment sync. Require circuit schematic, PCB layout Gerber files, and Arduino C++ firmware.',
      requirements: 'ESP32 microcontroller circuit with RFID reader, barcode scanner, load cell weight theft detection, and cloud payment sync. Require circuit schematic, PCB layout Gerber files, and Arduino C++ firmware.',
      budget: '₹20,000 - ₹30,000',
      budgetRange: '₹20,000 - ₹30,000',
      timeline: '3 Weeks',
      targetDeadline: '3 Weeks',
      consultationMode: 'WHATSAPP_AND_CALL',
      status: 'EMAIL_SENT',
      adminNotes: '',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ];

  return res.status(200).json({
    success: true,
    agencyLeads,
    total: agencyLeads.length,
  });
}
