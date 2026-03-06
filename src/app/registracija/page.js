"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistracijaPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data?.error || "Napaka pri registraciji.");
        return;
      }

      router.push("/oglasi");
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
          Registracija
        </h1>

        <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>
          Ustvari račun (email + username + geslo). Telefon je opcijski.
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

            <label style={{ fontSize: 12, color: "var(--muted)" }}>Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="npr. marko123"
              required
              minLength={3}
            />

            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: -6 }}>
              Brez presledkov, min 3 znaki (priporočeno: male črke + številke).
            </div>

            <label style={{ fontSize: 12, color: "var(--muted)" }}>
              Telefon (opcijsko)
            </label>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="npr. 041 123 456"
            />

            <label style={{ fontSize: 12, color: "var(--muted)" }}>Geslo</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="min 6 znakov"
              required
              minLength={6}
            />

            <button className="btn btnPrimary" type="submit" disabled={loading}>
              {loading ? "Ustvarjam..." : "Ustvari račun"}
            </button>
          </form>

          <div style={{ marginTop: 12, fontSize: 13 }}>
            Imaš račun?{" "}
            <Link href="/prijava" style={{ color: "#2563eb" }}>
              Prijava
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}