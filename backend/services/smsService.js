import twilio from 'twilio';

// Initialize Twilio client if credentials are configured
const createTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken || accountSid.startsWith('your_')) {
    return null; // Fallback to development simulator
  }

  try {
    return twilio(accountSid, authToken);
  } catch (err) {
    console.error('[ProjectXia Twilio Init Error]:', err.message);
    return null;
  }
};

/**
 * Send SMS OTP to Mobile Phone with Country Code
 */
export const sendOtpSms = async ({ to, otp }) => {
  try {
    const client = createTwilioClient();
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    const messageBody = `[ProjectXia Security] Your verification OTP code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

    if (!client || !fromNumber) {
      console.log(`[ProjectXia SMS Service - DEV SIMULATOR] To: ${to} | Code: ${otp}`);
      return { success: true, mode: 'DEV_SIMULATOR', otp };
    }

    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to,
    });

    return { success: true, sid: message.sid, otp };
  } catch (error) {
    console.error('[ProjectXia Twilio SMS Error]:', error.message);
    return { success: false, error: error.message };
  }
};
