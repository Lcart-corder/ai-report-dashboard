import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlayCircle,
  CheckCircle,
  Clock,
  Star,
  Users,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Share2,
  BookmarkPlus,
  FileText,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

// Mock video data (same as LearningCenter)
const TUTORIAL_VIDEOS = [
  {
    id: "video_1",
    title: "Lカートとは？",
    description: "Lカートの概要とLINE公式アカウントとの違い、できることの全体像を学びます。",
    fullDescription: "このビデオでは、Lカート（エルメ）の基本的な概念と、LINE公式アカウントの標準機能との違いについて詳しく解説します。Lカートを使うことで実現できる高度な機能や、実際のビジネスでの活用事例を紹介します。",
    duration: "3分",
    level: "基礎編",
    levelNumber: 1,
    completed: true,
    thumbnail: "https://placehold.co/1280x720/06C755/FFFFFF?text=Intro+to+L-Cart",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    category: "getting-started",
    views: 1250,
    rating: 4.8,
    likes: 98,
    chapters: [
      { time: "0:00", title: "イントロダクション" },
      { time: "0:30", title: "Lカートとは" },
      { time: "1:15", title: "LINE公式アカウントとの違い" },
      { time: "2:00", title: "できることの全体像" },
      { time: "2:45", title: "まとめ" },
    ],
    keyPoints: [
      "Lカートは LINE公式アカウントの拡張ツール",
      "セグメント配信、タグ管理、詳細分析が可能",
      "EC連携で売上アップを実現",
      "自動化機能で業務効率化",
    ],
    resources: [
      { title: "公式ドキュメント", url: "#" },
      { title: "よくある質問", url: "#" },
      { title: "サンプルシナリオ", url: "#" },
    ],
  },
  {
    id: "video_2",
    title: "初期設定ガイド",
    description: "LINE公式アカウント連携、基本情報の設定、リッチメニューの作成方法を学びます。",
    fullDescription: "Lカートを使い始めるための初期設定を、ステップバイステップで解説します。LINE公式アカウントとの連携方法から、基本情報の入力、最初のリッチメニュー作成まで、実際の画面を見ながら学べます。",
    duration: "5分",
    level: "基礎編",
    levelNumber: 1,
    completed: true,
    thumbnail: "https://placehold.co/1280x720/06C755/FFFFFF?text=Setup+Guide",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "getting-started",
    views: 1180,
    rating: 4.9,
    likes: 112,
    chapters: [
      { time: "0:00", title: "イントロダクション" },
      { time: "0:20", title: "LINE公式アカウント連携" },
      { time: "1:30", title: "基本情報の設定" },
      { time: "3:00", title: "リッチメニューの作成" },
      { time: "4:30", title: "まとめ" },
    ],
    keyPoints: [
      "LINE公式アカウントの連携は3ステップで完了",
      "基本情報は後から変更可能",
      "リッチメニューはテンプレートから選択できる",
      "初期設定は10分程度で完了",
    ],
    resources: [
      { title: "設定チェックリスト", url: "#" },
      { title: "リッチメニューテンプレート集", url: "#" },
    ],
  },
  {
    id: "video_3",
    title: "友だちを増やす方法",
    description: "QRコード設置、友だち追加広告の基本、流入経路分析の見方を学びます。",
    fullDescription: "友だちを効率的に増やすための具体的な施策を紹介します。QRコードの効果的な設置場所、友だち追加広告の出稿方法、流入経路分析を使った改善方法まで、実践的なノウハウを解説します。",
    duration: "7分",
    level: "基礎編",
    levelNumber: 1,
    completed: true,
    thumbnail: "https://placehold.co/1280x720/06C755/FFFFFF?text=Grow+Friends",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "marketing",
    views: 1420,
    rating: 4.7,
    likes: 134,
    chapters: [
      { time: "0:00", title: "イントロダクション" },
      { time: "0:30", title: "QRコードの活用" },
      { time: "2:00", title: "友だち追加広告" },
      { time: "4:30", title: "流入経路分析" },
      { time: "6:30", title: "まとめ" },
    ],
    keyPoints: [
      "QRコードは店舗・商品・SNSに設置",
      "友だち追加広告は少額から開始可能",
      "流入経路分析で効果測定",
      "継続的な改善が重要",
    ],
    resources: [
      { title: "QRコード設置ガイド", url: "#" },
      { title: "広告運用チェックリスト", url: "#" },
    ],
  },
];

