import { describe, expect, it } from "vitest";
import {
  addDays,
  calcFeeAmount,
  csvEscape,
  formatCertificateNumber,
  gradeQuiz,
  meetsSubsidyMinutes,
  reminderReasonsFor,
  statusLabel,
  toCsv,
  SUBSIDY_MIN_MINUTES,
} from "./lms-logic";

describe("meetsSubsidyMinutes (10時間以上判定)", () => {
  it("600分未満は不可", () => {
    expect(meetsSubsidyMinutes(599)).toBe(false);
    expect(meetsSubsidyMinutes(0)).toBe(false);
  });
  it("600分ちょうど・以上は可", () => {
    expect(meetsSubsidyMinutes(SUBSIDY_MIN_MINUTES)).toBe(true);
    expect(meetsSubsidyMinutes(600)).toBe(true);
    expect(meetsSubsidyMinutes(1200)).toBe(true);
  });
});

describe("calcFeeAmount (成果報酬 = 研修売上 × 率)", () => {
  it("20%を切り捨てで計算", () => {
    expect(calcFeeAmount(1_000_000, 20)).toBe(200_000);
    expect(calcFeeAmount(999_999, 20)).toBe(199_999); // floor(199999.8)
  });
  it("率0や売上0は0", () => {
    expect(calcFeeAmount(1_000_000, 0)).toBe(0);
    expect(calcFeeAmount(0, 20)).toBe(0);
    expect(calcFeeAmount(-100, 20)).toBe(0);
  });
  it("助成金受給額ではなく研修売上が基礎(値がそのまま反映される)", () => {
    expect(calcFeeAmount(500_000, 15)).toBe(75_000);
  });
});

describe("formatCertificateNumber", () => {
  it("RLMS-YYYYMMDD-000000 形式", () => {
    expect(formatCertificateNumber("2026-07-08", 123)).toBe("RLMS-20260708-000123");
    expect(formatCertificateNumber("2026-01-01", 1)).toBe("RLMS-20260101-000001");
  });
});

describe("gradeQuiz (自動採点)", () => {
  const questions = [
    { id: 1, questionType: "single", correctAnswers: [1], points: 1 },
    { id: 2, questionType: "multiple", correctAnswers: [0, 2], points: 2 },
  ];
  it("全問正解で100点", () => {
    const r = gradeQuiz(questions, { "1": [1], "2": [0, 2] });
    expect(r.score).toBe(100);
    expect(r.earned).toBe(3);
    expect(r.total).toBe(3);
  });
  it("複数選択は順不同で正解、部分一致は不正解", () => {
    expect(gradeQuiz(questions, { "1": [1], "2": [2, 0] }).score).toBe(100);
    expect(gradeQuiz(questions, { "1": [1], "2": [0] }).score).toBe(33); // 1/3
  });
  it("未回答は0点", () => {
    expect(gradeQuiz(questions, {}).score).toBe(0);
  });
  it("記述式(text)は満点付与(合否に影響させない)", () => {
    const q = [{ id: 3, questionType: "text", correctAnswers: null, points: 5 }];
    expect(gradeQuiz(q, { "3": "自由記述" }).score).toBe(100);
  });
  it("設問なしは0点(ゼロ除算しない)", () => {
    expect(gradeQuiz([], {}).score).toBe(0);
  });
});

describe("csvEscape / toCsv", () => {
  it("カンマ・引用符・改行を含む値をクォート", () => {
    expect(csvEscape("abc")).toBe("abc");
    expect(csvEscape("a,b")).toBe('"a,b"');
    expect(csvEscape('a"b')).toBe('"a""b"');
    expect(csvEscape(null)).toBe("");
  });
  it("BOM付き・CRLF区切り", () => {
    const csv = toCsv(["名前", "点"], [["田中", 80], ["a,b", 90]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain("名前,点");
    expect(csv).toContain("\r\n");
    expect(csv).toContain('"a,b",90');
  });
});

describe("addDays", () => {
  it("日付をまたぐ加算", () => {
    expect(addDays("2026-07-08", 1)).toBe("2026-07-09");
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("reminderReasonsFor (リマインド理由判定)", () => {
  const today = "2026-07-08";
  const base = { status: "in_progress", dueDate: null, hasLoggedIn: true, isInvited: false, isNotStarted: false, progressRate: 50, hasQuizResult: true };

  it("修了済みは対象外", () => {
    expect(reminderReasonsFor(today, { ...base, status: "completed" })).toEqual([]);
  });
  it("期限切れは expired のみ(重複させない)", () => {
    expect(reminderReasonsFor(today, { ...base, dueDate: "2026-07-01", progressRate: 0, hasQuizResult: false })).toEqual(["expired"]);
  });
  it("未ログイン(招待済/未着手)で no_login", () => {
    const r = reminderReasonsFor(today, { ...base, hasLoggedIn: false, isInvited: true, isNotStarted: true, progressRate: 0, hasQuizResult: false });
    expect(r).toContain("no_login");
  });
  it("期限前日/3日前/7日前を段階判定", () => {
    expect(reminderReasonsFor(today, { ...base, dueDate: "2026-07-08" })).toContain("due_1d");
    expect(reminderReasonsFor(today, { ...base, dueDate: "2026-07-10" })).toContain("due_3d");
    expect(reminderReasonsFor(today, { ...base, dueDate: "2026-07-14" })).toContain("due_7d");
  });
  it("進捗ありでテスト未受験は quiz_pending", () => {
    expect(reminderReasonsFor(today, { ...base, progressRate: 40, hasQuizResult: false })).toContain("quiz_pending");
  });
  it("進捗0ではテスト督促しない", () => {
    expect(reminderReasonsFor(today, { ...base, progressRate: 0, hasQuizResult: false })).not.toContain("quiz_pending");
  });
});

describe("statusLabel", () => {
  it("既知の状態を和訳", () => {
    expect(statusLabel("completed")).toBe("修了");
    expect(statusLabel("in_progress")).toBe("受講中");
    expect(statusLabel("expired")).toBe("期限切れ");
  });
  it("未知はそのまま返す", () => {
    expect(statusLabel("unknown_x")).toBe("unknown_x");
  });
});
