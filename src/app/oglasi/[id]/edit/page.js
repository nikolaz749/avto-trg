"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditOglasPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [images, setImages] = useState([]);
  const [imgBusy, setImgBusy] = useState(false);
  const [imgErr, setImgErr] = useState("");

  const [form, setForm] = useState({
    title: "",
    price: "",
    location: "",
    year: "",
    km: "",
    fuel: "",
    brand: "",
    model: "",
    condition: "rabljeno",
    type: "avti",
    status: "ACTIVE",
  });

  function setField(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`/api/oglasi/${id}`, { cache: "no-store" });
        if (!res.ok) {
          setErr("Oglas ne obstaja ali napaka pri branju.");
          return;
        }
        const data = await res.json();

        if (!cancelled) {
          setForm({
            title: data.title ?? "",
            price: data.price ?? "",
            location: data.location ?? "",
            year: data.year ?? "",
            km: data.km ?? "",
            fuel: data.fuel ?? "",
            brand: data.brand ?? "",
            model: data.model ?? "",
            condition: data.condition ?? "rabljeno",
            type: data.type ?? "avti",
            status: data.status ?? "ACTIVE",
          });
          setImages(data.images ?? []);

        }
      } catch {
        if (!cancelled) setErr("Napaka pri povezavi s strežnikom.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

        async function deleteImage(imageId) {
          setImgErr("");
          setImgBusy(true);

          try {
            const res = await fetch(`/api/oglasi/${id}/images/${imageId}`, {
              method: "DELETE",
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              setImgErr(data?.error || "Napaka pri brisanju slike.");
              return;
            }

            setImages((prev) => prev.filter((x) => x.id !== imageId));
          } catch {
            setImgErr("Napaka pri povezavi s strežnikom.");
          } finally {
            setImgBusy(false);
          }
        }

        async function addImages(fileList) {
          setImgErr("");
          if (!fileList || fileList.length === 0) return;

          const fd = new FormData();
          Array.from(fileList).forEach((f) => fd.append("images", f));

          setImgBusy(true);
          try {
            const res = await fetch(`/api/oglasi/${id}/images`, {
              method: "POST",
              body: fd,
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              setImgErr(data?.error || "Napaka pri uploadu slik.");
              return;
            }

            setImages(data.images ?? []);
          } catch {
            setImgErr("Napaka pri povezavi s strežnikom.");
          } finally {
            setImgBusy(false);
          }
        }
































































  
  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        year: form.year ? Number(form.year) : null,
        km: form.km ? Number(form.km) : null,
      };

      const res = await fetch(`/api/oglasi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data?.error || "Napaka pri shranjevanju.");
        return;
      }

      router.push(`/oglasi/${data.id}`);
      router.refresh();
    } catch {
      setErr("Napaka pri povezavi s strežnikom.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="section">
        <div className="container">
          <div className="card" style={{ padding: 16 }}>Nalagam...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 12 }}>
          <div>
            <h2 className="h2" style={{ marginBottom: 6 }}>Uredi oglas</h2>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>ID: {String(id)}</div>
          </div>
          <Link className="btn" href={`/oglasi/${id}`}>← Nazaj</Link>
        </div>

        <div className="card" style={{ padding: 16 }}>
          {err && (
            <div style={{ marginBottom: 12, color: "#b91c1c", fontWeight: 700 }}>
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Tip</label>
            <select className="select" value={form.type} onChange={(e) => setField("type", e.target.value)}>
              <option value="avti">Avti</option>
              <option value="deli">Deli</option>
            </select>

            <label style={{ fontSize: 12, color: "var(--muted)" }}>Naslov *</label>
            <input className="input" value={form.title} onChange={(e) => setField("title", e.target.value)} required />

            <label style={{ fontSize: 12, color: "var(--muted)" }}>Cena (EUR) *</label>
            <input className="input" value={form.price} onChange={(e) => setField("price", e.target.value)} required />

            <label style={{ fontSize: 12, color: "var(--muted)" }}>Lokacija</label>
            <input className="input" value={form.location} onChange={(e) => setField("location", e.target.value)} />

            <div className="grid2">
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Letnik</label>
                <input className="input" value={form.year} onChange={(e) => setField("year", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Kilometri</label>
                <input className="input" value={form.km} onChange={(e) => setField("km", e.target.value)} />
              </div>
            </div>

            <div className="grid2">
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Znamka</label>
                <input className="input" value={form.brand} onChange={(e) => setField("brand", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Model</label>
                <input className="input" value={form.model} onChange={(e) => setField("model", e.target.value)} />
              </div>
            </div>

            <div className="grid2">
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Gorivo</label>
                <input className="input" value={form.fuel} onChange={(e) => setField("fuel", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Stanje</label>
                <select className="select" value={form.condition} onChange={(e) => setField("condition", e.target.value)}>
                  <option value="rabljeno">rabljeno</option>
                  <option value="novo">novo</option>
                </select>
              </div>
            </div>
            

          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Slike (max 10) — Izbrano: {images.length} / 10
              </div>

              <label
                className="btn"
                style={{
                  cursor: imgBusy ? "not-allowed" : "pointer",
                  opacity: imgBusy ? 0.6 : 1,
                }}
              >
                Dodaj slike
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  disabled={imgBusy || images.length >= 10}
                  onChange={(e) => {
                    addImages(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {imgErr && (
              <div style={{ marginTop: 8, color: "#b91c1c", fontWeight: 700 }}>
                {imgErr}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                gap: 10,
                marginTop: 10,
              }}
            >
              {images.map((img) => (
                <div
                  key={img.id}
                  style={{
                    position: "relative",
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <img
                    src={img.url}
                    alt=""
                    style={{
                      width: "100%",
                      height: 90,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  <button
                    type="button"
                    className="btn"
                    disabled={imgBusy}
                    onClick={() => deleteImage(img.id)}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      padding: "6px 8px",
                      fontSize: 12,
                      opacity: imgBusy ? 0.6 : 1,
                    }}
                    title="Izbriši sliko"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>    



        <label style={{ fontSize: 12, color: "var(--muted)" }}>
          Status oglasa
        </label>

        <select
          className="select"
          value={form.status}
          onChange={(e) => setField("status", e.target.value)}
        >
          <option value="ACTIVE">Aktiven</option>
          <option value="RESERVED">Rezerviran</option>
          <option value="SOLD">Prodan</option>
        </select>
























            <button className="btn btnPrimary" disabled={saving}>
              {saving ? "Shranjujem..." : "Shrani spremembe"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}