import "./globals.css";
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Avto Trg",
  description: "Oglasi za avte in avto dele",
  verification: {
    google: "4d9V4MMRV129tfosYSum6_mmd4iUkzwbyb5UBVc-WE8" ,
  },
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