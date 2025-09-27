"use client";

import React, { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { RenderEmptyState } from "./RenderState";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface UploaderState {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  fileType: "image" | "video";
}

export function Uploader() {
  const [files, setFiles] = useState<UploaderState>({
    id: null,
    error: false,
    file: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: "image",
  });

  async function uploadFile(file: File) {
    setFiles((prev) => ({
      ...prev,
      uploading: true,
      progress: 0,
    }));

    try {
      const preSignedResponse = await fetch("/api/s3/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contenType: file.type,
          size: file.size,
          isImage: true,
        }),
      });

      if (!preSignedResponse.ok) {
        toast.error("Failed to get presigned URL ");
        setFiles((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: true,
        }));
        return;
      }

      const { preSignedUrl, key } = await preSignedResponse.json();

      // await new Promise((resolve, reject) => {
      //   const xhr = new XMLHttpRequest();
      //   xhr.upload.onprogress = (event) => {
      //     if (event.lengthComputable) {
      //       const percentageCompleted = (event.loaded / event.total) * 100;
      //       setFiles((prev) => ({
      //         ...prev,
      //         progress: Math.round(percentageCompleted),
      //       }));
      //     }
      //   };

        
      // });
    } catch (error) {}
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFiles({
        id: uuidv4(),
        error: false,
        file: file,
        uploading: false,
        progress: 0,
        isDeleting: false,
        fileType: "image",
        objectUrl: URL.createObjectURL(file),
      });
    }
  }, []);

  function rejectedFiles(fileRejection: FileRejection[]) {
    if (fileRejection.length) {
      const tooManyFiles = fileRejection.find((rejection) => {
        rejection.errors[0].code === "too-many-files";
      });

      const fileSizeTooBig = fileRejection.find((rejection) => {
        rejection.errors[0].code === " file-too-large";
      });

      if (fileSizeTooBig) {
        toast.error("File size exceeds the maximum limit");
      }
      if (tooManyFiles) {
        toast.error("Too many files selected, max is 1 ");
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    onDropRejected: rejectedFiles,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64",
        isDragActive
          ? "border-primary bg-primary/10 border-solid "
          : "border-border hover:border-primary"
      )}
    >
      <CardContent className="flex items-center justify-center h-full w-full p-4 text-muted-foreground">
        <input {...getInputProps()} />
        <RenderEmptyState isDragActive={isDragActive} />
      </CardContent>
    </Card>
  );
}
