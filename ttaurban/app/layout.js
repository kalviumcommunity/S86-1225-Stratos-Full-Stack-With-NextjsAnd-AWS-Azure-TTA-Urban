import "./globals.css";

export const metadata = {
  title: "TTA Urban - Urban Complaint Management System",
  description: "A comprehensive complaint management system for urban areas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
