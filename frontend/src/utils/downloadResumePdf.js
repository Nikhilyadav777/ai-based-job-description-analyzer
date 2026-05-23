import jsPDF from "jspdf";

export function downloadResumePdf({
  resumeText,
  filename = "tailored-resume.pdf",
  title = "Tailored Resume",
}) {
  if (!resumeText) return;

  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const margin = 40;
  const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
  const lineHeight = 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(title, margin, margin);

  doc.setFontSize(11);

  const lines = doc.splitTextToSize(resumeText, maxWidth);
  let cursorY = margin + 24;

  for (const line of lines) {
    if (cursorY > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(line, margin, cursorY);
    cursorY += lineHeight;
  }

  doc.save(filename);
}

