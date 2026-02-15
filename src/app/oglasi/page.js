"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const DEMO = [
  { id: 1, tip: "avti", title: "Volkswagen Golf 2.0 TDI", meta: "2017 • 158.000 km • Diesel • Ljubljana", price: 11900 },
  { id: 2, tip: "avti", title: "Škoda Octavia 1.6 TDI", meta: "2016 • 210.000 km • Diesel • Celje", price: 8900 },
  { id: 3, tip: "avti", title: "BMW 320d Touring", meta: "2015 • 235.000 km • Diesel • Maribor", price: 12900 },
  { id: 4, tip: "deli", title: "Platišča 18'' (5x112)", meta: "Rabljeno • Dobro stanje • Kranj", price: 450 },
  { id: 5, tip: "deli", title: "Zavorne ploščice (nove)", meta: "Novo • Univerzalno • Ljubljana", price: 35 },
];

function eur(n) {
  return new Intl.NumberFormat("sl-SI", { style: "currency", currency: "EUR" }).format(n);
}

export default function OglasiPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const tip = sp.get("tip") || "avti";
  const q = sp.get("q") || "";
  const znamka = sp.get("znamka") || "";
  const model = sp.get("model") || "";

  const results = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return DEMO.filter((x) => x.tip === tip)
      .filter((x) => (qq ? (x.title + " " + x.meta).toLowerCase().includes(qq) : true))
      .filter((x) => (znamka ? x.title.toLowerCase().includes(znamka.toLowerCase()) : true))
      .filter((x) => (model ? x.title.toLowerCase().includes(model.toLowerCase()) : true));
  }, [tip, q, znamka, model]);

  function setParam(key, value) {
    const p = new URLSearchParams(sp.toString());
    if (!value) p.delete(key);
    else p.set(key, value);
    router.push(`/oglasi?${p.toString()}`);
  }

  return (
    <>
      <header className="topbar">
        <div className="container">
          <div className="nav">
            <a className="brand" href="/">
              <div className="logo" />
              <span>Avto Trg</span>
            </a>
            <nav className="navlinks">
              <a href="/oglasi?tip=avti">Avti</a>
              <a href="/oglasi?tip=deli">Deli</a>
              <a href="/objavi">Objavi oglas</a>
            </nav>
            <div className="actions">
              <a className="btn btnPrimary" href="/objavi">+ Objavi</a>
            </div>
          </div>
        </div>
      </header>

      <main className="section">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "end", marginBottom: 12 }}>
            <div>
              <h2 className="h2" style={{ marginBottom: 6 }}>Oglasi</h2>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                Tip: <b>{tip === "avti" ? "Avti" : "Deli & oprema"}</b> • Najdeno: <b>{results.length}</b>
              </div>
            </div>
            <a className="btn" href="/">← Nazaj</a>
          </div>

          <div className="listGrid">
            <aside className="card">
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Filtri (MVP)</div>

              <label style={{ fontSize: 12, color: "var(--muted)" }}>Tip</label>
              <select className="select" value={tip} onChange={(e) => setParam("tip", e.target.value)}>
                <option value="avti">Avti</option>
                <option value="deli">Deli</option>
              </select>

              <div style={{ height: 10 }} />

              <label style={{ fontSize: 12, color: "var(--muted)" }}>Iskanje</label>
              <input className="input" value={q} onChange={(e) => setParam("q", e.target.value)} placeholder="npr. Golf, platišča..." />

              {tip === "avti" && (
                <>
                  <div style={{ height: 10 }} />
                  <label style={{ fontSize: 12, color: "var(--muted)" }}>Znamka (demo)</label>
                  <input className="input" value={znamka} onChange={(e) => setParam("znamka", e.target.value)} placeholder="Volkswagen..." />

                  <div style={{ height: 10 }} />
                  <label style={{ fontSize: 12, color: "var(--muted)" }}>Model (demo)</label>
                  <input className="input" value={model} onChange={(e) => setParam("model", e.target.value)} placeholder="Golf..." />
                </>
              )}

              <div style={{ height: 10 }} />
              <button className="btn" onClick={() => router.push(`/oglasi?tip=${tip}`)}>
                Počisti filtre
              </button>

              <p className="smallMuted">
                Naslednji korak: baza + pravi filtri (letnik, km, cena, lokacija…).
              </p>
            </aside>

            <section style={{ display: "grid", gap: 12 }}>
              {results.map((x) => (
                <div className="item" key={x.id}>
                  <div className="thumb" />
                  <div>
                    <p className="itemTitle">{x.title}</p>
                    <p className="itemMeta">{x.meta}</p>
                    <div className="price">{eur(x.price)}</div>
                  </div>
                </div>
              ))}

              {results.length === 0 && <div className="card">Ni zadetkov. Poskusi spremeniti iskanje ali filtre.</div>}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
