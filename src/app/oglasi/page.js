"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function eur(n) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

function OglasiPageContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const urlTip = sp.get("tip") || "avti";
  const urlQ = sp.get("q") || "";
  const urlMake = sp.get("znamka") || "";
  const urlModel = sp.get("model") || "";
  const urlCondition = sp.get("stanje") || "";

  const [tip, setTip] = useState(urlTip);
  const [q, setQ] = useState(urlQ);
  const [make, setMake] = useState(urlMake);
  const [model, setModel] = useState(urlModel);
  const [condition, setCondition] = useState(urlCondition);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(Math.max(1, Number(sp.get("page") || 1)));
  const [totalPages, setTotalPages] = useState(1);

  const [favoriteIds, setFavoriteIds] = useState(new Set());
 useEffect(() => {
  setTip(sp.get("tip") || "avti");
  setQ(sp.get("q") || "");
  setMake(sp.get("znamka") || "");
  setModel(sp.get("model") || "");
  setCondition(sp.get("stanje") || "");
  setMinPrice(sp.get("minPrice") || "");
  setMaxPrice(sp.get("maxPrice") || "");
  setPage(Math.max(1, Number(sp.get("page") || 1)));
 }, [sp]);

 useEffect(() => {
  const params = new URLSearchParams();

   if (tip && tip !== "avti") params.set("tip", tip);
   if (q.trim()) params.set("q", q.trim());
   if (make) params.set("znamka", make);
   if (model) params.set("model", model);
   if (condition) params.set("stanje", condition);
   if (minPrice) params.set("minPrice", minPrice);
   if (maxPrice) params.set("maxPrice", maxPrice);
   if (page > 1) params.set("page", String(page));

   const qs = params.toString();
   router.replace(qs ? `/oglasi?${qs}` : "/oglasi", { scroll: false });
 }, [router, tip, q, make, model, condition, minPrice, maxPrice, page]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "12");

        if (tip) params.set("tip", tip);
        if (q.trim()) params.set("q", q.trim());
        if (make) params.set("znamka", make);
        if (model) params.set("model", model);
        if (condition) params.set("stanje", condition);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);

        const res = await fetch(`/api/oglasi?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!cancelled) {
          setListings(Array.isArray(data.items) ? data.items : []);
          setTotalPages(data.totalPages ?? 1);
        }

        try {
          const favRes = await fetch("/api/favorites/ids", {
            cache: "no-store",
          });
          const favData = await favRes.json();

          if (!cancelled) {
            setFavoriteIds(new Set(Array.isArray(favData.ids) ? favData.ids : []));
          }
        } catch {
          if (!cancelled) setFavoriteIds(new Set());
        }
      } catch {
        if (!cancelled) {
          setListings([]);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [page, tip, q, make, model, condition, minPrice, maxPrice]);

  async function toggleFavorite(listingId) {
    try {
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || "Napaka pri favoritih.");
        return;
      }

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (data.favorited) next.add(listingId);
        else next.delete(listingId);
        return next;
      });
    } catch {
      alert("Napaka pri povezavi s strežnikom.");
    }
  }

  const makes = useMemo(() => {
    const set = new Set();

    listings.forEach((x) => {
      if (x.brand) set.add(x.brand);
    });

    return Array.from(set).sort();
  }, [listings]);

  const models = useMemo(() => {
    const set = new Set();

    listings
      .filter((x) => (make ? x.brand === make : true))
      .forEach((x) => {
        if (x.model) set.add(x.model);
      });

    return Array.from(set).sort();
  }, [listings, make]);

  const results = listings;

  return (
    <main className="section">
      <div className="container">
        <div className="listingsTop">
          <div>
            <h1 className="listingsTitle">Oglasi</h1>
            <p className="listingsMeta">
              Tip: <strong>{tip === "avti" ? "Avti" : "Deli & oprema"}</strong>
              <span className="listingsDot">•</span>
              Najdeno: <strong>{results.length}</strong>
            </p>
          </div>
        </div>

        <div className="layout">
          <aside className="sidebar">
            <div className="card filtersCard">
              <div className="filtersHeader">
                <div className="filtersTitle">Filtri</div>
                <div className="filtersHint">Prilagodi prikaz oglasov</div>
              </div>
                  
               <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
  {make && (
    <button
      type="button"
      onClick={() => {
        setMake("");
        setModel("");
        setPage(1);
      }}
      style={{
        border: "1px solid #e5e7eb",
        background: "#f8fafc",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {make} ✕
    </button>
  )}

  {model && (
    <button
      type="button"
      onClick={() => {
        setModel("");
        setPage(1);
      }}
      style={{
        border: "1px solid #e5e7eb",
        background: "#f8fafc",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {model} ✕
    </button>
  )}

  {condition && (
    <button
      type="button"
      onClick={() => {
        setCondition("");
        setPage(1);
      }}
      style={{
        border: "1px solid #e5e7eb",
        background: "#f8fafc",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {condition} ✕
    </button>
  )}

  {minPrice && (
    <button
      type="button"
      onClick={() => {
        setMinPrice("");
        setPage(1);
      }}
      style={{
        border: "1px solid #e5e7eb",
        background: "#f8fafc",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      od {minPrice} € ✕
    </button>
  )}

  {maxPrice && (
    <button
      type="button"
      onClick={() => {
        setMaxPrice("");
        setPage(1);
      }}
      style={{
        border: "1px solid #e5e7eb",
        background: "#f8fafc",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      do {maxPrice} € ✕
    </button>
  )}
</div>

              <div className="filterGroup">
                <label className="filterLabel">Tip</label>
                <select
                  className="select"
                  value={tip}
                  onChange={(e) => {
                    setTip(e.target.value);
                    setMake("");
                    setModel("");
                    setCondition("");
                    setPage(1);
                  }}
                >
                  <option value="avti">Avti</option>
                  <option value="deli">Deli</option>
                </select>
              </div>

              <div className="filterGroup">
                <label className="filterLabel">Iskanje</label>
                <input
                  className="input"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="npr. Golf, platišča..."
                />
              </div>

              <div className="filterGroup">
                <label className="filterLabel">Znamka</label>
                <select
                  className="select"
                  value={make}
                  onChange={(e) => {
                    setMake(e.target.value);
                    setModel("");
                    setPage(1);
                  }}
                >
                  <option value="">Vse znamke</option>
                  {makes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filterGroup">
                <label className="filterLabel">Model</label>
                <select
                  className="select"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setPage(1);
                  }}
                  disabled={!make}
                >
                  <option value="">
                    {make ? "Vsi modeli" : "Najprej izberi znamko"}
                  </option>
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filterGroup">
                <label className="filterLabel">Stanje</label>
                <select
                  className="select"
                  value={condition}
                  onChange={(e) => {
                    setCondition(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Vsa stanja</option>
                  <option value="rabljeno">Rabljeno</option>
                  <option value="novo">Novo</option>
                </select>
              </div>

              <div className="filterGroup">
                <label className="filterLabel">Cena (EUR)</label>
                <div className="priceRow">
                  <input
                    className="input"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder="min"
                  />
                  <input
                    className="input"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder="max"
                  />
                </div>
              </div>

              <button
                className="btn filtersReset"
                type="button"
                onClick={() => {
                  setQ("");
                  setMake("");
                  setModel("");
                  setCondition("");
                  setMinPrice("");
                  setMaxPrice("");
                  setPage(1);
                }}
              >
                Počisti filtre
              </button>

              <p className="smallMuted filtersFoot">
                {loading ? "Nalagam oglase..." : "Prikaz rezultatov iz baze."}
              </p>
            </div>
          </aside>

          <section>
            {loading && <div className="card stateCard">Nalagam oglase...</div>}

            {!loading && results.length === 0 && (
              <div className="card stateCard">
                Ni zadetkov. Poskusi spremeniti filtre.
              </div>
            )}

            {!loading && results.length > 0 && (
              <>
                <div className="gridListings">
                  {results.map((x) => (
                    <Link
                      href={`/oglasi/${x.id}`}
                      key={x.id}
                      className="listingLink"
                    >
                      <article className="card listingCard">
                        <div className="listingThumbWrap">
                          {x.images?.[0]?.url ? (
                            <img
                              src={x.images[0].url}
                              alt={x.title || "Oglas"}
                              className="listingThumb"
                            />
                          ) : (
                            <div className="listingThumbPlaceholder">
                              Brez slike
                            </div>
                          )}

                          {x.status === "SOLD" && (
                            <div className="statusBadge statusSold">PRODANO</div>
                          )}

                          {x.status === "RESERVED" && (
                            <div className="statusBadge statusReserved">
                              REZERVIRANO
                            </div>
                          )}

                          {x.status === "ACTIVE" && (
                            <div className="statusBadge statusActive">AKTIVNO</div>
                          )}

                          <button
                            type="button"
                            title="Dodaj med favoriti"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorite(x.id);
                            }}
                            className={`favoriteBtn ${
                              favoriteIds.has(x.id) ? "favoriteBtnActive" : ""
                            }`}
                          >
                            {favoriteIds.has(x.id) ? "❤" : "♡"}
                          </button>
                        </div>

                        <div className="listingBody">
                          <h3 className="listingTitle">{x.title}</h3>

                          <div className="listingMeta">
                            {x.location || "Lokacija ni navedena"}
                            {x.year ? ` • ${x.year}` : ""}
                            {x.km
                              ? ` • ${Number(x.km).toLocaleString("sl-SI")} km`
                              : ""}
                          </div>

                          <div className="listingPrice">{eur(x.price)}</div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                <div className="paginationWrap">
                  <button
                    className="btn paginationBtn"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Prejšnja
                  </button>

                  <div className="paginationInfo">
                    Stran <strong>{page}</strong> / <strong>{totalPages}</strong>
                  </div>

                  <button
                    className="btn paginationBtn"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Naslednja →
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function OglasiPage() {
  return (
    <Suspense
      fallback={
        <main className="section">
          <div className="container">
            <div className="card stateCard">Nalagam oglase...</div>
          </div>
        </main>
      }
    >
      <OglasiPageContent />
    </Suspense>
  );
}