import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.NEON_S3_REGION || "ap-southeast-1",
  endpoint: process.env.NEON_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.NEON_S3_ACCESS_KEY || "",
    secretAccessKey: process.env.NEON_S3_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

export const BUCKET_NAME = process.env.NEON_S3_BUCKET || "nexfix-media";

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${process.env.NEXT_PUBLIC_S3_URL}/${key}`;
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}
