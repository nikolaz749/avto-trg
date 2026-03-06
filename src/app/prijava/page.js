"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PrijavaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data?.error || "Napaka pri prijavi.");
        return;
      }

      router.push("/"); // ali /oglasi
      router.refresh();
    } catch {
      setErr("Napaka pri povezavi s strežnikom.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 520 }}>
        <h1 className="h2" style={{ marginBottom: 6 }}>
          Prijava
        </h1>
        <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>
          Prijavi se v Avto Trg račun.
        </div>

        <div className="card" style={{ padding: 16 }}>
          {err && (
            <div style={{ marginBottom: 12, color: "#b91c1c", fontWeight: 700 }}>
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="npr. test@test.com"
              required
            />

            <label style={{ fontSize: 12, color: "var(--muted)" }}>Geslo</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="min 6 znakov"
              required
            />

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Prijavljam..." : "Prijavi se"}
            </button>
          </form>

          <div style={{ marginTop: 12, fontSize: 13 }}>
            Nimaš računa?{" "}
            <Link href="/registracija" style={{ color: "#2563eb" }}>
              Registracija
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}