"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

type CardItem = {
  id: string;
  data: { id: string; text: string; x: number; y: number; width: number; height: number }[];
  createdAt: string;
};

export default function CardsPage() {
  const { data: session, status } = useSession();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!session) return;

  fetch("/api/cards")
    .then(async (res) => {
      if (!res.ok) {
        console.error("API error", res.status);
        return [];
      }
      return res.json();
    })
    .then((data) => {
      setCards(data || []);
      setLoading(false);
    })
    .catch((err) => {
      console.error("fetch error", err);
      setLoading(false);
    });
}, [session]);

  // 削除処理
  const handleDelete = async (id: string) => {
    if (!confirm("この名刺を削除しますか？")) return;

    await fetch(`/api/cards/${id}`, {
      method: "DELETE",
    });

    setCards(prev => prev.filter(card => card.id !== id));
  };

  if (status === "loading") return null;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">保存した名刺一覧</h1>
        <div className="flex gap-3">
          <Link href="/editor" className="btn">新規作成</Link>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="logout">
            ログアウト
          </button>
        </div>
      </div>

      {/* ローディング */}
      {loading && <p className="text-gray-400">読み込み中...</p>}

      {/* 空状態 */}
      {!loading && cards.length === 0 && (
        <div className="text-center mt-20 text-gray-400">
          <p>まだ名刺がありません</p>
          <Link href="/editor" className="btn mt-4">最初の名刺を作成</Link>
        </div>
      )}

      {/* カード一覧 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {cards.map(card => (
          <div key={card.id} className="bg-white text-black p-4 shadow rounded relative">
            {card.data.map(t => (
              <p key={t.id} className="text-sm">{t.text}</p>
            ))}

            <p className="text-xs text-gray-500 mt-2">
              {new Date(card.createdAt).toLocaleString()}
            </p>

            {/* 操作ボタン */}
            <div className="flex justify-between mt-3">
              <Link href={`/cards/${card.id}`} className="edit">
                編集
              </Link>
              <button onClick={() => handleDelete(card.id)} className="delete">
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .btn {
          display:inline-block;
          padding:8px 14px;
          background:#111;
          color:white;
          border-radius:6px;
        }
        .btn:hover { background:#222; }

        .logout {
          background:#ef4444;
          padding:8px 14px;
          border-radius:6px;
        }
        .logout:hover { background:#dc2626; }

        .edit {
          font-size:12px;
          color:#2563eb;
        }
        .delete {
          font-size:12px;
          color:#ef4444;
        }
      `}</style>
    </div>
  );
}