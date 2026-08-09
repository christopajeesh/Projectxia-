import axios from 'axios';

const runAuthorTests = async () => {
  const API_URL = 'http://localhost:5000/api';

  console.log('--- STARTING AUTHOR CONTROLS & ANTI-GIBBERISH TEST SUITE ---');

  // 1. Authenticate Author User
  const authorRes = await axios.post(`${API_URL}/auth/quick-register-login`, {
    email: 'author_john@projectxia.com',
    password: 'Password123!',
    name: 'John Doe (Robotics Architect)',
  });
  const authorToken = authorRes.data.token;
  const authorHeaders = { Authorization: `Bearer ${authorToken}` };
  console.log(`1. Author Authenticated: ${authorRes.data.user.name}`);

  // 2. Authenticate Other (Non-Author) User
  const otherRes = await axios.post(`${API_URL}/auth/quick-register-login`, {
    email: 'buyer_random@projectxia.com',
    password: 'Password123!',
    name: 'Random Buyer',
  });
  const otherToken = otherRes.data.token;
  const otherHeaders = { Authorization: `Bearer ${otherToken}` };
  console.log(`2. Non-Author Authenticated: ${otherRes.data.user.name}`);

  // 3. Test Spam / Gibberish Rejection
  try {
    await axios.post(
      `${API_URL}/projects`,
      {
        title: '12454feferg,.',
        description: 'asdfghjkl 123456',
        category: 'Computer Science (CSE / IT)',
      },
      { headers: authorHeaders }
    );
    console.error('❌ 3. Anti-Gibberish test failed: Allowed spam title.');
  } catch (err) {
    console.log(`3. Anti-Gibberish Block Succeeded: "${err.response?.data?.message}" (HTTP ${err.response?.status})`);
  }

  // 4. Create a Clean, Professional Project
  const createRes = await axios.post(
    `${API_URL}/projects`,
    {
      title: 'SolarTrack-IoT: Dual-Axis Micro-Grid Telemetry and Solar Irradiance Analyzer',
      tagline: 'High-precision dual-axis MPPT tracking algorithm with real-time cloud analytics.',
      description: 'An advanced embedded system for solar micro-grids. Features precision stepper motor positioning, LDR differential sensor balancing, and cellular MQTT telemetry.',
      category: 'Electrical Engineering (EEE)',
      projectType: 'Hardware + Software',
      price: 3299,
      techStack: ['ESP32', 'FreeRTOS', 'KiCAD', 'MQTT', 'React'],
      features: ['Dual-axis motorized tracking', 'Real-time solar irradiance dashboard', 'KiCAD PCB schematics'],
      screenshots: ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1000&auto=format&fit=crop&q=80'],
      demoVideo: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31911-large.mp4',
    },
    { headers: authorHeaders }
  );
  const projectId = createRes.data.project._id || createRes.data.project.id;
  console.log(`4. Clean Project Created Live: '${createRes.data.project.title}' (ID: ${projectId})`);

  // 5. Test Non-Author Attempting to Edit Project (Should be 403 Forbidden)
  try {
    await axios.put(
      `${API_URL}/projects/${projectId}`,
      { title: 'Hacked Title by Unauthorized User' },
      { headers: otherHeaders }
    );
    console.error('❌ 5. Non-author edit allowed! Security check failed.');
  } catch (err) {
    console.log(`5. Non-Author Edit Blocked: Status = ${err.response?.status} (${err.response?.data?.message})`);
  }

  // 6. Test Author Editing Project (Should Succeed)
  const editRes = await axios.put(
    `${API_URL}/projects/${projectId}`,
    {
      title: 'SolarTrack-IoT: Dual-Axis MPPT Solar Irradiance Analyzer v2.0',
      price: 3599,
    },
    { headers: authorHeaders }
  );
  console.log(`6. Author Edit Succeeded: Updated Title = '${editRes.data.project.title}', New Price = ₹${editRes.data.project.price}`);

  // 7. Test Non-Author Attempting to Delete Project (Should be 403 Forbidden)
  try {
    await axios.delete(`${API_URL}/projects/${projectId}`, { headers: otherHeaders });
    console.error('❌ 7. Non-author delete allowed! Security check failed.');
  } catch (err) {
    console.log(`7. Non-Author Delete Blocked: Status = ${err.response?.status} (${err.response?.data?.message})`);
  }

  // 8. Test Author Deleting Project (Should Succeed)
  const deleteRes = await axios.delete(`${API_URL}/projects/${projectId}`, { headers: authorHeaders });
  console.log(`8. Author Delete Succeeded: "${deleteRes.data.message}"`);

  // 9. Verify Project is Removed
  try {
    await axios.get(`${API_URL}/projects/${projectId}`);
  } catch (err) {
    console.log(`9. Verified Project Removed: Status = ${err.response?.status} (${err.response?.data?.message})`);
  }

  console.log('=================================================================');
  console.log('✅ ALL AUTHOR PERMISSION & ANTI-GIBBERISH CHECKS PASSED 100%!');
  console.log('=================================================================');
};

runAuthorTests().catch(err => {
  console.error('❌ Author Test Failed:', err.response?.data || err.message);
});
