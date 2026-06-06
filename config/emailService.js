// EmailJS REST API — called from backend using private access token
// Docs: https://www.emailjs.com/docs/rest-api/send/

const EMAILJS_SERVICE_ID  = "service_vmi10lq";
const EMAILJS_TEMPLATE_ID = "template_m9h77ka";
const EMAILJS_PUBLIC_KEY  = "A7HDVYT5yQDUUDt-k";
const EMAILJS_ACCESS_TOKEN = "QAVjYoiOycPIddrkhIuSV";

/**
 * Send OTP email via EmailJS REST API.
 * Template variables used: {{to_name}}, {{to_email}}, {{otp}}
 */
export const sendOtpEmail = async (toEmail, toName, otp) => {
    const payload = {
        service_id:   EMAILJS_SERVICE_ID,
        template_id:  EMAILJS_TEMPLATE_ID,
        user_id:      EMAILJS_PUBLIC_KEY,
        accessToken:  EMAILJS_ACCESS_TOKEN,
        template_params: {
            to_name:  toName  || "User",
            to_email: toEmail,
            otp:      otp,
        },
    };

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`EmailJS error ${response.status}: ${text}`);
    }

    console.log(`✅ OTP email sent to ${toEmail}`);
    return true;
};

// Keep old exports as no-ops so nothing else breaks
export const sendVerificationEmail = async () => {};
export const send2FAEmail = async () => {};
