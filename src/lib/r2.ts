import { DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  endpoint: string;
  publicBaseUrl: string;
  maxFileSizeBytes: number;
};

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

const normalizePublicBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

const getR2Config = (): R2Config => {
  const accountId = process.env.R2_ACCOUNT_ID?.trim() ?? "";
  const accessKeyId =
    process.env.R2_ACCESS_KEY_ID?.trim() ?? process.env.AWS_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY?.trim() ?? process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucket = process.env.R2_BUCKET?.trim() ?? "";
  const region = process.env.R2_REGION?.trim() || "auto";
  const endpoint =
    process.env.R2_ENDPOINT?.trim() || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");
  const publicBaseUrl = normalizePublicBaseUrl(process.env.R2_PUBLIC_BASE_URL?.trim() ?? "");
  const maxFileSizeBytes = parsePositiveInt(process.env.R2_MAX_FILE_SIZE_BYTES, 8 * 1024 * 1024);

  const missing: string[] = [];

  if (!accountId && !process.env.R2_ENDPOINT?.trim()) {
    missing.push("R2_ACCOUNT_ID hoặc R2_ENDPOINT");
  }
  if (!accessKeyId) {
    missing.push("R2_ACCESS_KEY_ID");
  }
  if (!secretAccessKey) {
    missing.push("R2_SECRET_ACCESS_KEY");
  }
  if (!bucket) {
    missing.push("R2_BUCKET");
  }
  if (!publicBaseUrl) {
    missing.push("R2_PUBLIC_BASE_URL");
  }

  if (missing.length > 0) {
    throw new Error(`Thiếu biến môi trường R2: ${missing.join(", ")}`);
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    region,
    endpoint,
    publicBaseUrl,
    maxFileSizeBytes,
  };
};

type GlobalWithR2Client = typeof globalThis & {
  __r2Client?: S3Client;
};

const getR2Client = () => {
  const globalWithR2Client = globalThis as GlobalWithR2Client;
  const config = getR2Config();

  if (!globalWithR2Client.__r2Client) {
    globalWithR2Client.__r2Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return globalWithR2Client.__r2Client;
};

const sanitizeFileName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const sanitizeFolder = (value: string | null | undefined) => {
  if (!value) {
    return "uploads";
  }

  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");

  return cleaned || "uploads";
};

const extFromFileName = (fileName: string) => {
  const match = fileName.toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : "";
};

const extFromMimeType = (mimeType: string) => {
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  if (mimeType === "image/avif") return ".avif";
  if (mimeType === "image/svg+xml") return ".svg";
  return "";
};

export const r2AllowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

type UploadImageParams = {
  file: File;
  folder?: string | null;
};

export const uploadImageToR2 = async ({ file, folder }: UploadImageParams) => {
  const config = getR2Config();
  const client = getR2Client();

  if (!r2AllowedMimeTypes.has(file.type)) {
    throw new Error("Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận JPG, PNG, WEBP, GIF, AVIF, SVG.");
  }

  if (file.size <= 0) {
    throw new Error("File ảnh rỗng.");
  }

  if (file.size > config.maxFileSizeBytes) {
    throw new Error(
      `Ảnh quá lớn. Kích thước tối đa là ${(config.maxFileSizeBytes / (1024 * 1024)).toFixed(1)}MB.`
    );
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const originalName = sanitizeFileName(file.name || "image");
  const originalWithoutExt = originalName.replace(/\.[^.]+$/, "") || "image";
  const extension = extFromFileName(originalName) || extFromMimeType(file.type) || ".jpg";
  const key = `${sanitizeFolder(folder)}/${yyyy}/${mm}/${dd}/${Date.now()}-${randomUUID()}-${originalWithoutExt}${extension}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return {
    key,
    url: `${config.publicBaseUrl}/${key}`,
    size: file.size,
    contentType: file.type,
  };
};

export const getR2PublicBaseUrl = () => getR2Config().publicBaseUrl;

const toR2KeyFromUrl = (url: string, publicBaseUrl: string) => {
  const cleaned = url.trim();
  if (!cleaned) {
    return null;
  }

  try {
    const parsedUrl = new URL(cleaned);
    const parsedBaseUrl = new URL(publicBaseUrl);

    if (parsedUrl.origin !== parsedBaseUrl.origin) {
      return null;
    }

    const basePath = parsedBaseUrl.pathname.replace(/\/+$/, "");
    const urlPath = parsedUrl.pathname.replace(/\/+$/, "");
    if (!urlPath.startsWith(`${basePath}/`)) {
      return null;
    }

    const key = decodeURIComponent(urlPath.slice(basePath.length + 1));
    return key || null;
  } catch {
    return null;
  }
};

const chunkKeys = (keys: string[], size: number) => {
  const chunks: string[][] = [];
  for (let index = 0; index < keys.length; index += size) {
    chunks.push(keys.slice(index, index + size));
  }
  return chunks;
};

export type DeleteR2ImagesResult = {
  requestedUrls: number;
  validR2Keys: number;
  skippedUrls: number;
  deletedKeys: number;
  failedKeys: number;
};

export const deleteImagesFromR2ByUrls = async (urls: string[]): Promise<DeleteR2ImagesResult> => {
  const uniqueUrls = Array.from(
    new Set(
      urls
        .map((url) => url.trim())
        .filter(Boolean)
    )
  );

  if (uniqueUrls.length === 0) {
    return {
      requestedUrls: 0,
      validR2Keys: 0,
      skippedUrls: 0,
      deletedKeys: 0,
      failedKeys: 0,
    };
  }

  const config = getR2Config();
  const client = getR2Client();
  const uniqueKeys = Array.from(
    new Set(
      uniqueUrls
        .map((url) => toR2KeyFromUrl(url, config.publicBaseUrl))
        .filter((key): key is string => Boolean(key))
    )
  );

  if (uniqueKeys.length === 0) {
    return {
      requestedUrls: uniqueUrls.length,
      validR2Keys: 0,
      skippedUrls: uniqueUrls.length,
      deletedKeys: 0,
      failedKeys: 0,
    };
  }

  let deletedKeys = 0;
  let failedKeys = 0;

  for (const keyChunk of chunkKeys(uniqueKeys, 1000)) {
    const result = await client.send(
      new DeleteObjectsCommand({
        Bucket: config.bucket,
        Delete: {
          Objects: keyChunk.map((key) => ({ Key: key })),
          Quiet: true,
        },
      })
    );

    deletedKeys += result.Deleted?.length ?? 0;
    failedKeys += result.Errors?.length ?? 0;
  }

  return {
    requestedUrls: uniqueUrls.length,
    validR2Keys: uniqueKeys.length,
    skippedUrls: Math.max(0, uniqueUrls.length - uniqueKeys.length),
    deletedKeys,
    failedKeys,
  };
};
