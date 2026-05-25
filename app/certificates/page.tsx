"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { Download, Share2, Award } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getExamResult, getStudentDisplayName, formatSubmittedAt, type StoredExamResult } from "@/lib/exam-result-storage";

export default function CertificatePage({ params }: { params: { id: string } }) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<StoredExamResult | null>(null);

  useEffect(() => {
    setResult(getExamResult(params.id));
  }, [params.id]);

  const certificate = useMemo(() => {
    const studentName = getStudentDisplayName() || "Student Name";
    if (result) {
      const certNum = `INT-2026-${result.examId}`;
      return {
        certificateNumber: certNum,
        studentName: studentName,
        courseName: result.examTitle,
        completionDate: formatSubmittedAt(result.submittedAt),
        verificationUrl: `https://intellilearn.nmu.edu/verify/${params.id}`,
      };
    }
    return {
      certificateNumber: "SAMPLE-9999",
      studentName: "John Doe",
      courseName: "Sample Course",
      completionDate: "May 24, 2026",
      verificationUrl: "https://intellilearn.nmu.edu/verify/sample",
    };
  }, [result, params.id]);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
    pdf.save(`Certificate_${certificate.certificateNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background-dark">
      <Navbar />
      <div className="max-w-5xl mx-auto py-12 px-4">
        
        {/* تصميم الشهادة الرسمي */}
        <div 
          ref={certificateRef} 
          className="bg-white p-20 border-[30px] border-double border-[#d4af37] shadow-2xl relative"
        >
          <div className="text-center">
            <h1 className="font-serif text-7xl font-bold text-gray-800 tracking-wider">CERTIFICATE</h1>
            <h3 className="font-serif text-2xl text-gray-500 mt-2 tracking-[0.5em]">OF COMPLETION</h3>
            
            <div className="mt-16">
              <p className="font-serif text-2xl italic text-gray-600">This is to certify that</p>
              <h2 className="font-serif text-5xl font-bold text-[#6A0F1C] my-8 border-b-2 border-gray-300 inline-block px-10 pb-2">
                {certificate.studentName}
              </h2>
              <p className="font-serif text-xl">has successfully completed</p>
              <h3 className="font-serif text-3xl font-bold mt-2 text-gray-800">{certificate.courseName}</h3>
            </div>

            <div className="mt-20 flex justify-between items-center px-10">
              <div className="text-center">
                <div className="w-40 border-t border-black mb-2"></div>
                <p className="font-serif font-semibold">Instructor Signature</p>
              </div>
              
              <div className="flex flex-col items-center">
                <QRCodeSVG value={certificate.verificationUrl} size={100} />
                <p className="text-xs mt-2 font-mono">{certificate.certificateNumber}</p>
              </div>
              
              <div className="text-center">
                <div className="w-40 border-t border-black mb-2"></div>
                <p className="font-serif font-semibold">{certificate.completionDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex gap-6 mt-10 justify-center">
          <button 
            onClick={handleDownload} 
            className="flex items-center px-10 py-4 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition"
          >
            <Download className="w-5 h-5 mr-2" /> Download PDF
          </button>
          <button 
            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificate.verificationUrl)}`, "_blank")} 
            className="flex items-center px-10 py-4 bg-[#0077b5] text-white rounded-lg font-bold hover:bg-[#006399] transition"
          >
            <Share2 className="w-5 h-5 mr-2" /> Share on LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
}