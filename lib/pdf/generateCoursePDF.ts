import PDFDocument from "pdfkit/standalone";
import blobStream from "blob-stream";

export type Module = {
  id: number;
  title: string;
  duration: string | null;
  videoUrl?: string;
  examUrl?: string;
  resources?: string[];
};

export type CourseDetail = {
  id: number;
  title: string;
  description: string;
  longDescription: string | null;
  duration: string | null;
  students: number;
  rating: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  instructor: string;
  modules: Module[];
};

export const generateCoursePDF = async (course: CourseDetail): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      // Initialize a new PDF Document
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const stream = doc.pipe(blobStream());

      // --- Course Header ---
      doc.fontSize(24).font("Helvetica-Bold").text(course.title, { align: "center" });
      doc.moveDown(0.5);

      // --- Metadata ---
      doc.fontSize(11).font("Helvetica").fillColor("gray");
      doc.text(`Instructor: ${course.instructor}`, { align: "center" });
      doc.text(
        `Level: ${course.level}  |  Rating: ${course.rating.toFixed(1)}/5  |  Students: ${course.students.toLocaleString()}`,
        { align: "center" }
      );
      doc.text(`Duration: ${course.duration || "Self-paced"}`, { align: "center" });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.moveDown(2);

      // --- Descriptions ---
      doc.fillColor("black").fontSize(16).font("Helvetica-Bold").text("Course Overview");
      doc.moveDown(0.5);
      
      if (course.description) {
        doc.fontSize(12).font("Helvetica").text(course.description, { align: "justify" });
        doc.moveDown(0.5);
      }
      
      if (course.longDescription) {
        doc.text(course.longDescription, { align: "justify" });
        doc.moveDown(2);
      }

      // --- Modules Section ---
      doc.fontSize(16).font("Helvetica-Bold").text("Course Curriculum");
      doc.moveDown(1);

      if (!course.modules || course.modules.length === 0) {
        doc.fontSize(12).font("Helvetica-Oblique").fillColor("gray").text("Modules will be available soon.");
      } else {
        course.modules.forEach((mod, index) => {
          // Module Title
          doc.fontSize(14).font("Helvetica-Bold").fillColor("black").text(`${index + 1}. ${mod.title}`);
          
          // Module Duration
          if (mod.duration) {
            doc.fontSize(10).font("Helvetica").fillColor("gray").text(`Duration: ${mod.duration}`);
          }
          doc.moveDown(0.5);

          // Clickable Links (Interactivity)
          doc.fontSize(11).font("Helvetica");
          let hasLinks = false;

          if (mod.videoUrl) {
            doc.fillColor("blue").text("▶ Watch Video", { link: mod.videoUrl, underline: true, continued: true }).text("    ");
            hasLinks = true;
          }
          if (mod.examUrl) {
            doc.fillColor("green").text("📝 Take Exam", { link: mod.examUrl, underline: true, continued: true }).text("    ");
            hasLinks = true;
          }
          if (mod.resources && mod.resources.length > 0) {
            mod.resources.forEach((res, idx) => {
              doc.fillColor("purple").text(`📄 Resource ${idx + 1}`, { link: res, underline: true, continued: true }).text("    ");
              hasLinks = true;
            });
          }

          // Clear continued text buffer and add spacing
          if (hasLinks) {
            doc.text(" ", { continued: false });
          } else {
            doc.fillColor("gray").fontSize(10).font("Helvetica-Oblique").text("No external links available for this module.");
          }
          
          doc.moveDown(1.5);
        });
      }

      // Finalize PDF
      doc.end();

      stream.on("finish", () => {
        resolve(stream.toBlob("application/pdf"));
      });
      
      stream.on("error", (err: Error) => {
        reject(err);
      });

    } catch (err) {
      reject(err);
    }
  });
};