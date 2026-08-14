import { jsPDF } from "jspdf";

export default function exportReport(caseData) {

  const doc = new jsPDF();
  const analysis = caseData.analysis;

  if (!analysis) {
    alert("Generate AI Analysis before exporting the report.");
    return;
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let y = 20;

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  function checkPage(neededSpace = 20) {
    if (y + neededSpace > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  }

  function sectionTitle(title) {
    checkPage(25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(title, margin, y);

    y += 3;

    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    y += 9;
  }

  function paragraph(text, fontSize = 10.5) {
    if (!text) return;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);

    const lines = doc.splitTextToSize(
      String(text),
      contentWidth
    );

    checkPage(lines.length * 5 + 5);

    doc.text(lines, margin, y);

    y += lines.length * 5 + 8;
  }

  function bullet(text) {
    if (!text) return;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);

    const lines = doc.splitTextToSize(
      `• ${String(text)}`,
      contentWidth - 5
    );

    checkPage(lines.length * 5 + 4);

    doc.text(lines, margin + 2, y);

    y += lines.length * 5 + 4;
  }

  function labelValue(label, value) {
    checkPage(10);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`${label}:`, margin, y);

    doc.setFont("helvetica", "normal");
    doc.text(String(value ?? "N/A"), margin + 28, y);

    y += 7;
  }

  // ─────────────────────────────────────────────
  // Header
  // ─────────────────────────────────────────────

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("CaseFlow", margin, y);

  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("AI Investigation Report", margin, y);

  y += 12;

  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);

  y += 12;

  // ─────────────────────────────────────────────
  // Case Information
  // ─────────────────────────────────────────────

  sectionTitle("Case Information");

  labelValue("Case", caseData.title);
  labelValue("Status", caseData.status);
  labelValue(
    "Created",
    new Date(caseData.createdAt).toLocaleDateString()
  );
  labelValue(
    "Generated",
    new Date().toLocaleString()
  );

  y += 5;

  // ─────────────────────────────────────────────
  // Executive Summary
  // ─────────────────────────────────────────────

  sectionTitle("Executive Summary");

  paragraph(analysis.executiveSummary);

  // ─────────────────────────────────────────────
  // Risk Assessment
  // ─────────────────────────────────────────────

  if (analysis.riskAssessment) {
    sectionTitle("Case Risk Assessment");

    const risk = analysis.riskAssessment;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text(
      `${risk.score ?? "N/A"}%`,
      margin,
      y
    );

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Risk Level: ${risk.level ?? "Unknown"}`,
      margin + 35,
      y
    );

    y += 10;

    if (risk.factors?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("Risk Factors", margin, y);

      y += 7;

      risk.factors.forEach((factor) => {
        bullet(factor);
      });
    }

    y += 4;
  }

  // ─────────────────────────────────────────────
  // Witness Analysis
  // ─────────────────────────────────────────────

  if (analysis.witnessAnalysis?.length) {
    sectionTitle("Witness Analysis");

    analysis.witnessAnalysis.forEach((witness) => {
      checkPage(35);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      const witnessLine = `${witness.name ?? "Unknown Witness"} — ${
        witness.credibility ?? "Unknown"
      }`;

      const witnessLines = doc.splitTextToSize(witnessLine, contentWidth);

      doc.text(witnessLines, margin, y);

      y += witnessLines.length * 6 + 1;

      if (witness.strengths?.length) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);

        doc.text("Strengths", margin, y);
        y += 6;

        witness.strengths.forEach((item) => bullet(item));
      }

      if (witness.concerns?.length) {
        doc.setFont("helvetica", "bold");
        doc.text("Concerns", margin, y);
        y += 6;

        witness.concerns.forEach((item) => bullet(item));
      }

      if (witness.followUp?.length) {
        doc.setFont("helvetica", "bold");
        doc.text("Recommended Follow-Up", margin, y);
        y += 6;

        witness.followUp.forEach((item) => bullet(item));
      }

      y += 5;
    });
  }

  // ─────────────────────────────────────────────
  // Entity Intelligence
  // ─────────────────────────────────────────────

  if (analysis.entities) {
    sectionTitle("Entity Intelligence");

    const entities = analysis.entities;

    if (entities.people?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("People", margin, y);
      y += 7;

      entities.people.forEach((person) => {
        const name =
          typeof person === "object"
            ? `${person.name} ${
                person.role ? `(${person.role})` : ""
              }`
            : person;

        bullet(name);
      });

      y += 2;
    }

    if (entities.objects?.length) {
      doc.setFont("helvetica", "bold");
      doc.text("Objects", margin, y);
      y += 7;

      entities.objects.forEach((item) => {
        bullet(
          typeof item === "object"
            ? item.name
            : item
        );
      });

      y += 2;
    }

    if (entities.locations?.length) {
      doc.setFont("helvetica", "bold");
      doc.text("Locations", margin, y);
      y += 7;

      entities.locations.forEach((item) => {
        bullet(
          typeof item === "object"
            ? item.name
            : item
        );
      });

      y += 2;
    }

    if (entities.organizations?.length) {
      doc.setFont("helvetica", "bold");
      doc.text("Organizations", margin, y);
      y += 7;

      entities.organizations.forEach((item) => {
        bullet(
          typeof item === "object"
            ? item.name
            : item
        );
      });
    }
  }

  // ─────────────────────────────────────────────
  // Investigation Connections
  // ─────────────────────────────────────────────

  if (analysis.relationships?.length) {
    sectionTitle("Investigation Connections");

    analysis.relationships.forEach((relation) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);

      // "->" instead of the Unicode arrow "→": jsPDF's default font only
      // supports a limited character set (similar to Windows-1252) and
      // silently renders unsupported glyphs as garbage characters instead
      // of erroring -- that's what was showing up as "!'" in the exported
      // PDF. Plain ASCII always renders correctly in any font.
      const relationLine = `${relation.source}  ->  ${relation.relationship}  ->  ${relation.target}`;

      // Every other section in this file wraps long text with
      // splitTextToSize before rendering it -- this one didn't, which is
      // why long entity/relationship names were running off the page
      // edge instead of wrapping to a new line.
      const lines = doc.splitTextToSize(relationLine, contentWidth);

      checkPage(lines.length * 5 + 10);

      doc.text(lines, margin, y);

      y += lines.length * 5 + 3;

      if (relation.context) {
        paragraph(relation.context, 10);
      }

      y += 3;
    });
  }

  // ─────────────────────────────────────────────
  // Timeline
  // ─────────────────────────────────────────────

  if (analysis.timeline?.length) {
    sectionTitle("Investigation Timeline");

    analysis.timeline.forEach((event) => {
      checkPage(25);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);

      doc.text(
        `${event.time ?? "Unknown time"} — ${
          event.type ?? "event"
        }`,
        margin,
        y
      );

      y += 6;

      paragraph(event.event, 10);

      y += 2;
    });
  }

  // ─────────────────────────────────────────────
  // Evidence Intelligence
  // ─────────────────────────────────────────────

  if (analysis.evidence?.length) {
    sectionTitle("Evidence Intelligence");

    analysis.evidence.forEach((evidence) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      // Same fix as the relationships section: wrap long evidence item
      // names instead of letting them run off the page edge unwrapped.
      const itemLines = doc.splitTextToSize(
        evidence.item ?? "Evidence",
        contentWidth
      );

      checkPage(itemLines.length * 6 + 24);

      doc.text(itemLines, margin, y);

      y += itemLines.length * 6 + 1;

      labelValue(
        "Confidence",
        `${evidence.confidence ?? "N/A"}%`
      );

      if (evidence.level || evidence.importance) {
        labelValue(
          "Level",
          evidence.level ?? evidence.importance
        );
      }

      if (evidence.reasoning || evidence.notes) {
        paragraph(
          evidence.reasoning ?? evidence.notes,
          10
        );
      }

      y += 3;
    });
  }

  // ─────────────────────────────────────────────
  // Witness Notes
  // ─────────────────────────────────────────────

  if (analysis.witnesses?.length) {
    sectionTitle("Witnesses");

    analysis.witnesses.forEach((witness) => {
      bullet(
        typeof witness === "object"
          ? witness.name ?? JSON.stringify(witness)
          : witness
      );
    });
  }

  // ─────────────────────────────────────────────
  // Contradictions
  // ─────────────────────────────────────────────

  if (analysis.contradictions?.length) {
    sectionTitle("Potential Contradictions");

    analysis.contradictions.forEach((item) => {
      bullet(item);
    });
  }

  // ─────────────────────────────────────────────
  // Recommended Next Steps
  // ─────────────────────────────────────────────

  if (analysis.recommendedNextSteps?.length) {
    sectionTitle("Recommended Next Steps");

    analysis.recommendedNextSteps.forEach(
      (step, index) => {
        checkPage(15);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);

        const lines = doc.splitTextToSize(
          `${index + 1}. ${step}`,
          contentWidth - 5
        );

        doc.text(lines, margin + 2, y);

        y += lines.length * 5 + 4;
      }
    );
  }

  // ─────────────────────────────────────────────
  // AI Notice
  // ─────────────────────────────────────────────

  checkPage(35);

  y += 8;

  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text("AI Analysis Notice", margin, y);

  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  const disclaimer =
    "This report contains AI-generated analysis derived from " +
    "the submitted case materials. AI-generated conclusions, " +
    "confidence assessments, and inferred relationships should " +
    "be independently verified against source evidence before " +
    "being relied upon.";

  const disclaimerLines = doc.splitTextToSize(
    disclaimer,
    contentWidth
  );

  doc.text(disclaimerLines, margin, y);

  // ─────────────────────────────────────────────
  // Page numbers
  // ─────────────────────────────────────────────

  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.text(
      `CaseFlow AI Investigation Report`,
      margin,
      pageHeight - 10
    );

    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: "right" }
    );
  }

  // ─────────────────────────────────────────────
  // Save
  // ─────────────────────────────────────────────

  const safeTitle = String(caseData.title)
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_");

  doc.save(`${safeTitle}_CaseFlow_Report.pdf`);
}

