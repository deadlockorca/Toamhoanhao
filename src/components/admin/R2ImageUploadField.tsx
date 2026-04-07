"use client";

import { useState } from "react";

type UploadResponse = {
  key?: string;
  url?: string;
  error?: string;
};

type Props = {
  value: string;
  folder: string;
  onUploaded: (url: string) => void;
};

const parseErrorMessage = (responseBody: unknown, fallback: string) => {
  if (!responseBody || typeof responseBody !== "object" || Array.isArray(responseBody)) {
    return fallback;
  }

  const body = responseBody as { error?: unknown };
  if (typeof body.error === "string" && body.error.trim()) {
    return body.error;
  }

  return fallback;
};

export default function R2ImageUploadField({ value, folder, onUploaded }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Bạn chưa chọn file ảnh.");
      setMessage(null);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", folder);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as UploadResponse;
      if (!response.ok || !payload.url) {
        throw new Error(parseErrorMessage(payload, "Upload ảnh thất bại."));
      }

      onUploaded(payload.url);
      setMessage("Đã upload ảnh lên R2 thành công.");
      setSelectedFile(null);
      setInputKey((prev) => prev + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload ảnh thất bại.";
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-2 rounded-lg border border-dashed border-[#d8dbe2] bg-[#fafbfc] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          key={inputKey}
          type="file"
          accept="image/*"
          onChange={(event) => {
            setSelectedFile(event.target.files?.[0] ?? null);
            setErrorMessage(null);
            setMessage(null);
          }}
          className="max-w-full text-[12px] text-[#3a4250] file:mr-2 file:rounded-md file:border file:border-[#cfd3da] file:bg-white file:px-2 file:py-1 file:text-[12px] file:text-[#2f3642] file:hover:bg-[#f3f4f7]"
        />
        <button
          type="button"
          onClick={() => {
            void handleUpload();
          }}
          disabled={isUploading}
          className="rounded-md border border-[#cfd3da] bg-white px-3 py-1.5 text-[12px] font-medium text-[#2f3642] transition hover:bg-[#f3f4f7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? "Đang upload..." : "Upload lên R2"}
        </button>
      </div>

      <p className="mt-2 text-[11px] text-[#6a7280]">
        Thư mục: <span className="font-medium text-[#3a4250]">{folder}</span>
      </p>

      {value ? (
        <p className="mt-1 break-all text-[11px] text-[#6a7280]">
          URL hiện tại:{" "}
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[#2a4ea3] hover:underline"
          >
            {value}
          </a>
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-2 text-[12px] text-[#b03131]">{errorMessage}</p>
      ) : null}
      {message ? <p className="mt-2 text-[12px] text-[#1f7a42]">{message}</p> : null}
    </div>
  );
}

