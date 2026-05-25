"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { motion } from "framer-motion";
import { Share2, Download, Award, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils/cn";
import { 
  getExamResult, 
  getStudentDisplayName, 
  formatSubmittedAt, 
  type StoredExamResult 
} from "@/lib/exam-result-storage";

export default function CertificatePage({ params }: { params: { id: string } }) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<StoredExamResult | null>(null);

  useEffect(() => {
    // جلب النتيجة من التخزين المحلي
    const data = getExamResult(params.id);
    setResult(data);
  }, [params.id]);

  const certificate = useMemo(() => {
    const studentName = getStudentDisplayName();
    if (result) {
      const certNum = `INT-2026-${result.examId}-${result.submittedAt.slice(0, 10).replace(/-/g, "")}`;
      return {
        certificateNumber: certNum,
        studentName: studentName,
        courseName: result.examTitle,
        completionDate: formatSubmittedAt(result.submittedAt),
        score: result.scorePercent,
        verificationUrl: `https://intellilearn.nmu.edu/verify/${params.id}`,
      };
    }
    // بيانات تجريبية في حال عدم وجود نتيجة
    return {
      certificateNumber: "SAMPLE-12345",
      studentName: "John Doe",
      courseName: "JavaScript Fundamentals",
      completionDate: "May 24, 2026",
      score: 85,
      verificationUrl: "https://intellilearn.nmu.edu/verify/sample",
    };
  }, [result]);

  // وظيفة تحويل الشهادة إلى PDF
  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Certificate_${certificate.certificateNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      <Navbar />
      <div className="max-w-5xl mx-auto py-12 px-4">
        
        {/* منطقة الشهادة بتنسيق احترافي */}
        <div ref={certificateRef} className="bg-white p-16 border-[15px] border-double border-primary/20 shadow-2xl">
          <div className="text-center border-4 border-primary/30 p-12 relative">
            <Award className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="text-6xl font-serif font-bold text-gray-800 uppercase tracking-widest">Certificate</h1>
            <p className="text-2xl mt-4 font-light text-gray-600">This is to certify that</p>
            <h2 className="text-5xl font-bold text-primary my-8">{certificate.studentName}</h2>
            <p className="text-xl">has successfully completed the examination in</p>
            <h3 className="text-3xl font-semibold my-6 text-gray-800">{certificate.courseName}</h3>
            
            <div className="flex justify-between items-end mt-16 px-10">
              <div className="text-left">
                <div className="w-40 h-0.5 bg-black mb-2"></div>
                <p className="font-semibold text-sm">Instructor Signature</p>
              </div>
              <div className="flex flex-col items-center">
                <QRCodeSVG value={certificate.verificationUrl} size={120} />
                <p className="text-xs mt-2 text-gray-500 font-mono">{certificate.certificateNumber}</p>
              </div>
              <div className="text-right">
                <div className="w-40 h-0.5 bg-black mb-2"></div>
                <p className="font-semibold text-sm">{certificate.completionDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex gap-6 mt-10 justify-center">
          <button 
            onClick={handleDownload} 
            className="flex items-center px-10 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition shadow-lg"
          >
            <Download className="w-6 h-6 mr-3" /> Download PDF
          </button>
          <button 
            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificate.verificationUrl)}`, "_blank")} 
            className="flex items-center px-10 py-4 bg-[#0077b5] text-white rounded-xl font-bold text-lg hover:bg-[#006399] transition shadow-lg"
          >
            <Share2 className="w-6 h-6 mr-3" /> Share on LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
}