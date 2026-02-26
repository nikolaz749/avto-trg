import Link from "next/link";
import { LISTINGS } from "../../lib/listings";

function eur(n) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

export default async function OglasDetailPage({ params }) {
  // ✅ v tvojem primeru je params Promise -> rabimo await
  const { id } = await params;

  const oglas = LISTINGS.find((x) => String(x.id) === String(id));

  if (!oglas) {
    return (
      <main className="section">
        <div className="container">
          <h2 className="h2">Oglas ne obstaja</h2>
          <p className="smallMuted">
            ID: <b>{String(id)}</b>
          </p>
          <Link href="/oglasi" className="btn">
            ← Nazaj na oglase
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <Link href="/oglasi" className="btn" style={{ marginBottom: 16 }}>
          ← Nazaj
        </Link>

        <div className="card" style={{ padding: 24 }}>
          <h1 className="h2" style={{ marginBottom: 8 }}>
            {oglas.title}
          </h1>

          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 18 }}>
            {eur(oglas.price)}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <b>Tip:</b> {oglas.type}
            </div>
            <div>
              <b>Lokacija:</b> {oglas.location}
            </div>

            {oglas.year != null && (
              <div>
                <b>Letnik:</b> {oglas.year}
              </div>
            )}

            {oglas.km != null && (
              <div>
                <b>Kilometri:</b> {Number(oglas.km).toLocaleString("sl-SI")} km
              </div>
            )}

            {oglas.fuel && (
              <div>
                <b>Gorivo:</b> {oglas.fuel}
              </div>
            )}

            {oglas.make && (
              <div>
                <b>Znamka:</b> {oglas.make}
              </div>
            )}

            {oglas.model && (
              <div>
                <b>Model:</b> {oglas.model}
              </div>
            )}

            {oglas.condition && (
              <div>
                <b>Stanje:</b> {oglas.condition}
              </div>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <button className="btn btnPrimary">Kontaktiraj prodajalca</button>
          </div>
        </div>
      </div>
    </main>
  );
}