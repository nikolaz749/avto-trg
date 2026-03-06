"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PrijavaPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Napaka pri prijavi");
        setLoading(false);
        return;
      }

      router.push("/oglasi");
      router.refresh();
    } catch (err) {
      setError("Napaka pri prijavi.");
    }

    setLoading(false);
  }

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 40 }}>
      <h1 style={{ marginBottom: 20 }}>Prijava</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Geslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #ccc",
          }}
        />

        {error && (
          <div style={{ color: "red", fontSize: 14 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            minHeight: "48px",
            borderRadius: "14px",
            background: "#4f46e5",
            color: "#ffffff",
            fontWeight: "700",
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Prijava..." : "Prijava"}
        </button>

      </form>
    </div>
  );
}