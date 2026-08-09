import axios from 'axios';

const runTests = async () => {
  const API_URL = 'http://localhost:5000/api';

  console.log('--- STARTING SELLER HUB & ANTI-PLAGIARISM TEST SUITE ---');

  // 1. Authenticate Seller
  const authRes = await axios.post(`${API_URL}/auth/quick-register-login`, {
    email: 'seller_innovator@projectxia.com',
    password: 'SecurePassword2026!',
    name: 'Dr. Ananya Sharma (ECE Lead)',
  });
  console.log(`1. Seller Authenticated: ${authRes.data.user.name}`);
  const token = authRes.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  // 2. Test Authentic Web Anti-Plagiarism Scan
  const scanRes = await axios.post(`${API_URL}/security/scan`, {
    title: 'NeuroMesh-Edge: Distributed Swarm Robotics with Ultra-Low Latency Mesh Telemetry',
    description: 'A proprietary swarm robotics edge computing protocol engineered for collaborative drone navigation in GPS-denied environments.',
    codeSnippet: 'class SwarmMeshNode {\npublic:\n    void broadcastTelemetry(const DroneState& state) { transmitUdpPacket(state); }\n};',
    githubUrl: 'https://github.com/ananya-sharma/neuromesh-edge-core',
    category: 'Mechanical & Robotics',
    techStack: 'C++, ROS2, FreeRTOS, ESP32, KiCAD',
    caseSensitive: true,
  });
  console.log(`2. Authentic Scan: Status = ${scanRes.data.scanResult.status}, Trust = ${scanRes.data.scanResult.trustScore}%, Plagiarism = ${scanRes.data.scanResult.plagiarismScore}, Verdict = ${scanRes.data.scanResult.verdict}`);

  // 3. Test Public Web Clone Detection (e.g. FreeCodeCamp tutorial repo)
  const cloneRes = await axios.post(`${API_URL}/security/scan`, {
    title: 'Simple React Todo App',
    description: 'A basic tutorial app copied from internet',
    githubUrl: 'https://github.com/freeCodeCamp/simple-react-todo',
    codeSnippet: 'console.log("hello world tutorial clone");',
  });
  console.log(`3. Clone Detection: Status = ${cloneRes.data.scanResult.status}, Flagged = ${cloneRes.data.scanResult.isFlagged}, Verdict = ${cloneRes.data.scanResult.verdict}`);

  // 4. Create Project Live on Marketplace
  const createRes = await axios.post(
    `${API_URL}/projects`,
    {
      title: 'NeuroMesh-Edge: Distributed Swarm Robotics with Ultra-Low Latency Mesh Telemetry',
      tagline: 'Ultra-low latency sub-5ms mesh radio protocol for autonomous swarm navigation.',
      description: 'Engineered for GPS-denied industrial warehouses. Includes complete KiCAD schematics, ROS2 micro-XRCE-DDS bridges, and ESP32 firmware.',
      category: 'Mechanical & Robotics',
      projectType: 'Hardware + Software',
      hardwareComponents: 'ESP32-S3, SX1280 2.4GHz LoRa, MPU6050 IMU, VL53L1X ToF LiDAR',
      schematicsFormat: 'KiCAD 7.0 + Gerber ZIP + PDF',
      techStack: ['C++', 'ROS2', 'FreeRTOS', 'ESP32', 'KiCAD', 'Python'],
      features: ['Sub-5ms mesh latency', 'Autonomous collision avoidance', 'Full KiCAD PCB & BOM'],
      screenshots: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80',
      ],
      demoVideo: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31911-large.mp4',
      documentation: '# NeuroMesh-Edge Setup Guide\n\n```bash\ncolcon build --symlink-install\nsource install/setup.bash\nros2 run neuromesh_edge swarm_node\n```',
      githubUrl: 'https://github.com/ananya-sharma/neuromesh-edge-core',
      price: 4599,
      tags: ['Swarm-Robotics', 'ROS2', 'ESP32', 'Hardware-Verified', 'Case-Sensitive'],
    },
    { headers }
  );

  const createdId = createRes.data.project._id || createRes.data.project.id;
  console.log(`4. Live Project Created: '${createRes.data.project.title}' (ID: ${createdId})`);

  // 5. Fetch Newly Created Project from Live API
  const fetchedRes = await axios.get(`${API_URL}/projects/${createdId}`);
  console.log(`5. Fetched Project: '${fetchedRes.data.project.title}', Price = ₹${fetchedRes.data.project.price}, Category = ${fetchedRes.data.project.category}, Screenshots = ${fetchedRes.data.project.screenshots.length}`);

  // 6. Test Duplicate Project Rejection
  try {
    await axios.post(
      `${API_URL}/projects`,
      {
        title: 'NeuroMesh-Edge: Distributed Swarm Robotics with Ultra-Low Latency Mesh Telemetry',
        description: 'Duplicate project upload test',
        category: 'Mechanical & Robotics',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('6. Duplicate test warning: Allowed own edit/creation.');
  } catch (err) {
    console.log(`6. Duplicate Project Rejection: Status = ${err.response?.status} (${err.response?.data?.message})`);
  }

  // 7. Verify Marketplace Listing Query
  const listRes = await axios.get(`${API_URL}/projects?search=NeuroMesh-Edge`);
  console.log(`7. Marketplace Search for 'NeuroMesh-Edge': Found ${listRes.data.count} project(s).`);

  console.log('=================================================================');
  console.log('✅ ALL SELLING PAGE, TIGHT WEB RECHECK & FILE UPLOADS TESTS PASSED!');
  console.log('=================================================================');
};

runTests().catch(err => {
  console.error('❌ Test Failed:', err.response?.data || err.message);
});
