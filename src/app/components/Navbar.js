"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/oglasi");
    router.refresh();
  }

  function isActive(href) {
    if (href === "/oglasi") return pathname === "/oglasi";
    return pathname?.startsWith(href);
  }

  return (
    <header className="topbar">
      <div className="container navShell">

        {/* LOGO */}
        <Link href="/" className="brand">
          <img
            src="/logo.png"
            alt="Avto Trg"
            style={{
              height: "110px",
              width: "auto",
              display: "block",
              objectFit: "contain"
            
            }}
              className="logo"
          />
        </Link>

        {/* NAV MENU */}
        <nav className="navMenu">

          <Link
            className={`navBtn ${isActive("/oglasi") ? "navBtnActive" : ""}`}
            href="/oglasi"
          >
            Oglasi
          </Link>

          <Link
            className={`navBtn navBtnPrimary ${
              isActive("/objavi") ? "navBtnPrimaryActive" : ""
            }`}
            href="/objavi"
          >
            + Objavi
          </Link>

          {loading ? null : user ? (
            <>
              <Link
                className={`navBtn ${
                  isActive("/moji-oglasi") ? "navBtnActive" : ""
                }`}
                href="/moji-oglasi"
              >
                Moji oglasi
              </Link>

              <Link
                className={`navBtn ${
                  isActive("/moji-favoriti") ? "navBtnActive" : ""
                }`}
                href="/moji-favoriti"
              >
                ❤️ Favoriti
              </Link>

              <button className="navBtn" type="button" onClick={logout}>
                Odjava
              </button>
            </>
          ) : (
            <>
              <Link
                className={`navBtn ${
                  isActive("/prijava") ? "navBtnActive" : ""
                }`}
                href="/prijava"
              >
                Prijava
              </Link>

              <Link
                className={`navBtn ${
                  isActive("/registracija") ? "navBtnActive" : ""
                }`}
                href="/registracija"
              >
                Registracija
              </Link>
            </>
          )}

        </nav>
      </div>
    </header>
  );
}