"use client";

import Link from "next/link";
import { useState } from "react";
import DeleteButton from "./DeleteButton";

function eur(n) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

export default function OglasDetailClient({ oglas, user }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  const isOwner =
    user?.id && oglas.userId && Number(user.id) === Number(oglas.userId);

  const images = Array.isArray(oglas.images) ? oglas.images : [];
  const mainUrl = images?.[activeIdx]?.url || images?.[0]?.url || "";

  return (
    <main className="section">
      <div className="container">
        <div className="detailBackWrap">
          <Link href="/oglasi" className="btn">
            ← Nazaj
          </Link>
        </div>

        <div className="detailTopCard card">
          <div className="detailTopHeader">
            <div>
              <h1 className="detailTitle">{oglas.title}</h1>
              <div className="detailMeta">
                {oglas.location || "Lokacija ni navedena"}
                {oglas.year ? ` • ${oglas.year}` : ""}
                {oglas.km
                  ? ` • ${Number(oglas.km).toLocaleString("sl-SI")} km`
                  : ""}
              </div>
            </div>

            <div className="detailPriceBlock">
              <div className="detailPrice">{eur(oglas.price)}</div>

              {oglas.status === "ACTIVE" && (
                <div className="statusBadge statusActive detailStatusBadge">
                  AKTIVNO
                </div>
              )}

              {oglas.status === "RESERVED" && (
                <div className="statusBadge statusReserved detailStatusBadge">
                  REZERVIRANO
                </div>
              )}

              {oglas.status === "SOLD" && (
                <div className="statusBadge statusSold detailStatusBadge">
                  PRODANO
                </div>
              )}
            </div>
          </div>

          <div className="detailLayout">
            <section className="detailMain">
              {images.length > 0 && (
                <div className="detailGallery">
                  <div className="detailMainImageWrap">
                    <img
                      src={mainUrl}
                      alt={oglas.title || "Slika oglasa"}
                      className="detailMainImage"
                    />

                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveIdx(
                              (i) => (i - 1 + images.length) % images.length
                            )
                          }
                          className="galleryArrow galleryArrowLeft"
                          aria-label="Prejšnja slika"
                        >
                          ‹
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveIdx((i) => (i + 1) % images.length)
                          }
                          className="galleryArrow galleryArrowRight"
                          aria-label="Naslednja slika"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div className="detailThumbs">
                      {images.map((img, idx) => (
                        <button
                          key={img.id ?? `${img.url}-${idx}`}
                          type="button"
                          className={`detailThumbBtn ${
                            idx === activeIdx ? "detailThumbBtnActive" : ""
                          }`}
                          onClick={() => setActiveIdx(idx)}
                        >
                          <img
                            src={img.url}
                            alt={`Slika ${idx + 1}`}
                            className="detailThumbImage"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="card detailInfoCard">
                <h2 className="detailSectionTitle">Podrobnosti oglasa</h2>

                <div className="detailSpecsGrid">
                  <div className="detailSpecItem">
                    <span>Tip</span>
                    <strong>{oglas.type || "—"}</strong>
                  </div>

                  <div className="detailSpecItem">
                    <span>Lokacija</span>
                    <strong>{oglas.location || "—"}</strong>
                  </div>

                  <div className="detailSpecItem">
                    <span>Znamka</span>
                    <strong>{oglas.brand || "—"}</strong>
                  </div>

                  <div className="detailSpecItem">
                    <span>Model</span>
                    <strong>{oglas.model || "—"}</strong>
                  </div>

                  <div className="detailSpecItem">
                    <span>Letnik</span>
                    <strong>{oglas.year ?? "—"}</strong>
                  </div>

                  <div className="detailSpecItem">
                    <span>Kilometri</span>
                    <strong>
                      {oglas.km
                        ? `${Number(oglas.km).toLocaleString("sl-SI")} km`
                        : "—"}
                    </strong>
                  </div>

                  <div className="detailSpecItem">
                    <span>Gorivo</span>
                    <strong>{oglas.fuel || "—"}</strong>
                  </div>

                  <div className="detailSpecItem">
                    <span>Stanje</span>
                    <strong>{oglas.condition || "—"}</strong>
                  </div>
                </div>
              </div>

              {oglas.description ? (
                <div className="card detailDescriptionCard">
                  <h2 className="detailSectionTitle">Opis</h2>
                  <p className="detailDescriptionText">{oglas.description}</p>
                </div>
              ) : null}
            </section>

            <aside className="detailSidebar">
              <div id="kontakt" className="card sellerCard">
                <div className="sellerTop">
                  <div>
                    <div className="sellerTitle">Prodajalec</div>
                    <div className="sellerName">
                      {oglas?.user?.username || "—"}
                    </div>
                  </div>
                </div>

                <div className="sellerContactBlock">
                  <div className="sellerLabel">Telefon</div>

                  {oglas?.user?.phone ? (
                    showPhone ? (
                      <a
                        href={`tel:${String(oglas.user.phone).replace(/\s+/g, "")}`}
                        className="sellerPhoneLink"
                      >
                        {oglas.user.phone}
                      </a>
                    ) : (
                      <button
                        className="btn btnPrimary sellerPhoneBtn"
                        type="button"
                        onClick={() => setShowPhone(true)}
                      >
                        Pokaži telefon
                      </button>
                    )
                  ) : (
                    <div className="sellerMuted">
                      Prodajalec ni dodal telefona.
                    </div>
                  )}
                </div>

                <div className="sellerActions">
                  <button
                    className="btn btnPrimary"
                    type="button"
                    onClick={() => {
                      if (oglas?.user?.phone) setShowPhone(true);
                      const el = document.getElementById("kontakt");
                      if (el) {
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    Kontaktiraj
                  </button>

                  {isOwner && (
                    <>
                      <Link className="btn" href={`/oglasi/${oglas.id}/edit`}>
                        Uredi
                      </Link>
                      <DeleteButton id={oglas.id} />
                    </>
                  )}
                </div>

                {!isOwner && (
                  <div className="sellerMuted sellerFoot">
                    Urejanje in brisanje je na voljo samo lastniku oglasa.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}