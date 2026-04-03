import type { Artwork } from "@/lib/types";
import { fetchArtworks, fetchArtwork } from "@/lib/api";

/**
 * アートワーク リポジトリ
 * 将来的にDBへ移行する際、このレイヤーのみ変更すればよい
 */
export const artworkRepository = {
  /**
   * 全アートワークを取得
   */
  async getAll(): Promise<Artwork[]> {
    try {
      return await fetchArtworks();
    } catch (error) {
      console.error("アートワーク一覧の取得に失敗:", error);
      return [];
    }
  },

  /**
   * IDで単一のアートワークを取得
   */
  async getById(id: string): Promise<Artwork | null> {
    try {
      return await fetchArtwork(id);
    } catch (error) {
      console.error(`アートワーク(${id})の取得に失敗:`, error);
      return null;
    }
  },

  /**
   * VR表示可能なアートワークのみ取得
   */
  async getVRReady(): Promise<Artwork[]> {
    const all = await this.getAll();
    return all.filter((a) => a.status === "vr_ready");
  },
};
