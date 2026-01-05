import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  PlayCircle,
  CheckCircle,
  Lock,
  Award,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Search,
  Clock,
  Star,
} from "lucide-react";

// Mock data for tutorial videos
const TUTORIAL_VIDEOS = [
  // Level 1: 基礎編
  {
    id: "video_1",
    title: "Lカートとは？",
    description: "Lカートの概要とLINE公式アカウントとの違い、できることの全体像",
    duration: "3分",
    level: "基礎編",
    levelNumber: 1,
    completed: true,
    thumbnail: "https://placehold.co/320x180/06C755/FFFFFF?text=Intro",
    category: "getting-started",
    views: 1250,
    rating: 4.8,
  },
  {
    id: "video_2",
    title: "初期設定ガイド",
    description: "LINE公式アカウント連携、基本情報の設定、リッチメニューの作成",
    duration: "5分",
    level: "基礎編",
    levelNumber: 1,
    completed: true,
    thumbnail: "https://placehold.co/320x180/06C755/FFFFFF?text=Setup",
    category: "getting-started",
    views: 1180,
    rating: 4.9,
  },
  {
    id: "video_3",
    title: "友だちを増やす方法",
    description: "QRコード設置、友だち追加広告の基本、流入経路分析の見方",
    duration: "7分",
    level: "基礎編",
    levelNumber: 1,
    completed: true,
    thumbnail: "https://placehold.co/320x180/06C755/FFFFFF?text=Friends",
    category: "marketing",
    views: 1420,
    rating: 4.7,
  },
  // Level 2: 実践編
  {
    id: "video_4",
    title: "一斉配信とステップ配信",
    description: "効果的な配信タイミング、ステップシナリオの設計、開封率を上げるコツ",
    duration: "8分",
    level: "実践編",
    levelNumber: 2,
    completed: true,
    thumbnail: "https://placehold.co/320x180/00B900/FFFFFF?text=Broadcast",
    category: "messaging",
    views: 980,
    rating: 4.9,
  },
  {
    id: "video_5",
    title: "セグメント配信とタグ管理",
    description: "タグの付け方・活用法、友だち情報の収集、セグメント別配信の実例",
    duration: "10分",
    level: "実践編",
    levelNumber: 2,
    completed: true,
    thumbnail: "https://placehold.co/320x180/00B900/FFFFFF?text=Segment",
    category: "messaging",
    views: 850,
    rating: 4.8,
  },
  {
    id: "video_6",
    title: "クーポンとフォーム活用",
    description: "クーポンの作成と配信、回答フォームの設計、初回購入促進施策",
    duration: "7分",
    level: "実践編",
    levelNumber: 2,
    completed: false,
    thumbnail: "https://placehold.co/320x180/00B900/FFFFFF?text=Coupon",
    category: "conversion",
    views: 720,
    rating: 4.7,
  },
  // Level 3: 応用編
  {
    id: "video_7",
    title: "エルメアクションで自動化",
    description: "アクションビルダーの使い方、自動タグ付与、条件分岐の設定",
    duration: "12分",
    level: "応用編",
    levelNumber: 3,
    completed: false,
    thumbnail: "https://placehold.co/320x180/0099CC/FFFFFF?text=Action",
    category: "automation",
    views: 650,
    rating: 4.9,
  },
  {
    id: "video_8",
    title: "データ分析とKPI管理",
    description: "ダッシュボードの見方、重要KPIの設定、AI分析レポートの活用",
    duration: "10分",
    level: "応用編",
    levelNumber: 3,
    completed: false,
    thumbnail: "https://placehold.co/320x180/0099CC/FFFFFF?text=Analytics",
    category: "analytics",
    views: 580,
    rating: 4.8,
  },
  {
    id: "video_9",
    title: "EC連携の完全活用",
    description: "Shopify/楽天連携設定、購入データの活用、カゴ落ち対策の実装",
    duration: "15分",
    level: "応用編",
    levelNumber: 3,
    completed: false,
    thumbnail: "https://placehold.co/320x180/0099CC/FFFFFF?text=EC",
    category: "integration",
    views: 520,
    rating: 4.7,
  },
  // Level 4: マスター編
  {
    id: "video_10",
    title: "リピーター育成戦略",
    description: "LTV最大化のシナリオ設計、ロイヤルカスタマー育成、紹介キャンペーン",
    duration: "12分",
    level: "マスター編",
    levelNumber: 4,
    completed: false,
    locked: true,
    thumbnail: "https://placehold.co/320x180/FF6B35/FFFFFF?text=Loyalty",
    category: "strategy",
    views: 420,
    rating: 5.0,
  },
  {
    id: "video_11",
    title: "オムニチャネル戦略",
    description: "SNS連携の最適化、LINE広告との連動、マルチタッチポイント設計",
    duration: "10分",
    level: "マスター編",
    levelNumber: 4,
    completed: false,
    locked: true,
    thumbnail: "https://placehold.co/320x180/FF6B35/FFFFFF?text=Omni",
    category: "strategy",
    views: 380,
    rating: 4.9,
  },
  {
    id: "video_12",
    title: "成功事例から学ぶ",
    description: "売上4倍達成のアパレル、リピート率80%のコスメ、月商1000万円の食品EC",
    duration: "8分",
    level: "マスター編",
    levelNumber: 4,
    completed: false,
    locked: true,
    thumbnail: "https://placehold.co/320x180/FF6B35/FFFFFF?text=Cases",
    category: "case-study",
    views: 890,
    rating: 5.0,
  },
];

