"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ImageDropzoneProps = {
  onChange?: (file: File | null) => void;
  defaultImage?: string; // untuk edit mode
  externalPreview?: string | null; // controlled preview (e.g., from global state)
  maxSizeMB?: number;
  accept?: string[];
  className?: string;
  text?: string;
  priority?: boolean;
};

export function ImageDropzone({
  onChange,
  defaultImage,
  externalPreview,
  maxSizeMB = 4,
  accept = ["image/png", "image/jpeg", "image/jpg"],
  className,
  text,
  priority,
}: ImageDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(defaultImage ?? null);
  // Track whether the current preview URL is created internally (owned) or provided externally
  const ownedPreviewRef = useRef<boolean>(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setPreview(url);
        ownedPreviewRef.current = true;
        onChange?.(file);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
      maxSize: maxSizeMB * 1024 * 1024,
      multiple: false,
    });

  useEffect(() => {
    if (externalPreview) {
      setPreview(externalPreview);
      ownedPreviewRef.current = false;
    }
  }, [externalPreview]);

  useEffect(() => {
    return () => {
      // Revoke only URLs we created locally via onDrop to avoid revoking
      // externally managed object URLs passed from parent components
      if (ownedPreviewRef.current && preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col hover:bg-slate-100 hover:dark:bg-slate-900 items-center justify-center border border-dashed rounded-md overflow-hidden cursor-pointer transition",
        isDragActive ? "border-cyan-400 bg-cyan-50" : "border-gray-300",
        className
      )}
    >
      <input {...getInputProps()} />
      {preview ? (
        <Image
          src={preview}
          alt="Preview"
          width={200}
          height={200}
          className="object-contain w-full h-full"
          priority={priority}
        />
      ) : (
        <div className="text-center text-sm text-gray-500">
          <p>{text ?? "Drag & drop image here, or click to select"}</p>
          <p className="text-xs mt-1 text-gray-400">
            Accepted: {accept.join(", ")}
          </p>
          <p className="text-xs">Max size: {maxSizeMB}MB</p>
        </div>
      )}
      {fileRejections.length > 0 && (
        <p className="text-sm text-red-500 mt-2">
          {fileRejections[0].errors[0].message}
        </p>
      )}
    </div>
  );
}
