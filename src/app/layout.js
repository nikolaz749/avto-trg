import "./globals.css";
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Avto Trg",
  description: "Oglasi za avte in avto dele",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sl">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}