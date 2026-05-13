import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { appEnv, hasS3 } from "@/lib/env";

function getS3Client() {
  if (!hasS3()) {
    return null;
  }

  return new S3Client({
    region: appEnv.s3Region,
    endpoint: appEnv.s3Endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: appEnv.s3AccessKeyId!,
      secretAccessKey: appEnv.s3SecretAccessKey!,
    },
  });
}

export async function storePhotoAsset(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());

  if (!hasS3()) {
    return {
      storageMode: "INLINE",
      storageKey: null,
      publicUrl: null,
      dataUrl: `data:${file.type};base64,${bytes.toString("base64")}`,
    };
  }

  const client = getS3Client();

  if (!client) {
    throw new Error("S3 client could not be created.");
  }

  const key = `photo-assets/${randomUUID()}-${file.name}`;
  await client.send(
    new PutObjectCommand({
      Bucket: appEnv.s3BucketName!,
      Key: key,
      Body: bytes,
      ContentType: file.type,
    }),
  );

  const endpoint = appEnv.s3Endpoint!.replace(/\/$/, "");
  return {
    storageMode: "S3",
    storageKey: key,
    publicUrl: `${endpoint}/${appEnv.s3BucketName}/${key}`,
    dataUrl: null,
  };
}