export default function VideoDetailPage() {
  const [, params] = useRoute("/learning/video/:id");
  const videoId = params?.id || "video_1";
  
  const video = TUTORIAL_VIDEOS.find((v) => v.id === videoId) || TUTORIAL_VIDEOS[0];
  const currentIndex = TUTORIAL_VIDEOS.findIndex((v) => v.id === videoId);
  const prevVideo = currentIndex > 0 ? TUTORIAL_VIDEOS[currentIndex - 1] : null;
  const nextVideo = currentIndex < TUTORIAL_VIDEOS.length - 1 ? TUTORIAL_VIDEOS[currentIndex + 1] : null;

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    setHasLiked(!hasLiked);
    toast.success(hasLiked ? "いいねを取り消しました" : "いいねしました");
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "ブックマークを削除しました" : "ブックマークに追加しました");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("リンクをコピーしました");
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "基礎編":
        return "bg-green-100 text-green-700";
      case "実践編":
        return "bg-blue-100 text-blue-700";
      case "応用編":
        return "bg-purple-100 text-purple-700";
      case "マスター編":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <Link href="/learning">
          <Button variant="ghost" className="gap-2 mb-2">
            <ChevronLeft className="w-4 h-4" />
            学習センターに戻る
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Video Player */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              {/* Video placeholder - replace with actual video player */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <PlayCircle className="w-20 h-20 mx-auto mb-4 opacity-70" />
                  <p className="text-lg font-medium">動画プレーヤー</p>
                  <p className="text-sm opacity-70 mt-1">実際の動画はここに表示されます</p>
                </div>
              </div>
              {/* Uncomment to use YouTube embed */}
              {/* <iframe
                className="w-full h-full"
                src={video.videoUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              /> */}
            </div>
          </Card>

          {/* Video Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getLevelColor(video.level)}>{video.level}</Badge>
                        {video.completed && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            視聴済み
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl mb-2">{video.title}</CardTitle>
                      <CardDescription className="text-base">{video.description}</CardDescription>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{video.views.toLocaleString()}回視聴</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{video.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{video.rating}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant={hasLiked ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      onClick={handleLike}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      いいね {hasLiked ? video.likes + 1 : video.likes}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                      共有
                    </Button>
                    <Button
                      variant={isBookmarked ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      onClick={handleBookmark}
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      {isBookmarked ? "保存済み" : "保存"}
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">概要</TabsTrigger>
                  <TabsTrigger value="chapters">チャプター</TabsTrigger>
                  <TabsTrigger value="resources">リソース</TabsTrigger>
                  <TabsTrigger value="comments">コメント</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Card>
                    <CardHeader>
                      <CardTitle>動画の概要</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">{video.fullDescription}</p>
                      
                      <div>
                        <h4 className="font-semibold mb-2">重要ポイント</h4>
                        <ul className="space-y-2">
                          {video.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="chapters">
                  <Card>
                    <CardHeader>
                      <CardTitle>チャプター</CardTitle>
                      <CardDescription>クリックして該当箇所にジャンプ</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {video.chapters.map((chapter, index) => (
                          <button
                            key={index}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                              {chapter.time}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{chapter.title}</div>
                            </div>
                            <PlayCircle className="w-5 h-5 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources">
                  <Card>
                    <CardHeader>
                      <CardTitle>関連リソース</CardTitle>
                      <CardDescription>この動画に関連するドキュメントやツール</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {video.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="w-5 h-5 text-gray-400" />
                            <span className="flex-1 font-medium text-gray-900">{resource.title}</span>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comments">
                  <Card>
                    <CardHeader>
                      <CardTitle>コメント</CardTitle>
                      <CardDescription>質問や感想を共有しましょう</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>コメント機能は準備中です</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">次の動画</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {nextVideo && (
                    <Link href={`/learning/video/${nextVideo.id}`}>
                      <div className="p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getLevelColor(nextVideo.level)}>
                            {nextVideo.level}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{nextVideo.title}</h4>
                        <p className="text-xs text-gray-500">{nextVideo.duration}</p>
                      </div>
                    </Link>
                  )}
                  {prevVideo && (
                    <Link href={`/learning/video/${prevVideo.id}`}>
                      <div className="p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="text-xs text-gray-500 mb-1">前の動画</div>
                        <h4 className="font-medium text-gray-900">{prevVideo.title}</h4>
                      </div>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">学習進捗</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">基礎編</span>
                        <span className="font-medium">3/3 完了</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">実践編</span>
                        <span className="font-medium">2/3 完了</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">応用編</span>
                        <span className="font-medium">0/3 完了</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
