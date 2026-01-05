import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Store,
  Palette,
  Layout,
  FileText,
  Eye,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  Home,
  Info,
  Mail,
  Shield,
  FileCheck,
  CreditCard,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation, Link } from "wouter";

// Import step components
import BasicInfoStep from "./steps/BasicInfoStep";
import ThemeSelectionStep from "./steps/ThemeSelectionStep";
import PageStructureStep from "./steps/PageStructureStep";
import StaticPagesStep from "./steps/StaticPagesStep";
import PaymentSettingsStep from "./steps/PaymentSettingsStep";
import DesignCustomizationStep from "./steps/DesignCustomizationStep";
import LivePreviewStep from "./steps/LivePreviewStep";
import PreviewStep from "./steps/PreviewStep";

export default function ShopBuilderPage() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [shopData, setShopData] = useState({
    // Step 1: Basic Info
    shopName: "",
    description: "",
    logo: "",
    primaryColor: "#06C755",
    
    // Step 2: Theme
    theme: "modern",
    
    // Step 3: Page Structure
    pages: [
      { id: "home", name: "トップページ", icon: Home, enabled: true, required: true },
      { id: "products", name: "商品一覧", icon: ShoppingBag, enabled: true, required: true },
      { id: "about", name: "ショップについて", icon: Info, enabled: false, required: false },
      { id: "contact", name: "お問い合わせ", icon: Mail, enabled: false, required: false },
    ],
    
    // Step 4: Static Pages
    staticPages: [
      { id: "terms", name: "利用規約", icon: FileCheck, enabled: false, template: "terms" },
      { id: "privacy", name: "プライバシーポリシー", icon: Shield, enabled: false, template: "privacy" },
      { id: "law", name: "特定商取引法", icon: FileText, enabled: false, template: "law" },
    ],
    
    // Step 5: Payment Settings
    paymentMethods: [
      { id: "stripe", name: "Stripe", enabled: true },
      { id: "bank_transfer", name: "銀行振込", enabled: false },
      { id: "cod", name: "代金引換", enabled: false },
    ],
    
    // Step 6: Design Customization
    customization: {
      colors: {
        primary: "#06C755",
        secondary: "#4F46E5",
        accent: "#F59E0B",
        background: "#FFFFFF",
        text: "#1F2937",
      },
      font: "noto-sans",
      layout: "standard",
      customCSS: "",
    },
  });

  const steps = [
    {
      id: 1,
      title: "基本情報",
      description: "ショップ名とロゴを設定",
      icon: Store,
      component: BasicInfoStep,
    },
    {
      id: 2,
      title: "デザイン",
      description: "テーマを選択",
      icon: Palette,
      component: ThemeSelectionStep,
    },
    {
      id: 3,
      title: "ページ構成",
      description: "必要なページを選択",
      icon: Layout,
      component: PageStructureStep,
    },
    {
      id: 4,
      title: "固定ページ",
      description: "利用規約などを作成",
      icon: FileText,
      component: StaticPagesStep,
    },
    {
      id: 5,
      title: "決済設定",
      description: "決済方法を選択",
      icon: CreditCard,
      component: PaymentSettingsStep,
    },
    {
      id: 6,
      title: "デザイン",
      description: "色やフォントを設定",
      icon: Palette,
      component: DesignCustomizationStep,
    },
    {
      id: 7,
      title: "プレビュー",
      description: "リアルタイム確認",
      icon: Eye,
      component: LivePreviewStep,
    },
    {
      id: 8,
      title: "公開準備",
      description: "最終確認と公開",
      icon: CheckCircle,
      component: PreviewStep,
    },
  ];

  const currentStepData = steps.find((s) => s.id === currentStep);
  const StepComponent = currentStepData?.component;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePublish = async () => {
    try {
      // TODO: API call to create shop
      toast.success("ショップを公開しました！");
      setLocation("/products");
    } catch (error) {
      toast.error("公開に失敗しました");
    }
  };

  const isStepComplete = (stepId: number) => {
    switch (stepId) {
      case 1:
        return shopData.shopName.trim() !== "";
      case 2:
        return shopData.theme !== "";
      case 3:
        return shopData.pages.filter((p) => p.enabled).length >= 2;
      case 4:
        return true; // Optional step
      case 5:
        return shopData.paymentMethods?.filter((m: any) => m.enabled).length > 0;
      case 6:
        return true; // Optional step
      case 7:
        return true; // Preview step
      case 8:
        return true;
      default:
        return false;
    }
  };

  const canProceed = isStepComplete(currentStep);
  const progress = (currentStep / steps.length) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ショップページ作成</h1>
            <p className="text-sm text-gray-500 mt-1">
              ステップに従って、あなただけのショップページを作成しましょう
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/products")}>
            キャンセル
          </Button>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  ステップ {currentStep} / {steps.length}
                </span>
                <span className="text-gray-500">{Math.round(progress)}% 完了</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Step Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isComplete = isStepComplete(step.id) && step.id < currentStep;
            const isPast = step.id < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                  isActive
                    ? "border-[#06C755] bg-[#06C755]/5"
                    : isPast
                    ? "border-gray-200 bg-white hover:border-gray-300"
                    : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                }`}
                disabled={!isPast && !isActive}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isComplete
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-[#06C755] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">ステップ {step.id}</div>
                  </div>
                </div>
                <div className="font-medium text-sm text-gray-900">{step.title}</div>
                <div className="text-xs text-gray-500 mt-1">{step.description}</div>
              </button>
            );
          })}
        </div>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#06C755]/10 flex items-center justify-center">
                {currentStepData && <currentStepData.icon className="w-6 h-6 text-[#06C755]" />}
              </div>
              <div>
                <CardTitle>{currentStepData?.title}</CardTitle>
                <CardDescription>{currentStepData?.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {StepComponent && <StepComponent shopData={shopData} setShopData={setShopData} />}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pb-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            前へ
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2"
            >
              次へ
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={!canProceed}
              className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2"
            >
              <Sparkles className="w-4 h-4" />
              ショップを公開
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
