import Link from "next/link";
import { artworkRepository } from "@/repository/artworkRepository";
import type { Artwork } from "@/lib/types";

/** ステータスに応じたバッジの色とラベル */
function StatusBadge({ status }: { status: Artwork["status"] }) {
  const styles: Record<Artwork["status"], string> = {
    vr_ready: "bg-green-100 text-green-700",
    analyzing: "bg-yellow-100 text-yellow-700",
    pending: "bg-gray-100 text-gray-500",
    error: "bg-red-100 text-red-600",
  };
  const labels: Record<Artwork["status"], string> = {
    vr_ready: "VR対応",
    analyzing: "解析中",
    pending: "待機中",
    error: "エラー",
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? styles.pending}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

/** カラーパレットのプレビュードット */
function ColorDots({ colors }: { colors: string }) {
  const list = colors ? colors.split(",").map((c) => c.trim()) : [];
  return (
    <div className="flex gap-1">
      {list.map((c, i) => (
        <span
          key={i}
          className="inline-block h-4 w-4 rounded-full border border-white shadow-sm"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

export default async function GalleryPage() {
  const artworks = await artworkRepository.getAll();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-cyan-800">ギャラリー</h1>
      <p className="mb-8 text-sm text-gray-500">
        みんなのおえかきから生まれた金魚たち
      </p>

      {artworks.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <p className="text-lg text-gray-400">
            まだアートワークがありません。おえかきをアップロードしてみよう！
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artworks.map((artwork) => (
            <article
              key={artwork.artwork_id}
              className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-lg"
            >
              {/* サムネイル領域 */}
              <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-cyan-100 to-sky-200">
                {artwork.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-5xl opacity-60">🐟</span>
                )}
                <div className="absolute right-2 top-2">
                  <StatusBadge status={artwork.status} />
                </div>
              </div>

              {/* カード本文 */}
              <div className="p-4">
                <h2 className="mb-1 text-base font-bold text-gray-800">
                  {artwork.title}
                </h2>
                <p className="mb-3 text-xs text-gray-400">
                  by {artwork.child_name}
                </p>

                <div className="mb-3 flex items-center justify-between">
                  <ColorDots colors={artwork.primary_colors} />
                  {artwork.mood_tags && (
                    <span className="text-xs text-gray-400">
                      {artwork.mood_tags}
                    </span>
                  )}
                </div>

                {artwork.status === "vr_ready" ? (
                  <Link
                    href={`/vr/${artwork.artwork_id}`}
                    className="block rounded-lg bg-cyan-600 py-2 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
                  >
                    VRで見る
                  </Link>
                ) : (
                  <span className="block rounded-lg bg-gray-100 py-2 text-center text-sm text-gray-400">
                    準備中…
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
