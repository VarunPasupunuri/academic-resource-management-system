import type { Resource } from "../types";

/**
 * Generates sample content for a resource and triggers a browser download.
 */
export function downloadResource(
  resource: Resource,
  e?: React.MouseEvent,
): void {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  // For video files, show an alert since we can't generate binary media
  if (resource.type === "video") {
    alert(
      `"${resource.title}" is a video resource (${resource.size}). In a live version, this would stream or download the actual video file.`,
    );
    return;
  }

  const safeName = resource.title
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  // Use .txt so the browser doesn't block the download due to MIME mismatch
  const filename = `${safeName}.txt`;

  const content = [
    "========================================",
    `  ${resource.title}`,
    "========================================",
    "",
    `Subject:     ${resource.subject}`,
    `Type:        ${resource.type.toUpperCase()}`,
    `File Size:   ${resource.size}`,
    `Uploaded:    ${resource.uploadedAt}`,
    "",
    "DESCRIPTION",
    "-----------",
    resource.description,
    "",
    "CONTENT PREVIEW",
    "---------------",
    "This is a sample/demo version of the resource.",
    "In a production environment, the actual file content would be",
    "served from the backend storage system.",
    "",
    `Topics covered in "${resource.title}":`,
    "",
    `  1. Introduction to ${resource.subject} concepts`,
    "  2. Core principles and foundational theory",
    "  3. Practical applications and examples",
    "  4. Problem-solving techniques",
    "  5. Summary and key takeaways",
    "",
    "========================================",
    "  Academic Resource Management System",
    `  Generated: ${new Date().toLocaleString()}`,
    "========================================",
  ].join("\n");

  try {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch {
    alert(`Could not download "${resource.title}". Please try again.`);
  }
}
