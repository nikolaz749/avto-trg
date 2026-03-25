"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CAR_BRANDS } from "@/app/lib/carBrands";

const FEATURED_MODELS = {
  Audi: ["A3", "A4", "Q5"],
  BMW: ["320d", "X3", "X5"],
  Mercedes: ["C 220", "E 220", "GLC"],
  "Mercedes-Benz": ["C 220", "E 220", "GLC"],
  Volkswagen: ["Golf", "Passat", "Tiguan"],
  Renault: ["Clio", "Megane", "Kadjar"],
  Peugeot: ["208", "308", "3008"],
  Škoda: ["Octavia", "Superb", "Kodiaq"],
  Toyota: ["Corolla", "RAV4", "Yaris"],
  Nissan: ["Qashqai", "X-Trail", "Juke"],
};

export default function HomePage() {
  const router = useRouter();
  const brandBoxRef = useRef(null);

  const [make, setMake] = useState("Volkswagen");
  const [model, setModel] = useState("Golf");
  const [condition, setCondition] = useState("rabljeno");

  const [brandOpen, setBrandOpen] = useState(false);
  const [brandQuery, setBrandQuery] = useState("");

  const models = FEATURED_MODELS[make] || ["Vsi modeli"];

  const filteredBrands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    if (!q) return CAR_BRANDS;
    return CAR_BRANDS.filter((brand) => brand.toLowerCase().includes(q));
  }, [brandQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (brandBoxRef.current && !brandBoxRef.current.contains(e.target)) {
        setBrandOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === "Escape") {
        setBrandOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function chooseBrand(nextMake) {
    setMake(nextMake);
    const nextModels = FEATURED_MODELS[nextMake] || ["Vsi modeli"];
    setModel(nextModels[0]);
    setBrandOpen(false);
    setBrandQuery("");
  }

  function goSearch() {
    const params = new URLSearchParams();
    params.set("znamka", make);

    if (model && model !== "Vsi modeli") {
      params.set("model", model);
    }

    params.set("stanje", condition);
    router.push(`/oglasi?${params.toString()}`);
  }

  return (
    <main>
      <section className="hero">
        <div className="container heroGrid">
          <div className="card heroCard">
            <div className="heroBadge">Marketplace za avtomobile in dele</div>

            <h1 className="hTitle">
              Najdi svoj naslednji avto
              <br />
              ali objavi oglas v minuti.
            </h1>

            <p className="hSub">
              Prebrskaj oglase za rabljena in nova vozila, primerjaj ponudbo
              in hitro objavi svoj avto ali dele na Avto Trg.
            </p>

            <div className="heroSearch card">
              <div className="tabs">
                <button
                  type="button"
                  className={`tab ${condition === "rabljeno" ? "tabActive" : ""}`}
                  onClick={() => setCondition("rabljeno")}
                >
                  Rabljeno
                </button>

                <button
                  type="button"
                  className={`tab ${condition === "novo" ? "tabActive" : ""}`}
                  onClick={() => setCondition("novo")}
                >
                  Novo
                </button>
              </div>

              <div className="grid3 heroFormGrid">
                <div
                  ref={brandBoxRef}
                  style={{ position: "relative", width: "100%" }}
                >
                  <button
                    type="button"
                    onClick={() => setBrandOpen((v) => !v)}
                    className="select"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                  >
                    <span>{make || "Izberi znamko"}</span>
                    <span style={{ marginLeft: 10, fontSize: 12 }}>▾</span>
                  </button>

                  {brandOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0,
                        width: "100%",
                        zIndex: 50,
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                        padding: 8,
                      }}
                    >
                      <input
                        className="input"
                        placeholder="Išči znamko..."
                        value={brandQuery}
                        onChange={(e) => setBrandQuery(e.target.value)}
                        autoFocus
                        style={{ marginBottom: 8 }}
                      />

                      <div
                        style={{
                          maxHeight: 220,
                          overflowY: "auto",
                          WebkitOverflowScrolling: "touch",
                          touchAction: "pan-y",
                          borderRadius: 8,
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        {filteredBrands.length === 0 ? (
                          <div
                            style={{
                              padding: "10px 12px",
                              fontSize: 14,
                              color: "var(--muted)",
                            }}
                          >
                            Ni zadetkov.
                          </div>
                        ) : (
                          filteredBrands.map((brand) => (
                            <button
                              key={brand}
                              type="button"
                              onClick={() => chooseBrand(brand)}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "10px 12px",
                                border: "none",
                                borderBottom: "1px solid #f1f5f9",
                                background: brand === make ? "#f5f3ff" : "#fff",
                                cursor: "pointer",
                                fontSize: 14,
                              }}
                            >
                              {brand}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="select"
                >
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn btnPrimary heroSearchBtn"
                  onClick={goSearch}
                >
                  Poišči oglase
                </button>
              </div>

              <p className="smallMuted">
                Hitro iskanje po znamki, modelu in stanju vozila.
              </p>
            </div>

            <div className="heroActions">
              <Link href="/objavi" className="btn btnPrimary">
                Objavi oglas
              </Link>

              <Link href="/oglasi" className="btn">
                Poglej vse oglase
              </Link>
            </div>
          </div>

          <div className="banner">
            <div>
              <h3>Prodaj hitreje. Kupi pametneje.</h3>
              <p>
                Preprosto objavi oglas, dodaj fotografije, spremljaj favorite in
                pregleduj ponudbo vozil ter delov na enem mestu.
              </p>
            </div>

            <div className="heroStats">
              <div className="statCard">
                <strong>✓ Več slik</strong>
                <span>Dodaj več slik in bolje predstavi svoje vozilo</span>
              </div>

              <div className="statCard">
                <strong>✓ Favoriti</strong>
                <span>Shrani zanimive oglase za kasneje</span>
              </div>

              <div className="statCard">
                <strong>✓ Status oglasa</strong>
                <span>ACTIVE, RESERVED ali SOLD</span>
              </div>
            </div>

            <div className="bannerBottom">
              <Link href="/oglasi" className="btn">
                Razišči oglase
              </Link>
              <Link href="/objavi" className="btn btnPrimary">
                Začni prodajati
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="h2">Priljubljene znamke</h2>

          <div className="chips">
            {CAR_BRANDS.slice(0, 12).map((makeName) => (
              <Link
                key={makeName}
                href={`/oglasi?znamka=${encodeURIComponent(makeName)}`}
                className="chip"
              >
                {makeName}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}