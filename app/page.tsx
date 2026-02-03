"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Page() {
  const [name, setName] = useState("Your Name");
  const [company, setCompany] = useState("Company / Position");
  const [email, setEmail] = useState("example@example.com");

  const [bgType, setBgType] = useState<"color" | "image">("color");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgImage, setBgImage] = useState("");

  const [font, setFont] = useState("font-sans");

  type ImgType = { url: string; x: number; y: number };
  const [images, setImages] = useState<ImgType[]>([]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const cardRef = useRef<HTMLDivElement>(null);

  // ドラッグ処理
  const startDrag = (e: React.MouseEvent<HTMLImageElement>, idx: number) => {
    setDraggingIdx(idx);
    setOffset({ x: e.clientX - images[idx].x, y: e.clientY - images[idx].y });
  };
  const onDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingIdx === null) return;
    const newImages = [...images];
    newImages[draggingIdx] = {
      ...newImages[draggingIdx],
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
    setImages(newImages);
  };
  const endDrag = () => setDraggingIdx(null);

  // PDFダウンロード（名刺規格 91x55mm）
  const downloadPDF = async () => {
    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current, { scale: 3 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [91, 55], // 名刺サイズ
    });

    // canvasをpdfに収まるようにリサイズ
    pdf.addImage(imgData, "PNG", 0, 0, 91, 55);
    pdf.save("business-card.pdf");
  };

  // 画像追加
  const addImage = (url: string) => {
    setImages([...images, { url, x: 10, y: 10 }]);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4"
      onMouseMove={onDrag}
      onMouseUp={endDrag}
    >
      <h1 className="text-3xl font-bold mb-6">Business Card Creator</h1>

      {/* 名刺プレビュー */}
      <div
        ref={cardRef}
        className={`w-80 h-48 shadow-lg rounded-lg relative mb-4 ${font}`}
        style={{
          backgroundColor: bgType === "color" ? bgColor : undefined,
          backgroundImage: bgType === "image" ? `url(${bgImage})` : undefined,
          backgroundSize: "cover",
        }}
      >
        <div className="p-4 flex flex-col justify-between h-full">
          <div>
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-gray-700">{company}</p>
          </div>
          <p className="text-sm text-gray-500">{email}</p>
        </div>

        {/* 画像 */}
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img.url}
            alt="logo"
            className="absolute w-16 h-16 cursor-move"
            style={{ left: img.x, top: img.y }}
            onMouseDown={(e) => startDrag(e, idx)}
          />
        ))}
      </div>

      {/* 背景切替 */}
      <div className="flex gap-2 mb-2">
        <button className="px-2 py-1 border rounded" onClick={() => setBgType("color")}>Color</button>
        <button className="px-2 py-1 border rounded" onClick={() => setBgType("image")}>Image</button>
      </div>

      {/* 背景選択 */}
      {bgType === "color" && (
        <div className="flex gap-2 mb-4">
          <button onClick={() => setBgColor("#ffffff")} className="border px-2 py-1 rounded">White</button>
          <button onClick={() => setBgColor("#bfdbfe")} className="border px-2 py-1 rounded">Blue</button>
          <button onClick={() => setBgColor("#fef08a")} className="border px-2 py-1 rounded">Yellow</button>
        </div>
      )}
      {bgType === "image" && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Image URL"
            className="border rounded p-2 w-60"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const target = e.target as HTMLInputElement;
                addImage(target.value);
                target.value = "";
              }
            }}
          />
        </div>
      )}

      {/* フォント切替 */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFont("font-sans")} className="border px-2 py-1 rounded">Sans</button>
        <button onClick={() => setFont("font-serif")} className="border px-2 py-1 rounded">Serif</button>
        <button onClick={() => setFont("font-mono")} className="border px-2 py-1 rounded">Mono</button>
      </div>

      {/* テキストフォーム */}
      <form className="w-80 flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="text"
          placeholder="Company / Position"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded p-2"
        />
      </form>

      {/* PDFダウンロード */}
      <button
        onClick={downloadPDF}
        className="bg-green-500 text-white rounded p-2 hover:bg-green-600"
      >
        Download PDF
      </button>
    </main>
  );
}

