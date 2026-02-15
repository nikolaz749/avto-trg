"use client";

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

  const models = MAKES[make];

  function goSearch() {
    const params = new URLSearchParams();
    params.set("znamka", make);
    params.set("model", model);
    params.set("stanje", condition);

    router.push(`/oglasi?${params.toString()}`);
  }

  return (
    <main style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>AVTO TRG</h1>
        <p style={styles.subtitle}>
          Oglasi za avtomobile in avtomobilske dele
        </p>

        <div style={styles.form}>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            style={styles.input}
          >
            <option value="rabljeno">Rabljeno</option>
            <option value="novo">Novo</option>
          </select>

          <select
            value={make}
            onChange={(e) => {
              setMake(e.target.value);
              setModel(MAKES[e.target.value][0]);
            }}
            style={styles.input}
          >
            {Object.keys(MAKES).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={styles.input}
          >
            {models.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <button onClick={goSearch} style={styles.button}>
            Poišči oglase
          </button>
        </div>

        <div style={styles.actions}>
          <a href="/objavi" style={styles.linkPrimary}>
            Objavi oglas
          </a>
          <a href="/oglasi" style={styles.link}>
            Poglej vse oglase
          </a>
        </div>
      </div>
    </main>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#111",
    color: "white",
    fontFamily: "system-ui",
  },
  card: {
    background: "#1a1a1a",
    padding: 40,
    borderRadius: 12,
    width: 400,
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 30,
    opacity: 0.7,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "none",
  },
  button: {
    padding: 12,
    borderRadius: 6,
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  actions: {
    marginTop: 25,
    display: "flex",
    justifyContent: "space-between",
  },
  linkPrimary: {
    color: "#60a5fa",
    textDecoration: "none",
  },
  link: {
    color: "#aaa",
    textDecoration: "none",
  },
};
