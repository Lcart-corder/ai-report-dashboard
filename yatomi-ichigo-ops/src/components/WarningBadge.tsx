export function WarningBadge({ message }: { message: string }) {
  return (
    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">
      {message}
    </span>
  );
}
