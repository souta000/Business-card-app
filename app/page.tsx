"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type BgTemplate = {
  label: string;
  value: string;
};

const bgTemplates: BgTemplate[] = [
  { label: "Blue", value: "/backgrounds/blue.png" },
  { label: "Yellow", value: "/backgrounds/yellow.png" },
  { label: "Marble", value: "/backgrounds/marble.png" },
];

export default function Page() {
  const [name, setName] = useState("Your Name");
  const [company, setCompany] = useState("Company / Position");
  const [email, setEmail] = useState("example@example.com");

  const [bgType, setBgType] = useState<"color" | "image">("color");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgImage, setBgImage] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // PDF出力
  const downloadPDF = async () => {
    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current, { scale: 3 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [91, 55],
    });

    pdf.addImage(imgData, "PNG", 0, 0, 91, 55);
    pdf.save("business-card.pdf");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Business Card Creator</h1>

      {/* 名刺 */}
      <div
        ref={cardRef}
        className="w-80 h-48 rounded-lg shadow-lg mb-4 p-4"
        style={{
          backgroundColor: bgType === "color" ? bgColor : undefined,
          backgroundImage:
            bgType === "image" && bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: "cover",
        }}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-gray-700">{company}</p>
          </div>
          <p className="text-sm">{email}</p>
        </div>
      </div>

      {/* 背景タイプ切替 */}
      <div className="flex gap-2 mb-3">
        <button
          className="border px-3 py-1 rounded"
          onClick={() => setBgType("color")}
        >
          Color
        </button>
        <button
          className="border px-3 py-1 rounded"
          onClick={() => setBgType("image")}
        >
          Image
        </button>
      </div>

      {/* 背景色 */}
      {bgType === "color" && (
        <div className="flex gap-2 mb-4">
          <button onClick={() => setBgColor("#ffffff")} className="border px-3 py-1">White</button>
          <button onClick={() => setBgColor("#bfdbfe")} className="border px-3 py-1">Blue</button>
          <button onClick={() => setBgColor("#fef08a")} className="border px-3 py-1">Yellow</button>
        </div>
      )}

      {/* 背景画像テンプレUI */}
      {bgType === "image" && (
        <div className="flex gap-3 mb-4">
          {bgTemplates.map((bg) => (
            <button
              key={bg.value}
              onClick={() => setBgImage(bg.value)}
              className={`border rounded p-1 ${
                bgImage === bg.value ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <img
                src={bg.value}
                alt={bg.label}
                className="w-16 h-10 object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}

      {/* テキスト入力 */}
      <div className="w-80 flex flex-col gap-2 mb-4">
        <input
          className="border rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border rounded p-2"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          className="border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button
        onClick={downloadPDF}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Download PDF
      </button>
    </main>
  );
}
