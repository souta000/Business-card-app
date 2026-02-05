"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type ImgType = { url: string; x: number; y: number };

export default function Page() {
  const { data: session } = useSession();

  // --- 名刺状態 ---
  const [name, setName] = useState("Your Name");
  const [company, setCompany] = useState("Company / Position");
  const [email, setEmail] = useState("example@example.com");

  const [bgType, setBgType] = useState<"color" | "image">("color");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgImage, setBgImage] = useState("");

  const [font, setFont] = useState("font-sans");

  const [images, setImages] = useState<ImgType[]>([]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const cardRef = useRef<HTMLDivElement>(null);

  // --- ドラッグ ---
  const startDrag = (e: React.MouseEvent<HTMLImageElement>, idx: number) => {
    setDraggingIdx(idx);
    setOffset({ x: e.clientX - images[idx].x, y: e.clientY - images[idx].y });
  };

  const onDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingIdx === null) return;
    const next = [...images];
    next[draggingIdx] = {
      ...next[draggingIdx],
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
    setImages(next);
  };

  const endDrag = () => setDraggingIdx(null);

  // --- 画像追加 ---
  const addImage = (url: string) => {
    if (!url) return;
    setImages([...images, { url, x: 10, y: 10 }]);
  };

  // --- PDF ---
  const downloadPDF = async () => {
    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current, {
      scale: window.devicePixelRatio,
      backgroundColor: null,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [91, 55],
    });

    pdf.addImage(imgData, "PNG", 0, 0, 91, 55);
    pdf.save("business-card.pdf");
  };

  // --- 未ログイン ---
  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">ログインしてください</h1>
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 rounded bg-blue-500 text-white"
        >
          Googleでログイン
        </button>
      </main>
    );
  }

  // --- ログイン後 ---
  return (
    <main
      className="min-h-screen bg-gray-100 p-4 flex flex-col items-center"
      onMouseMove={onDrag}
      onMouseUp={endDrag}
    >
      <header className="w-full max-w-xl flex justify-between items-center mb-4">
        <div>
          <p className="text-sm">ログイン中:</p>
          <p className="font-semibold">{session.user?.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="px-3 py-1 rounded border"
        >
          ログアウト
        </button>
      </header>

      <h1 className="text-3xl font-bold mb-4">Business Card Creator</h1>

      {/* 名刺 */}
      <div
        ref={cardRef}
        className={`w-80 h-48 rounded-lg shadow-lg relative mb-4 ${font}`}
        style={{
          backgroundColor: bgType === "color" ? bgColor : undefined,
          backgroundImage: bgType === "image" ? `url(${bgImage})` : undefined,
          backgroundSize: "cover",
        }}
      >
        <div className="p-4 flex flex-col justify-between h-full">
          <div>
            {/* ★ lab()回避：色は inline hex */}
            <h2 className="text-xl font-bold" style={{ color: "#111827" }}>
              {name}
            </h2>
            <p style={{ color: "#374151" }}>{company}</p>
          </div>
          <p style={{ color: "#4b5563", fontSize: "12px" }}>{email}</p>
        </div>

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

      {/* 背景 */}
      <div className="flex gap-2 mb-2">
        <button onClick={() => setBgType("color")} className="border px-2 py-1 rounded">
          Color
        </button>
        <button onClick={() => setBgType("image")} className="border px-2 py-1 rounded">
          Image
        </button>
      </div>

      {bgType === "color" && (
        <div className="flex gap-2 mb-4">
          <button onClick={() => setBgColor("#ffffff")} className="border px-2 py-1 rounded">
            White
          </button>
          <button onClick={() => setBgColor("#bfdbfe")} className="border px-2 py-1 rounded">
            Blue
          </button>
          <button onClick={() => setBgColor("#fef08a")} className="border px-2 py-1 rounded">
            Yellow
          </button>
        </div>
      )}

      {bgType === "image" && (
        <input
          type="text"
          placeholder="Image URL → Enter"
          className="border rounded p-2 w-72 mb-4"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addImage((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
      )}

      {/* フォント */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFont("font-sans")} className="border px-2 py-1 rounded">Sans</button>
        <button onClick={() => setFont("font-serif")} className="border px-2 py-1 rounded">Serif</button>
        <button onClick={() => setFont("font-mono")} className="border px-2 py-1 rounded">Mono</button>
      </div>

      {/* 入力 */}
      <div className="w-80 flex flex-col gap-2 mb-4">
        <input className="border rounded p-2" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border rounded p-2" value={company} onChange={(e) => setCompany(e.target.value)} />
        <input className="border rounded p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <button
        onClick={downloadPDF}
        className="bg-green-500 text-white rounded p-2 hover:bg-green-600"
      >
        Download PDF
      </button>
    </main>
  );
}
