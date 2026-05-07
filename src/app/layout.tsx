import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DOJOIA | Disciplina + Conocimiento + Futuro",
  description: "Plataforma educativa premium con IA. Formamos campeones para el futuro en Matemáticas, Inglés, Programación, Robótica y Valores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
