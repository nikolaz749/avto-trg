"use client";

export default function DeleteButton({ id }) {
  async function onDelete() {
    if (!confirm("Res želiš izbrisati ta oglas?")) return;

    const res = await fetch(`/api/oglasi/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      window.location.href = "/oglasi";
    } else {
      alert("Brisanje ni uspelo.");
    }
  }

  return (
    <button className="btn" onClick={onDelete}>
      Izbriši
    </button>
  );
}