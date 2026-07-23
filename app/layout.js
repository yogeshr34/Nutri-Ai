import "./globals.css";

export const metadata = {
  title: "NutriAI — AI-Powered Nutrition Analysis",
  description: "Analyze any meal instantly with Google Gemini.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-paper min-h-screen text-graphite">
        {children}
      </body>
    </html>
  );
}
