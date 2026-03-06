"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import jsPDF from "jspdf";
import Link from "next/link";
import LoginButton from "../components/LoginButton";

const CARD_WIDTH = 350;
const CARD_HEIGHT = 200;
const SNAP = 6;

type TextItem = {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const templates: Record<string, TextItem[]> = {
  simple: [
    { id: "name", text: "Sota Kaneda", x: 95, y: 50, width: 160, height: 32 },
    { id: "job", text: "Web Developer", x: 95, y: 90, width: 160, height: 24 },
    { id: "twitter", text: "@sota_k", x: 95, y: 130, width: 160, height: 24 },
    { id: "instagram", text: "@sota.k", x: 95, y: 160, width: 160, height: 24 },
  ],
  left: [
    { id: "name", text: "Sota Kaneda", x: 24, y: 50, width: 200, height: 32 },
    { id: "job", text: "Web Developer", x: 24, y: 90, width: 200, height: 24 },
    { id: "twitter", text: "@sota_k", x: 24, y: 130, width: 200, height: 24 },
    { id: "instagram", text: "@sota.k", x: 24, y: 160, width: 200, height: 24 },
  ],
};

export default function EditorPage() {
  const { data: session, status } = useSession();
  const [texts, setTexts] = useState<TextItem[]>(templates.simple);
  const [dragId, setDragId] = useState<string | null>(null);
  const [guides, setGuides] = useState({ v: false, h: false });

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
        <div className="text-center space-y-4">
          <p>ログインしてください</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  // ===== ドラッグ移動 =====
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragId) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTexts((prev) =>
      prev.map((t) => {
        if (t.id !== dragId) return t;

        let x = mouseX - t.width / 2;
        let y = mouseY - t.height / 2;
        let v = false;
        let h = false;

        const cx = x + t.width / 2;
        const cy = y + t.height / 2;

        if (Math.abs(cx - CARD_WIDTH / 2) < SNAP) {
          x = CARD_WIDTH / 2 - t.width / 2;
          v = true;
        }
        if (Math.abs(cy - CARD_HEIGHT / 2) < SNAP) {
          y = CARD_HEIGHT / 2 - t.height / 2;
          h = true;
        }

        prev.forEach((other) => {
          if (other.id === t.id) return;
          const otherCX = other.x + other.width / 2;
          const otherCY = other.y + other.height / 2;

          if (Math.abs(cx - otherCX) < SNAP) {
            x = otherCX - t.width / 2;
            v = true;
          }
          if (Math.abs(cy - otherCY) < SNAP) {
            y = otherCY - t.height / 2;
            h = true;
          }
        });

        setGuides({ v, h });
        return { ...t, x, y };
      })
    );
  };

  // ===== 整列 =====
  const align = (direction: string) => {
    setTexts((prev) =>
      prev.map((t) => {
        let x = t.x;
        let y = t.y;

        if (direction === "center") x = CARD_WIDTH / 2 - t.width / 2;
        else if (direction === "left") x = 10;
        else if (direction === "right") x = CARD_WIDTH - t.width - 10;
        else if (direction === "top") y = 10;
        else if (direction === "bottom") y = CARD_HEIGHT - t.height - 10;

        return { ...t, x, y };
      })
    );
  };

  // ===== PDF出力 =====
  const exportPDF = () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [CARD_WIDTH, CARD_HEIGHT],
    });

    texts.forEach((t) => pdf.text(t.text, t.x, t.y + t.height - 6));
    pdf.save("business-card.pdf");
  };

  const saveCard = async () => {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
    });

    if (res.ok) alert("保存しました！");
    else alert("保存失敗");
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8 flex gap-8">
      {/* ===== 左パネル ===== */}
      <div className="w-48 space-y-3">
        <Link href="/cards" className="block text-center btn bg-white text-black">
          保存した名刺一覧
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn bg-red-500 text-white"
        >
          ログアウト
        </button>

        <hr className="border-neutral-700" />

        <button onClick={() => setTexts(templates.simple)} className="btn">
          テンプレA
        </button>
        <button onClick={() => setTexts(templates.left)} className="btn">
          テンプレB
        </button>

        <hr className="border-neutral-700" />

        <button onClick={() => align("center")} className="btn">横中央</button>
        <button onClick={() => align("left")} className="btn">左</button>
        <button onClick={() => align("right")} className="btn">右</button>
        <button onClick={() => align("top")} className="btn">上</button>
        <button onClick={() => align("bottom")} className="btn">下</button>

        <hr className="border-neutral-700" />

        <button onClick={saveCard} className="btn bg-green-500 text-white">
          保存
        </button>

        <button onClick={exportPDF} className="btn bg-white text-black">
          PDF出力
        </button>

        {/* SNS入力 */}
        <div className="space-y-2 mt-4">
          <label>Twitter</label>
          <input
            type="text"
            className="input"
            value={texts.find((t) => t.id === "twitter")?.text || ""}
            onChange={(e) =>
              setTexts((prev) =>
                prev.map((t) =>
                  t.id === "twitter" ? { ...t, text: e.target.value } : t
                )
              )
            }
          />

          <label>Instagram</label>
          <input
            type="text"
            className="input"
            value={texts.find((t) => t.id === "instagram")?.text || ""}
            onChange={(e) =>
              setTexts((prev) =>
                prev.map((t) =>
                  t.id === "instagram" ? { ...t, text: e.target.value } : t
                )
              )
            }
          />
        </div>
      </div>

      {/* ===== 名刺キャンバス ===== */}
      <div
        className="relative bg-neutral-800 p-10"
        onMouseMove={onMouseMove}
        onMouseUp={() => {
          setDragId(null);
          setGuides({ v: false, h: false });
        }}
      >
        <div
          className="relative bg-white shadow-xl"
          style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
        >
          {guides.v && <div className="guide-v" />}
          {guides.h && <div className="guide-h" />}

          {texts.map((t) => (
            <div
              key={t.id}
              className="absolute cursor-move select-none border border-dashed border-neutral-400 text-black text-center"
              style={{
                left: t.x,
                top: t.y,
                width: t.width,
                height: t.height,
                lineHeight: `${t.height}px`,
              }}
              onMouseDown={() => setDragId(t.id)}
              contentEditable
              suppressContentEditableWarning
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              onInput={() => {
                // 入力中はstate更新しない（カーソル安定）
              }}
              onBlur={(e) => {
                const value = e.currentTarget.innerText;
                setTexts((prev) =>
                  prev.map((p) =>
                    p.id === t.id ? { ...p, text: value } : p
                  )
                );
              }}
              dangerouslySetInnerHTML={{ __html: t.text }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .btn {
          width: 100%;
          padding: 8px;
          background: #111;
          border: 1px solid #444;
          border-radius: 6px;
        }
        .btn:hover {
          background: #222;
        }
        .guide-v {
          position: absolute;
          left: 50%;
          top: 0;
          width: 1px;
          height: 100%;
          background: red;
          opacity: 0.6;
        }
        .guide-h {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 1px;
          background: red;
          opacity: 0.6;
        }
        .input {
          width: 100%;
          padding: 6px;
          border-radius: 4px;
          border: 1px solid #444;
          background: #222;
          color: white;
        }
        .input:focus {
          outline: 2px solid #555;
        }
      `}</style>
    </div>
  );
}