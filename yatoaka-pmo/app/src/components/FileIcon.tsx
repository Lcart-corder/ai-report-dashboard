export function FileIcon({ kind, size = 34 }: { kind: string; size?: number }) {
  const k = kind.toLowerCase();
  const color =
    k === "pdf"
      ? "bg-red-500"
      : k === "xlsx"
        ? "bg-green-600"
        : k === "pptx"
          ? "bg-orange-500"
          : k === "docx"
            ? "bg-blue-600"
            : "bg-slate-400";
  const label =
    k === "pdf" ? "PDF" : k === "xlsx" ? "XLS" : k === "pptx" ? "PPT" : k === "docx" ? "DOC" : "FILE";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg font-bold text-white ${color}`}
      style={{ width: size, height: size, fontSize: size * 0.26 }}
    >
      {label}
    </span>
  );
}
