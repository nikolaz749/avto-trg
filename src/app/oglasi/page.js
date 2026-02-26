"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LISTINGS } from "../lib/listings";
import Link from "next/link";
function eur(n) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function OglasiPage() {
  const sp = useSearchParams();

  // URL parametri (če jih ni, damo default)
  const urlTip = sp.get("tip") || "avti";
  const urlQ = sp.get("q") || "";

  // Lokalni state (da lahko filter spreminjaš brez reload)
  const [tip, setTip] = useState(urlTip);
  const [q, setQ] = useState(urlQ);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Znamke iz baze (glede na tip)
  const makes = useMemo(() => {
    const set = new Set();
    LISTINGS.filter((x) => x.type === tip).forEach((x) => {
      if (x.make) set.add(x.make);
    });
    return Array.from(set).sort();
  }, [tip]);

  const models = useMemo(() => {
    const set = new Set();
    LISTINGS.filter((x) => x.type === tip)
      .filter((x) => (make ? x.make === make : true))
      .forEach((x) => {
        if (x.model) set.add(x.model);
      });
    return Array.from(set).sort();
  }, [tip, make]);

  // Filtrirani rezultati
  const results = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    return LISTINGS.filter((x) => x.type === tip)
      .filter((x) => (qq ? (x.title + " " + x.location).toLowerCase().includes(qq) : true))
      .filter((x) => (make ? x.make === make : true))
      .filter((x) => (model ? x.model === model : true))
      .filter((x) => (min != null ? x.price >= min : true))
      .filter((x) => (max != null ? x.price <= max : true));
  }, [tip, q, make, model, minPrice, maxPrice]);

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
              <a href="/objavi">Objavi</a>
            </nav>

            <div className="actions">
              <a className="btn btnPrimary" href="/objavi">
                + Objavi
              </a>
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
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Filtri</div>

              <label style={{ fontSize: 12, color: "var(--muted)" }}>Tip</label>
              <select
                className="select"
                value={tip}
                onChange={(e) => {
                  setTip(e.target.value);
                  setMake("");
                  setModel("");
                }}
              >
                <option value="avti">Avti</option>
                <option value="deli">Deli</option>
              </select>

              <div style={{ height: 10 }} />

              <label style={{ fontSize: 12, color: "var(--muted)" }}>Iskanje</label>
              <input
                className="input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="npr. Golf, platišča..."
              />

              <div style={{ height: 10 }} />

              <label style={{ fontSize: 12, color: "var(--muted)" }}>Znamka</label>
              <select
                className="select"
                value={make}
                onChange={(e) => {
                  setMake(e.target.value);
                  setModel("");
                }}
              >
                <option value="">Vse znamke</option>
                {makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <div style={{ height: 10 }} />

              <label style={{ fontSize: 12, color: "var(--muted)" }}>Model</label>
              <select
                className="select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!make}
              >
                <option value="">{make ? "Vsi modeli" : "Najprej izberi znamko"}</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <div style={{ height: 10 }} />

              <label style={{ fontSize: 12, color: "var(--muted)" }}>Cena (EUR)</label>
              <div className="grid2">
                <input className="input" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="min" />
                <input className="input" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="max" />
              </div>

              <div style={{ height: 10 }} />
              <button
                className="btn"
                onClick={() => {
                  setQ("");
                  setMake("");
                  setModel("");
                  setMinPrice("");
                  setMaxPrice("");
                }}
              >
                Počisti filtre
              </button>

              <p className="smallMuted">
                Naslednji korak: podrobnosti oglasa + prava baza.
              </p>
            </aside>

            <section style={{ display: "grid", gap: 12 }}>
        {results.map((x) => (
  <Link
    href={`/oglasi/${x.id}`}
    key={x.id}
    style={{ textDecoration: "none", color: "inherit" }}
  >
    <div className="item">
      <div className="thumb" />
      <div>
        <p className="itemTitle">{x.title}</p>
        <p className="itemMeta">
          {x.location}
          {x.year ? ` • ${x.year}` : ""}
          {x.km ? ` • ${x.km.toLocaleString("sl-SI")} km` : ""}
          {x.fuel ? ` • ${x.fuel}` : ""}
          {x.condition ? ` • ${x.condition}` : ""}
        </p>
        <div className="price">{eur(x.price)}</div>
      </div>
    </div>
  </Link>
))}

              {results.length === 0 && <div className="card">Ni zadetkov. Poskusi spremeniti filtre.</div>}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}