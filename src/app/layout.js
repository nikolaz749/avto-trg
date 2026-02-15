import "./globals.css";

export const metadata = {
  title: "Avto Trg",
  description: "Oglasi za avte in avto dele",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sl">
      <body>{children}</body>
    </html>
  );
}
