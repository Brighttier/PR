/**
 * Firebase Storage Service
 * Handles file uploads for interviews, resumes, and other media
 */

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../frontend/src/lib/firebase";

/**
 * Upload interview recording to Firebase Storage
 * @param interviewId - Unique interview ID
 * @param recordingBlob - Video/audio blob
 * @param fileName - File name (e.g., "recording.webm")
 * @returns Download URL
 */
export async function uploadInterviewRecording(
  interviewId: string,
  recordingBlob: Blob,
  fileName: string = "recording.webm"
): Promise<string> {
  try {
    console.log(`[Storage] Uploading recording for interview: ${interviewId}`);

    // Create storage reference
    const storageRef = ref(storage, `interviews/${interviewId}/${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, recordingBlob, {
      contentType: recordingBlob.type || "video/webm",
    });

    console.log(`[Storage] Upload complete for interview: ${interviewId}`);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error(`[Storage] Error uploading recording:`, error);
    throw new Error("Failed to upload recording");
  }
}

/**
 * Upload resume to Firebase Storage
 * @param companyId - Company ID
 * @param candidateId - Candidate user ID
 * @param resumeFile - Resume file (PDF, DOC, DOCX)
 * @returns Download URL
 */
export async function uploadResume(
  companyId: string,
  candidateId: string,
  resumeFile: File
): Promise<string> {
  try {
    console.log(`[Storage] Uploading resume for candidate: ${candidateId}`);

    // Generate unique file name with timestamp
    const timestamp = Date.now();
    const extension = resumeFile.name.split(".").pop();
    const fileName = `resume_${timestamp}.${extension}`;

    // Create storage reference
    const storageRef = ref(storage, `resumes/${companyId}/${candidateId}/${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, resumeFile, {
      contentType: resumeFile.type,
    });

    console.log(`[Storage] Resume uploaded successfully for candidate: ${candidateId}`);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error(`[Storage] Error uploading resume:`, error);
    throw new Error("Failed to upload resume");
  }
}

/**
 * Upload company logo to Firebase Storage
 * @param companyId - Company ID
 * @param logoFile - Logo image file (PNG, JPG, SVG)
 * @returns Download URL
 */
export async function uploadCompanyLogo(
  companyId: string,
  logoFile: File
): Promise<string> {
  try {
    console.log(`[Storage] Uploading logo for company: ${companyId}`);

    // Create storage reference (fixed path for company logo)
    const storageRef = ref(storage, `companies/${companyId}/logo`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, logoFile, {
      contentType: logoFile.type,
    });

    console.log(`[Storage] Logo uploaded successfully for company: ${companyId}`);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error(`[Storage] Error uploading logo:`, error);
    throw new Error("Failed to upload logo");
  }
}

/**
 * Upload profile photo to Firebase Storage
 * @param userId - User ID
 * @param photoFile - Photo file (PNG, JPG)
 * @returns Download URL
 */
export async function uploadProfilePhoto(
  userId: string,
  photoFile: File
): Promise<string> {
  try {
    console.log(`[Storage] Uploading profile photo for user: ${userId}`);

    // Generate unique file name
    const timestamp = Date.now();
    const extension = photoFile.name.split(".").pop();
    const fileName = `photo_${timestamp}.${extension}`;

    // Create storage reference
    const storageRef = ref(storage, `profile-photos/${userId}/${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, photoFile, {
      contentType: photoFile.type,
    });

    console.log(`[Storage] Profile photo uploaded successfully for user: ${userId}`);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error(`[Storage] Error uploading profile photo:`, error);
    throw new Error("Failed to upload profile photo");
  }
}

/**
 * Delete file from Firebase Storage
 * @param filePath - Full path to file (e.g., "interviews/INT-2025-0001/recording.webm")
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    console.log(`[Storage] Deleting file: ${filePath}`);

    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);

    console.log(`[Storage] File deleted successfully: ${filePath}`);
  } catch (error) {
    console.error(`[Storage] Error deleting file:`, error);
    throw new Error("Failed to delete file");
  }
}

/**
 * Get download URL for a file
 * @param filePath - Full path to file
 * @returns Download URL
 */
export async function getFileURL(filePath: string): Promise<string> {
  try {
    const storageRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error(`[Storage] Error getting file URL:`, error);
    throw new Error("Failed to get file URL");
  }
}

/**
 * Helper: Convert Blob to File
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}

/**
 * Helper: Validate file size (max 100MB)
 */
export function validateFileSize(file: File, maxSizeMB: number = 100): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }
  return true;
}

/**
 * Helper: Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
  }
  return true;
}
