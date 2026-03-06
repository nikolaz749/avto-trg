"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MojiOglasiPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/oglasi/moji");
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setErr("Moraš biti prijavljen, da vidiš svoje oglase.");
        } else {
          setErr(data?.error || "Napaka pri nalaganju.");
        }
        setItems([]);
        return;
      }

      setItems(Array.isArray(data) ? data : []);
    } catch {
      setErr("Napaka pri povezavi s strežnikom.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 12 }}>
          <div>
            <h2 className="h2" style={{ marginBottom: 6 }}>Moji oglasi</h2>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Oglasi, ki si jih objavil ti.
            </div>
          </div>
          <Link className="btn" href="/">← Nazaj</Link>
        </div>

        <div className="card" style={{ padding: 16 }}>
          {loading && <div style={{ color: "var(--muted)" }}>Nalagam...</div>}

          {!loading && err && (
            <div style={{ marginBottom: 12, color: "#b91c1c", fontWeight: 700 }}>
              {err}
            </div>
          )}

          {!loading && err === "Moraš biti prijavljen, da vidiš svoje oglase." && (
            <Link href="/prijava" style={{ color: "#2563eb" }}>
              Pojdi na prijavo →
            </Link>
          )}

          {!loading && !err && items.length === 0 && (
            <div style={{ color: "var(--muted)" }}>Nimaš še nobenega oglasa.</div>
          )}

          {!loading && !err && items.length > 0 && (
            <div style={{ display: "grid", gap: 10 }}>
              {items.map((x) => (
                <Link key={x.id} href={`/oglasi/${x.id}`} className="card" style={{ padding: 12, textDecoration: "none" }}>
                  <div style={{ fontWeight: 800 }}>{x.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>
                    {x.brand || "—"} {x.model || ""} • {x.condition || "—"} • {x.type}
                  </div>
                  <div style={{ marginTop: 6, fontWeight: 800 }}>{x.price} €</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}