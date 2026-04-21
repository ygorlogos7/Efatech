export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start print:bg-white print:block">
      {children}
    </div>
  );
}
