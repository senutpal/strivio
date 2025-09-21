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
            html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
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
