import { env } from "@/lib/env";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { S3 } from "@/lib/S3Client";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requireAdmin } from "@/app/data/admin/require-admin";

export const fileUploadSchema = z.object({
  filename: z.string().min(1, { message: "Filename is required" }),
  contentType: z.string().min(1, { message: "Content type is required" }),
  size: z.number().min(1, { message: "Size is required" }),
  isImage: z.boolean(),
});

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    })
  );

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  try {
    const decision = await aj.protect(req, {
      fingerprint: session?.user.id as string,
    });

    if (decision.isDenied()) {
      return NextResponse.json(
        {
          error: "Try again after some time ",
        },
        {
          status: 429,
        }
      );
    }
    const body = await req.json();
    const validation = fileUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Missing fileName or fileType" },
        { status: 400 }
      );
    }

    const { filename, contentType, size } = validation.data;
    const uniqueKey = `${uuidv4()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
      ContentType: contentType,
      ContentLength: size,
      Key: uniqueKey,
    });

    const preSignedUrl = await getSignedUrl(S3, command, {
      expiresIn: 360,
    });

    const response = {
      preSignedUrl,
      key: uniqueKey,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      {
        error: "Failed to generate presigne URL",
      },
      { status: 500 }
    );
  }
}
