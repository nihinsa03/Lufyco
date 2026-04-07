const nodemailer = require('nodemailer');

// Generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send verification email with OTP
const sendVerificationEmail = async (email, otp) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Fashion - Lufyco Clothing" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Email Verification - Lufyco Clothing',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .otp-box {
                            background-color: #f8f9fa;
                            border: 2px dashed #667eea;
                            border-radius: 10px;
                            padding: 20px;
                            margin: 30px 0;
                            display: inline-block;
                        }
                        .otp {
                            font-size: 36px;
                            font-weight: bold;
                            color: #667eea;
                            letter-spacing: 8px;
                        }
                        .message {
                            color: #555;
                            line-height: 1.6;
                            margin: 20px 0;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            color: #888;
                            font-size: 12px;
                        }
                        .warning {
                            color: #e74c3c;
                            font-size: 14px;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✨ Fashion</h1>
                            <p>Lufyco Clothing</p>
                        </div>
                        <div class="content">
                            <h2>Email Verification</h2>
                            <p class="message">
                                Thank you for signing up! Please use the verification code below to complete your registration:
                            </p>
                            <div class="otp-box">
                                <div class="otp">${otp}</div>
                            </div>
                            <p class="message">
                                This code will expire in <strong>10 minutes</strong>.
                            </p>
                            <p class="warning">
                                ⚠️ If you didn't request this code, please ignore this email.
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2026 Lufyco Clothing. All rights reserved.</p>
                            <p>This is an automated email, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

module.exports = {
    generateOTP,
    sendVerificationEmail
};