const LEARNING_STATS = {
  totalVideos: 12,
  completedVideos: 5,
  totalWatchTime: 120, // minutes
  currentStreak: 3, // days
  achievements: [
    { id: 1, name: "基礎マスター", icon: Award, unlocked: true, description: "基礎編を完了" },
    { id: 2, name: "実践者", icon: TrendingUp, unlocked: false, description: "実践編を完了" },
    { id: 3, name: "上級者", icon: Target, unlocked: false, description: "応用編を完了" },
    { id: 4, name: "マスター", icon: Star, unlocked: false, description: "全動画を完了" },
  ],
};

export default function LearningCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const progress = (LEARNING_STATS.completedVideos / LEARNING_STATS.totalVideos) * 100;

  const filteredVideos = TUTORIAL_VIDEOS.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "all" || video.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

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
    <div className="h-full flex flex-col">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">学習センター</h1>
            <p className="text-sm text-gray-500 mt-1">
              動画で学ぶLカート活用術 - 基礎から応用まで
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="動画を検索..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">学習進捗</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {LEARNING_STATS.completedVideos} / {LEARNING_STATS.totalVideos}
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}% 完了</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">視聴時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{LEARNING_STATS.totalWatchTime}分</div>
              <p className="text-xs text-gray-400 mt-1">累計視聴時間</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">連続学習</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{LEARNING_STATS.currentStreak}日</div>
              <p className="text-xs text-gray-400 mt-1">継続中</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">実績</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1">
                {LEARNING_STATS.achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        achievement.unlocked
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                      title={achievement.description}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Tabs */}
        <Tabs defaultValue="all" className="space-y-6" onValueChange={setSelectedLevel}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="基礎編">基礎編</TabsTrigger>
            <TabsTrigger value="実践編">実践編</TabsTrigger>
            <TabsTrigger value="応用編">応用編</TabsTrigger>
            <TabsTrigger value="マスター編">マスター編</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedLevel} className="space-y-6">
            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Link key={video.id} href={video.locked ? "#" : `/learning/video/${video.id}`}>
                  <Card
                    className={`overflow-hidden hover:shadow-lg transition-shadow ${
                      video.locked ? "opacity-60" : "cursor-pointer"
                    }`}
                  >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-200">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    {video.locked ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    ) : video.completed ? (
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                        <PlayCircle className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelColor(video.level)}>{video.level}</Badge>
                      {video.locked && <Badge variant="secondary">ロック中</Badge>}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{video.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{video.views.toLocaleString()}回視聴</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span>{video.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
