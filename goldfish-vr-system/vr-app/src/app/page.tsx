import Link from "next/link";

/** GAS Web App のアップロードページ URL */
const UPLOAD_URL = process.env.NEXT_PUBLIC_GAS_WEBAPP_URL ?? "#";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* ヒーローセクション */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-extrabold leading-tight text-cyan-800 sm:text-5xl">
          おえかきが、
          <br className="sm:hidden" />
          <span className="text-orange-500">金魚</span>になって泳ぎだす
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
          子どもたちが描いた絵をAIが解析し、世界にひとつだけの金魚を生成。
          VR空間でその金魚が優雅に泳ぐ姿を体験できます。
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/gallery"
            className="inline-block rounded-full bg-cyan-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-700"
          >
            ギャラリーを見る
          </Link>
          <a
            href={UPLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border-2 border-cyan-600 px-8 py-3 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-50"
          >
            おえかきをアップロード
          </a>
        </div>
      </section>

      {/* ステップ説明 */}
      <section className="mb-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-gray-700">
          たったの3ステップ
        </h2>

        <div className="grid gap-8 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-2xl bg-white p-6 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl">
              🎨
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">
              1. おえかきする
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              紙やタブレットで自由に金魚の絵を描きます。どんな金魚でもOK！
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl bg-white p-6 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100 text-2xl">
              🤖
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">
              2. AIが解析
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              アップロードされた絵をAIが読み取り、色・形・性格などのパラメータを抽出します。
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl bg-white p-6 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-2xl">
              🥽
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">
              3. VRで泳ぐ
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              自分だけの金魚がVR空間の水の中で泳ぎ出します。ブラウザやVRヘッドセットで体験！
            </p>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="rounded-2xl bg-white/60 p-8 shadow-sm">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-700">
          システムの特徴
        </h2>
        <ul className="mx-auto grid max-w-3xl gap-4 text-sm leading-relaxed text-gray-600 sm:grid-cols-2">
          <li className="flex gap-3">
            <span className="mt-0.5 text-cyan-500">●</span>
            <span>Google Apps Script で手軽にデータ管理</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-cyan-500">●</span>
            <span>Gemini AI による高精度な絵の解析</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-cyan-500">●</span>
            <span>Three.js でリアルタイム3Dレンダリング</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-cyan-500">●</span>
            <span>WebXR で VR ヘッドセット対応</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-cyan-500">●</span>
            <span>パラメトリック生成で一匹ずつ違う金魚</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-cyan-500">●</span>
            <span>ブラウザだけで動く — インストール不要</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
