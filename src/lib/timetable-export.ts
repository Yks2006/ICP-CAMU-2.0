export type ScheduleFormat = "pdf" | "png" | "jpg";

const CAPTURE_OPTIONS = {
  scale: 2,
  backgroundColor: "#f9f9ff",
  onCloneEachNode: (cloned: Node) => {
    if (!(cloned instanceof HTMLElement)) {
      return;
    }

    if (!cloned.hasAttribute("data-timetable-scroll")) {
      return;
    }

    cloned.style.maxHeight = "none";
    cloned.style.overflow = "visible";
    cloned.style.height = "auto";
  },
} as const;

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadTimetableSchedule(
  element: HTMLElement,
  format: ScheduleFormat,
  filename = "weekly-timetable",
) {
  const { domToBlob, domToCanvas } = await import("modern-screenshot");

  if (format === "pdf") {
    const canvas = await domToCanvas(element, CAPTURE_OPTIONS);
    const { jsPDF } = await import("jspdf");
    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const widthRatio = pageWidth / canvas.width;
    const heightRatio = pageHeight / canvas.height;
    const ratio = Math.min(widthRatio, heightRatio);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(imageData, "PNG", x, y, imgWidth, imgHeight);
    triggerBrowserDownload(pdf.output("blob"), `${filename}.pdf`);
    return;
  }

  const blob = await domToBlob(element, {
    ...CAPTURE_OPTIONS,
    type: format === "png" ? "image/png" : "image/jpeg",
    quality: format === "jpg" ? 0.92 : undefined,
  });

  triggerBrowserDownload(blob, `${filename}.${format}`);
}
