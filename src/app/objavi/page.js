"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ObjaviPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [images, setImages] = useState([]);
  const [me, setMe] = useState(null);
  const [meLoading, setMeLoading] = useState(true);
  const [newPhone, setNewPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        setMeLoading(true);
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json().catch(() => ({ user: null }));
        if (!cancelled) setMe(data?.user || null);
      } catch {
        if (!cancelled) setMe(null);
      } finally {
        if (!cancelled) setMeLoading(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);








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
  });

  function setField(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // 1️ validacija slik
      if (images.length < 1) {
        setErr("Dodaj vsaj 1 sliko.");
        setLoading(false);
        return;
      }
      if (images.length > 10) {
        setErr("Največ 10 slik.");
        setLoading(false);
        return;
      }
      // 2️ FormData
      const fd = new FormData();


      fd.append("title", form.title);
      fd.append("type", form.type);
      fd.append("price", form.price);
      
      fd.append("location", form.location);
      fd.append("year", form.year);
      fd.append("km", form.km);
      fd.append("fuel", form.fuel);
      fd.append("brand", form.brand);
      fd.append("model", form.model);
      fd.append("condition", form.condition);
      // slike
      for (const file of images) {
        fd.append("images", file);
      }
      // 3️ pošlji
      const res = await fetch("/api/oglasi", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      // 4) Error handling
      if (!res.ok) {
        setErr(data?.error || "Napaka pri shranjevanju.");
        return;
      }  
      // 5) Redirect na nov oglas
      router.push(`/oglasi/${data.id}`);
    } catch (err) {
      setErr("Napaka pri povezavi s strežnikom.");
    } finally {
      setLoading(false);
    }
  }
     









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
              Objavi oglas
            </h2>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Shrani v bazo (SQLite)
            </div>
          </div>
          <Link className="btn" href="/">
            ← Nazaj
          </Link>
        </div>
       {/* WARNING če nima telefona */}
       {!meLoading && me && !me.phone && (
         <div
           className="card"
           style={{
             padding: 14,
             marginBottom: 12,
             border: "1px solid #f59e0b",
             background: "#fffbeb",
           }}
         > 
           <div style={{ fontWeight: 800, marginBottom: 4 }}>
             Dodaj telefon, da te kupci lahko kontaktirajo
           </div>
           <div style={{ color: "var(--muted)", fontSize: 13 }}>
             Telefon ni obvezen, ampak brez njega te bodo težje dobili.
           </div>

         <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
           <input
             className="input"
             placeholder="npr. 041123456"
             value={newPhone}
             onChange={(e) => setNewPhone(e.target.value)}
           />

          
          
           <button
             className="btn"
             type="button"
             disabled={savingPhone || !newPhone.trim()}
             onClick={async () => {
                try {
                  setSavingPhone(true);

                  const res = await fetch("/api/auth/me", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: newPhone }),
                  });
                  
                  const data = await res.json();
                  if (res.ok) {
                    setMe(data.user);   
                    setNewPhone("");
                  }
                } finally {
                  setSavingPhone(false);
                }
              }}
             >
              {savingPhone ? "Shranjujem..." : "Shrani"}
              </button>
            </div>

         </div>
       )}
 












       

        <div className="card" style={{ padding: 16 }}>
          {err && (
            <div style={{ marginBottom: 12, color: "#b91c1c", fontWeight: 700 }}>
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <label style={{ fontSize: 12, color: "var(--muted)" }}>Tip</label>
            <select
              className="select"
              value={form.type}
              onChange={(e) => setField("type", e.target.value)}
            >
              <option value="avti">Avti</option>
              <option value="deli">Deli</option>
            </select>

            <label style={{ fontSize: 12, color: "var(--muted)" }}>Naslov *</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="npr. Audi A4 2.0 TDI"
              required
            />

            <label style={{ fontSize: 12, color: "var(--muted)" }}>Cena (EUR) *</label>
            <input
              className="input"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="npr. 14200"
              required
            />
            <label style={{ fontSize: 12, color: "var(--muted)" }}>
              Slike (min 1, max 10) *
            </label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <label className="btn" style={{ cursor: "pointer" }}>
                Izberi slike
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const arr = Array.from(e.target.files || []);

                    setImages((prev) =>  {
                       const merged = [...prev, ...arr].slice(0, 10);
                       return merged;
                     });
                    e.target.value = "";
                  }} 
                />
              </label>
              <div className="smallMuted" style={{ margin: 0 }}>
                {images.length === 0
                  ? "Ni izbranih slik"
                  : `Izbrano: ${images.length} / 10`}
             </div>
           </div>
            {/* PREVIEW SLIK */}
            {images.length > 0 && (
              <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
                {images.map((file, idx) => (
                   <div
                     key={idx}
                     style={{
                       position: "relative",
                       width: 120,
                       height: 90,
                     }}
                   >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                     <button
                       type="button"
                       onClick={() =>
                         setImages((prev) => prev.filter((_, i) => i !== idx))
                       }
                       style={{
                         position: "absolute",
                         top: -6,
                         right: -6,
                         width: 22,
                         height: 22,
                         borderRadius: 999,
                         border: "none",
                         background: "#ef4444",
                         color: "white",
                         fontWeight: "bold",
                         cursor: "pointer",
                       }}
                    >
                       ×
                     </button>
                   </div>
                 ))}
               </div>
              )}



           <div className="smallMuted" style={{ marginTop: 6 }}>
             Na telefonu lahko dodajaš slike večkrat (do 10).
           </div>

           






            <label style={{ fontSize: 12, color: "var(--muted)" }}>Lokacija</label>
            <input
              className="input"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              placeholder="npr. Maribor"
            />

            <div className="grid2">
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Letnik</label>
                <input
                  className="input"
                  value={form.year}
                  onChange={(e) => setField("year", e.target.value)}
                  placeholder="npr. 2016"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Kilometri</label>
                <input
                  className="input"
                  value={form.km}
                  onChange={(e) => setField("km", e.target.value)}
                  placeholder="npr. 178000"
                />
              </div>
            </div>

            <div className="grid2">
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Znamka</label>
                <input
                  className="input"
                  value={form.brand}
                  onChange={(e) => setField("brand", e.target.value)}
                  placeholder="npr. BMW"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Model</label>
                <input
                  className="input"
                  value={form.model}
                  onChange={(e) => setField("model", e.target.value)}
                  placeholder="npr. 320d"
                />
              </div>
            </div>

            <div className="grid2">
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Gorivo</label>
                <input
                  className="input"
                  value={form.fuel}
                  onChange={(e) => setField("fuel", e.target.value)}
                  placeholder="npr. Diesel"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Stanje</label>
                <select
                  className="select"
                  value={form.condition}
                  onChange={(e) => setField("condition", e.target.value)}
                >
                  <option value="rabljeno">rabljeno</option>
                  <option value="novo">novo</option>
                </select>
              </div>
            </div>

            <button className="btn btnPrimary" disabled={loading}>
              {loading ? "Shranjujem..." : "Objavi oglas"}
            </button>

            <div className="smallMuted">*Obvezno: naslov + cena. Ostalo je optional.</div>
          </form>
        </div>
      </div>
    </main>
  );
}