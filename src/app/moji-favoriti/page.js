"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function eur(n) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

export default function MojiFavoritiPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch("/api/favorites/list", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (!cancelled) {
            setErr(data?.error || "Napaka.");
            setItems([]);
          }
          return;
        }

        if (!cancelled) {
          setItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch {
        if (!cancelled) setErr("Napaka pri povezavi s strežnikom.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="section">
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            marginBottom: 12,
          }}
        >
          <div>
            <h2 className="h2" style={{ marginBottom: 6 }}>
              Moji favoriti
            </h2>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Najdeno: <b>{items.length}</b>
            </div>
          </div>
          <Link className="btn" href="/oglasi">
            ← Nazaj na oglase
          </Link>
        </div>

        {loading && (
          <div className="card" style={{ padding: 16 }}>
            Nalagam...
          </div>
        )}

        {!loading && err && (
          <div
            className="card"
            style={{ padding: 16, color: "#b91c1c", fontWeight: 800 }}
          >
            {err}
          </div>
        )}

        {!loading && !err && items.length === 0 && (
          <div className="card" style={{ padding: 16 }}>
            Nimaš še favoritov. Klikni 🤍 na oglasu.
          </div>
        )}

        {!loading && !err && items.length > 0 && (
          <div className="gridListings">
            {items.map((x) => (
              <Link
                key={x.id}
                href={`/oglasi/${x.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="card" style={{ overflow: "hidden" }}>
                  <div style={{ height: 170, background: "var(--bg)" }}>
                    {x.images?.[0]?.url ? (
                      <img
                        src={x.images[0].url}
                        alt="thumb"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : null}
                  </div>

                  <div style={{ padding: 14 }}>
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>
                      {x.title}
                    </div>

                    <div
                      style={{
                        color: "var(--muted)",
                        fontSize: 13,
                        marginBottom: 10,
                      }}
                    >
                      {x.location || "—"}
                      {x.year ? ` • ${x.year}` : ""}
                      {x.km ? ` • ${Number(x.km).toLocaleString("sl-SI")} km` : ""}
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 900 }}>
                      {eur(x.price)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}