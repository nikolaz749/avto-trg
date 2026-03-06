"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const MAKES = {
  Audi: ["A3", "A4", "Q5"],
  BMW: ["320d", "X3", "X5"],
  Mercedes: ["C 220", "E 220", "GLC"],
  Volkswagen: ["Golf", "Passat", "Tiguan"],
  Renault: ["Clio", "Megane", "Kadjar"],
  Peugeot: ["208", "308", "3008"],
  Škoda: ["Octavia", "Superb", "Kodiaq"],
  Toyota: ["Corolla", "RAV4", "Yaris"],
  Nissan: ["Qashqai", "X-Trail", "Juke"],
};

export default function HomePage() {
  const router = useRouter();

  const [make, setMake] = useState("Volkswagen");
  const [model, setModel] = useState("Golf");
  const [condition, setCondition] = useState("rabljeno");

  const models = MAKES[make] || [];

  function goSearch() {
    const params = new URLSearchParams();
    params.set("znamka", make);
    params.set("model", model);
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
                <select
                  value={make}
                  onChange={(e) => {
                    const nextMake = e.target.value;
                    setMake(nextMake);
                    setModel(MAKES[nextMake][0]);
                  }}
                  className="select"
                >
                  {Object.keys(MAKES).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

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

                <button type="button" className="btn btnPrimary heroSearchBtn" onClick={goSearch}>
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
            {Object.keys(MAKES).map((makeName) => (
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