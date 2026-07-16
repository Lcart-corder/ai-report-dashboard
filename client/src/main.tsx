import "./polyfills"; // 古いモバイルSafari対策。必ず最初に読み込む。
import { trpc } from "@/lib/trpc";

// デプロイ跨ぎの自動復旧(白画面対策):
// 再デプロイでJSのハッシュ名が変わると、開きっぱなし/キャッシュ済みのページは
// 旧チャンクの読込に失敗する(vite:preloadError)。その場合は1回だけ強制リロードして
// 新しい index.html とアセット一式を取り直す。無限ループはsessionStorageで防止。
window.addEventListener("vite:preloadError", event => {
  event.preventDefault();
  const KEY = "chunk-reload-at";
  const last = Number(sessionStorage.getItem(KEY) ?? 0);
  if (Date.now() - last > 10_000) {
    sessionStorage.setItem(KEY, String(Date.now()));
    window.location.reload();
  }
});
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
