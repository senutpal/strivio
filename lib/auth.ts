export const runtime = "nodejs";

import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { resend } from "./resend";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        try {
          const { data, error } = await resend.emails.send({
            from: "Strivio <onboarding@resend.dev>",
            to: [email],
            subject: "Strivio Verification Email",
            html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Your Strivio Verification Code</h2>
              <p>Enter this code to complete your sign-in:</p>
              <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
              <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
            </div>
          `,
          });

          if (error) {
            console.error("Error sending OTP:", error);
          } else {
            console.log("OTP sent successfully to", email);
          }
        } catch (err) {
          console.error("Unexpected error sending OTP:", err);
        }
      },
    }),
  ],
});
