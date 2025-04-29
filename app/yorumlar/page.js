"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hakkinda() {
  const [data, setData] = useState([]); // Yorumları tutacak state
  const [loading, setLoading] = useState(true); // Yükleniyor durumunu tutacak state
  const [error, setError] = useState(null); // Hata durumunu tutacak state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://erenisgoren.com.tr/sinem/api/?action=yorumlar&limit=10');
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await res.json();
        setData(result); // Yorumları state'e set et
      } catch (error) {
        setError(error.message); // Hata mesajını state'e set et
      } finally {
        setLoading(false); // Yükleme tamamlandı
      }
    };

    fetchData(); // Veri çekme fonksiyonunu çağır
  }, []); // Boş bağımlılık dizisi ile sadece ilk renderda çalışır

  return (
    <>
      <title>Yorumlar</title>
      <div className="mt-8 container mx-auto px-4">
        <h2 className="text-lg font-semibold">Yorumlar</h2>
        {loading && <div className="loading-box">...</div>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="list-disc list-inside grid gap-5">
            {data.map((yorum) => (
              <div key={yorum.id}>
                <p>
                  <strong>Yazar:</strong> {yorum.baslik}
                </p>
                <p>
                  <strong>Puan:</strong> {yorum.star}
                </p>
                <p>
                  <strong>Mesaj:</strong> {yorum.yazi}
                </p>
              </div>
            ))}
          </div>
        )}
        <Link href="/" className="text-blue-500 underline">
          Geri Dön
        </Link>
      </div>
    </>
  );
}

