import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  User,
  MoreHorizontal
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock data for calendar events
const MOCK_EVENTS = [
  {
    id: "evt_001",
    title: "個別相談会",
    date: "2024-03-20",
    time: "14:00",
    attendee: "山田 太郎",
    status: "confirmed"
  },
  {
    id: "evt_002",
    title: "商品体験会",
    date: "2024-03-20",
    time: "16:00",
    attendee: "鈴木 花子",
    status: "pending"
  },
  {
    id: "evt_003",
    title: "オンラインセミナー",
    date: "2024-03-22",
    time: "10:00",
    attendee: "佐藤 次郎",
    status: "confirmed"
  },
  {
    id: "evt_004",
    title: "個別相談会",
    date: "2024-03-25",
    time: "11:00",
    attendee: "田中 美咲",
    status: "cancelled"
  }
];

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function EventCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 1)); // March 2024
  const [view, setView] = useState("month");

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return MOCK_EVENTS.filter(evt => evt.date === dateStr);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">予約カレンダー</h1>
            <p className="text-sm text-gray-500 mt-1">
              イベントや来店予約の状況をカレンダー形式で確認できます
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">今日</Button>
            <div className="flex items-center border rounded-md bg-white">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-r">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Select value={view} onValueChange={setView}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">月表示</SelectItem>
                <SelectItem value="week">週表示</SelectItem>
                <SelectItem value="day">日表示</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
              </CardTitle>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>確定</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>承認待ち</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span>キャンセル</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="grid grid-cols-7 h-full">
              {/* Header */}
              {DAYS.map((day, i) => (
                <div 
                  key={day} 
                  className={`
                    p-2 text-center text-sm font-medium border-b border-r last:border-r-0 bg-slate-50
                    ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}
                  `}
                >
                  {day}
                </div>
              ))}

              {/* Days */}
              {days.map((date, i) => {
                if (!date) return <div key={`empty-${i}`} className="border-b border-r last:border-r-0 bg-slate-50/30"></div>;
                
                const events = getEventsForDate(date);
                const isToday = date.getDate() === 15; // Mock today as 15th

                return (
                  <div 
                    key={date.toISOString()} 
                    className={`
                      min-h-[120px] p-2 border-b border-r last:border-r-0 hover:bg-slate-50 transition-colors relative
                      ${isToday ? 'bg-blue-50/30' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span 
                        className={`
                          text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                          ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}
                        `}
                      >
                        {date.getDate()}
                      </span>
                      {events.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                          {events.length}件
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      {events.map(evt => (
                        <div 
                          key={evt.id}
                          className={`
                            text-xs p-1.5 rounded border cursor-pointer truncate
                            ${evt.status === 'confirmed' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                              evt.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 
                              'bg-gray-50 border-gray-200 text-gray-500 line-through'}
                          `}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>{evt.time}</span>
                          </div>
                          <div className="font-medium mt-0.5 truncate">
                            {evt.attendee}様
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
