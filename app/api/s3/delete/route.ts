import { requireAdmin } from "@/app/data/admin/require-admin";
import { env } from "@/lib/env";
import { S3 } from "@/lib/S3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  await requireAdmin();
  try {
    const body = await request.json().catch(() => null);
    const key = body?.key as string | undefined;

    if (!key) {
      return NextResponse.json(
        { error: "Missing or invalid object key" },
        { status: 400 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: key,
    });
    await S3.send(command);

    return NextResponse.json(
      { ok: true, message: "File deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("S3 delete error", err);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
