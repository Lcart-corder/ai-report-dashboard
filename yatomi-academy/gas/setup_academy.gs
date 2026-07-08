/**
 * やとみ放課後アカデミー 休日部活動地域展開事業
 * 予算・シミュレーション・実績・精算ブック 自動生成スクリプト
 *
 * 要件定義書 docs/yatomi-academy-requirements.md の
 * §11(スプレッドシート構成) / §17(様式一覧) / §18(計算式) を実装する。
 *
 * 使い方:
 *   1. Googleスプレッドシートを新規作成
 *   2. 拡張機能 → Apps Script でエディタを開く
 *   3. このファイルの内容を貼り付けて保存
 *   4. 関数「setupAcademyBook」を選んで ▶実行（初回は権限承認）
 *   5. 13シート＋名前付き範囲＋計算式が生成される
 *
 * 数値の根拠（資料①計画前提／②予算書／③別添1-2／④指導員配置）:
 *   直接事業費 16,039,600 / 間接事業費 744,800 / 諸経費(直接×30%) 4,811,880
 *   総事業費 21,596,280 / 市委託料 20,851,480 / 歳入計(200人) 24,272,480
 *   指導員謝金 A案5,760,000 B案6,720,000 C案7,560,000（§1の3案）
 *
 * ⚠ 資料間の食い違いは「勝手に統一しない」方針。
 *    00_入力条件で案(A/B/C)や参加費月数を切り替えて差異を見せる設計。
 */

// 対象ブック。空なら実行中のアクティブブックを使う（バインドスクリプト推奨）。
var ACADEMY_SS_ID = '';

var SH = {
  IN:  '00_入力条件',
  REV: '01_収入シミュレーション',
  EXP: '02_支出シミュレーション',
  SUM: '03_収支サマリー',
  STAFF: '04_指導員配置',
  MEMBER: '05_参加者管理',
  DAILY: '06_活動日報',
  MONTH: '07_月次実績',
  SUBSIDY: '08_補助対象経費',
  NONSUB: '09_補助対象外経費',
  SPON: '10_協賛管理',
  BILL: '11_請求入金管理',
  SETTLE: '12_年度末精算',
  GOV: '13_行政提出様式出力',
  BUDGET: '14_収支予算書',
  MID: '15_中期収支計画',
  MSIM: '★月次シミュレーション'
};

function setupAcademyBook() {
  var ss = ACADEMY_SS_ID ? SpreadsheetApp.openById(ACADEMY_SS_ID)
                         : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('対象スプレッドシートが取得できません。ACADEMY_SS_IDを設定するか、バインドスクリプトで実行してください。');

  _buildInputs(ss);      // 00 先に名前付き範囲を定義
  _buildRevenue(ss);     // 01
  _buildExpense(ss);     // 02
  _buildSummary(ss);     // 03
  _buildStaff(ss);       // 04
  _buildMember(ss);      // 05
  _buildDaily(ss);       // 06
  _buildMonthly(ss);     // 07
  _buildSubsidy(ss);     // 08
  _buildNonSubsidy(ss);  // 09
  _buildSponsor(ss);     // 10
  _buildBilling(ss);     // 11
  _buildSettlement(ss);  // 12
  _buildGov(ss);         // 13
  _buildBudgetStatement(ss); // 14 会計要項の収支予算書
  _buildMidterm(ss);     // 15 中期収支計画（成長カーブ）
  _buildMonthlySim(ss);  // ★ 月次シミュレーション（主軸）

  // 月次シミュレーションを先頭へ移動して主軸に
  try { var m = ss.getSheetByName(SH.MSIM); ss.setActiveSheet(m); ss.moveActiveSheet(1); } catch (e) {}

  // 既定のシート1が空なら削除
  var def = ss.getSheetByName('シート1') || ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) { try { ss.deleteSheet(def); } catch (e) {} }

  ss.setActiveSheet(ss.getSheetByName(SH.MSIM));
  Logger.log('やとみ放課後アカデミー ブックを生成しました（16シート・月次主軸）');
  try { SpreadsheetApp.getUi().alert('生成完了！\n16シート（★月次シミュレーションを主軸）を作成しました。\n月次の開催回数・参加者・協賛を入力すると年間へ集約されます。'); } catch (e) {}
}

/* ============================ 共通ヘルパ ============================ */

function _sheet(ss, name) {
  var s = ss.getSheetByName(name);
  if (!s) s = ss.insertSheet(name);
  s.clear();
  return s;
}
function _title(sheet, text) {
  sheet.getRange(1, 1).setValue(text).setFontSize(13).setFontWeight('bold').setFontColor('#1f3a5f');
}
function _header(sheet, row, headers) {
  var r = sheet.getRange(row, 1, 1, headers.length);
  r.setValues([headers]).setFontWeight('bold').setBackground('#e8eef7').setFontColor('#1f3a5f');
  r.setBorder(true, true, true, true, true, true);
  sheet.setFrozenRows(row);
}
function _named(ss, name, sheetName, a1) {
  // 存在する場合のみ削除（存在しない名前を removeNamedRange するとflush時に
  // 例外「名前付き範囲『…』は存在しません」が投げられ try/catch で捕まらないため）
  if (ss.getRangeByName(name)) { try { ss.removeNamedRange(name); } catch (e) {} }
  ss.setNamedRange(name, ss.getSheetByName(sheetName).getRange(a1));
}
function _yen(sheet, a1) { sheet.getRange(a1).setNumberFormat('#,##0'); }
function _colName(n) { // 1->A 4->D
  var s = ''; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; }
  return s;
}

/* ============================ 00_入力条件 ============================ */

function _buildInputs(ss) {
  var s = _sheet(ss, SH.IN);
  _title(s, '00_入力条件 ｜ 全シートの前提値。ここを変えると連動します（資料①②③④）');
  _header(s, 2, ['項目', '値', '単位', '備考 / 出典']);

  // [ラベル, 値, 単位, 備考, 名前付き範囲(なければ'')]
  var rows = [
    ['R9.4.1 生徒数',          1000,     '人',   '資料①',                       ''],
    ['参加者数',               200,      '人',   '資料①②（100〜300で変更可）',   '参加者数'],
    ['種目数',                 15,       '種目', '資料①③④',                    '種目数'],
    ['指導回数/年',            40,       '回',   '全資料',                       '回数'],
    ['配置指導員数',           30,       '人',   '資料①③④',                    '指導員数'],
    ['管理者数',               2,        '人',   '資料②③',                      '管理者数'],
    ['指導時間(国庫案A)',      3,        '時間/回', '資料①',                     '時間_国庫'],
    ['指導時間(実運営案B/C)',  3.5,      '時間/回', '資料②③④（準備含む）',       '時間_実'],
    ['時給(国庫/中間 A・B)',   1600,     '円/h', '資料①④',                      '時給_国庫'],
    ['時給(実運営 C)',         1800,     '円/h', '資料②③④',                    '時給_実'],
    ['参加費(月額)',           2000,     '円/月', '資料②',                       '参加費月額'],
    ['参加月数(当年度)',       7,        '月',   '9〜3月＝資料②（通年は12）',     '参加月数'],
    ['利用会員入会金',         1000,     '円',   '資料②',                        '利用入会金'],
    ['スポーツ安全保険',       800,      '円',   '資料②',                        '保険単価'],
    ['アプリ使用料',           880,      '円',   '資料②',                        'アプリ単価'],
    ['市委託料',               20851480, '円',   '資料②③',                      '市委託料'],
    ['正会員入会金 収入',      10000,    '円',   '1,000×10 資料②',               '正会員収入'],
    ['賛助会員(個人) 収入',    25000,    '円',   '5,000×5 資料②',                '賛助個人'],
    ['賛助会員(法人) 収入',    50000,    '円',   '10,000×5 資料②',               '賛助法人'],
    ['寄付金',                 0,        '円',   '任意',                         '寄付金'],
    ['採用謝金案(A/B/C)',      'C',      '案',   '提出=A/B・実支給=C（§1）',      '採用案'],
    ['提出用謝金案(A/B)',      'A',      '案',   '別添1-2に載せる案（§13）',      '提出案']
  ];
  var vals = rows.map(function (r) { return [r[0], r[1], r[2], r[3]]; });
  s.getRange(3, 1, vals.length, 4).setValues(vals);

  // 名前付き範囲（B列＝値）
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][4]) _named(ss, rows[i][4], SH.IN, 'B' + (i + 3));
  }
  // 参加者1人あたり変動収入単価（派生・名前付き）
  var lastRow = 3 + rows.length + 1;
  s.getRange(lastRow, 1).setValue('参加者1人あたり変動収入単価').setFontWeight('bold');
  s.getRange(lastRow, 2).setFormula('=利用入会金+参加費月額*参加月数+保険単価+アプリ単価');
  s.getRange(lastRow, 3).setValue('円/人');
  s.getRange(lastRow, 4).setValue('§4-2（当年度7ヶ月＝16,680）');
  _named(ss, '参加者単価', SH.IN, 'B' + lastRow);

  // 入力セルを薄黄でハイライト
  s.getRange(3, 2, rows.length, 1).setBackground('#fffbe6').setBorder(true, true, true, true, true, true);
  s.getRange('B23:B24').setBackground('#ffe9d6'); // 案セレクタ(採用案/提出案)
  s.setColumnWidth(1, 200); s.setColumnWidth(4, 320);
  for (var c = 3; c <= 3 + rows.length; c++) _yen(s, 'B' + c);

  // 名前付き範囲を確実にコミットしてから後続シートへ（遅延実行対策）
  SpreadsheetApp.flush();
}

/* ============================ 01_収入シミュレーション ============================ */

function _buildRevenue(ss) {
  var s = _sheet(ss, SH.REV);
  _title(s, '01_収入シミュレーション ｜ 参加者数別（協賛金は10で別計上）');
  _header(s, 2, ['収入項目', '区分', '単価/固定額(円)', '100人', '150人', '200人', '250人', '300人']);
  s.getRange(3, 4, 1, 5).setValues([[100, 150, 200, 250, 300]]); // 参加者数ヘッダ数値行(行3)
  s.getRange(3, 1, 1, 3).setValues([['↓ 参加者数 →', '', '']]).setFontStyle('italic');

  // [項目, 区分, 単価式]
  var items = [
    ['正会員入会金',          '固定', '=正会員収入'],
    ['賛助会員年会費(個人)',  '固定', '=賛助個人'],
    ['賛助会員年会費(法人)',  '固定', '=賛助法人'],
    ['利用会員入会金',        '変動', '=利用入会金'],
    ['参加費',                '変動', '=参加費月額*参加月数'],
    ['スポーツ安全保険',      '変動', '=保険単価'],
    ['アプリ使用料',          '変動', '=アプリ単価'],
    ['市委託料',              '固定', '=市委託料']
  ];
  var start = 4;
  for (var i = 0; i < items.length; i++) {
    var r = start + i;
    s.getRange(r, 1).setValue(items[i][0]);
    s.getRange(r, 2).setValue(items[i][1]);
    s.getRange(r, 3).setFormula(items[i][2]);
    for (var c = 4; c <= 8; c++) {
      var col = _colName(c);
      if (items[i][1] === '変動') s.getRange(r, c).setFormula('=$C' + r + '*' + col + '$3');
      else s.getRange(r, c).setFormula('=$C' + r);
    }
  }
  var totalRow = start + items.length;
  s.getRange(totalRow, 1).setValue('歳入計（協賛金除く）').setFontWeight('bold');
  s.getRange(totalRow, 1, 1, 8).setBackground('#eef7ee');
  for (var c2 = 4; c2 <= 8; c2++) {
    var col2 = _colName(c2);
    s.getRange(totalRow, c2).setFormula('=SUM(' + col2 + start + ':' + col2 + (totalRow - 1) + ')').setFontWeight('bold');
  }
  // 参考行
  var refRow = totalRow + 2;
  s.getRange(refRow, 1).setValue('参加者1人あたり変動収入単価(円)');
  s.getRange(refRow, 3).setFormula('=参加者単価');
  s.getRange(refRow + 1, 1).setValue('通年(12ヶ月)参考：参加費');
  s.getRange(refRow + 1, 3).setFormula('=参加費月額*12');
  s.getRange(refRow + 2, 1).setValue('※参加者連動収入は「参加者相当分として市に戻す」対象（資料②備考・§12）').setFontColor('#b00');

  s.getRange(4, 3, totalRow - 3, 6).setNumberFormat('#,##0');
  s.setColumnWidth(1, 200);
}

/* ============================ 02_支出シミュレーション ============================ */

function _buildExpense(ss) {
  var s = _sheet(ss, SH.EXP);
  _title(s, '02_支出シミュレーション ｜ 指導員謝金3案(4列) ＋ 費目別（直接/間接・補助区分・財源）');

  // --- 3案ブロック（行2-6） ---
  _header(s, 2, ['指導員謝金 3案', '時間/回', '回数', '単価(円/h)', '人数', '年額(円)', '扱い']);
  s.getRange(3, 1, 3, 7).setValues([
    ['A 国庫申請基準案', '', '', '', '', '', '行政提出（別添1-2）向け'],
    ['B 中間案(補助金積算)', '', '', '', '', '', '補助金積算の内部根拠'],
    ['C 実運営案', '', '', '', '', '', '実際の指導員支給']
  ]);
  s.getRange('B3').setFormula('=時間_国庫'); s.getRange('C3').setFormula('=回数'); s.getRange('D3').setFormula('=時給_国庫'); s.getRange('E3').setFormula('=指導員数'); s.getRange('F3').setFormula('=B3*C3*D3*E3');
  s.getRange('B4').setFormula('=時間_実');   s.getRange('C4').setFormula('=回数'); s.getRange('D4').setValue(1600);        s.getRange('E4').setFormula('=指導員数'); s.getRange('F4').setFormula('=B4*C4*D4*E4');
  s.getRange('B5').setFormula('=時間_実');   s.getRange('C5').setFormula('=回数'); s.getRange('D5').setFormula('=時給_実'); s.getRange('E5').setFormula('=指導員数'); s.getRange('F5').setFormula('=B5*C5*D5*E5');
  s.getRange(6, 1).setValue('差額 C−A（要財源説明）').setFontWeight('bold');
  s.getRange('F6').setFormula('=F5-F3').setFontWeight('bold').setFontColor('#b00');
  s.getRange(6, 7).setValue('委託料内配分 または NPO自主財源で説明（§1-3）');
  s.getRange('F3:F6').setNumberFormat('#,##0');

  // --- 費目テーブル（ヘッダ行8、明細9〜） ---
  var HROW = 8;
  _header(s, HROW, ['#', '費目', '事業費区分', '金額(円)', '固変', '補助区分', '財源', '積算根拠', '会計区分']);
  s.setFrozenRows(HROW);

  // 会計要項の区分（15_収支予算書がSUMIFで参照）。items と同順。
  var kaikei = [
    '人件費','人件費','人件費','人件費','その他事業費','人件費','人件費',
    'その他事業費','その他事業費','その他事業費','その他事業費','その他事業費','その他事業費',
    '管理費','管理費','管理費','管理費','管理費','管理費','管理費','管理費','管理費',
    'メモ','メモ','メモ','メモ','メモ'
  ];

  // [費目, 直接/間接/メモ, 金額(数値 or null=謝金式), 固変, 補助区分, 財源, 根拠]
  var items = [
    ['指導者謝金(15種目)',                '直接', null,    '変動',  '補助(基準A/B)', '委託', '採用案に連動：C=1,800×3.5H×30人×40回'],
    ['指導者研修費(費用弁償)',            '直接', 324000,  '準固定', '補助',       '委託', '1,800×3H×30人×2回'],
    ['指導者講習等講師謝金',              '直接', 100000,  '固定',  '補助',        '委託', '50,000×2回（弁護士等）'],
    ['通勤手当',                          '直接', 252000,  '変動',  '補助',        '委託', '210×40回×30人'],
    ['指導者旅費',                        '直接', 300000,  '準固定', '補助',       '委託', '20,000×15種目'],
    ['スポーツ安全保険(指導者分)',        '直接', 24000,   '変動',  '補助',        '委託', '800×30人'],
    ['管理者人件費(報酬)',                '直接', 3369600, '固定',  '補助',        '委託', '1,800×6H×3日/週×52週×2人'],
    ['印刷製本費',                        '直接', 150000,  '固定',  '補助',        '委託', '募集チラシ・マニュアル'],
    ['競技用消耗品費',                    '直接', 600000,  '準固定', '補助',       '委託', '40,000×15種目'],
    ['競技用備品費',                      '直接', 600000,  '準固定', '補助',       '委託', '40,000×15種目'],
    ['部活動展開システム運用保守包括委託','直接', 2400000, '固定',  '補助(委託費)','委託', '200,000×12月（LINE/HP/協賛/参加費）'],
    ['HPサーバ管理料',                    '直接', 60000,   '固定',  '補助',        '委託', '5,000×12月'],
    ['LINE公式プラットフォーム使用料',    '直接', 300000,  '固定',  '補助',        '委託', '25,000×12月'],
    ['事務局旅費',                        '間接', 50000,   '固定',  '対象外',      '自主', '研修会等 理事'],
    ['事務消耗品',                        '間接', 150000,  '固定',  '対象外',      '自主', ''],
    ['会議費',                            '間接', 50000,   '固定',  '対象外',      '自主', '総会・理事会 計10回'],
    ['通信料(電話)',                      '間接', 240000,  '固定',  '対象外',      '自主', '20千円×12月×2台'],
    ['事務局備品費',                      '間接', 100000,  '固定',  '対象外',      '自主', ''],
    ['電話機借上げ',                      '間接', 22800,   '固定',  '対象外',      '自主(市貸与)', '10万円5年リース'],
    ['PC借上げ',                          '間接', 68400,   '固定',  '対象外',      '自主(市貸与)', '30万円5年リース'],
    ['プリンター借上げ',                  '間接', 45600,   '固定',  '対象外',      '自主(市貸与)', '20万円5年リース'],
    ['AIアプリ使用料',                    '間接', 18000,   '固定',  '対象外',      '自主', '仕事効率化'],
    // ↓メモ行（合計に含めない）
    ['スポーツ安全保険(生徒分)',          'メモ', 0,       '変動',  '対象外',      '自主(保護者)', '保護者負担'],
    ['利用料徴収アプリ(保護者負担)',      'メモ', 0,       '変動',  '対象外',      '自主(保護者)', 'アスフィル 880×200'],
    ['活動/事務所 施設使用料',            'メモ', 0,       '固定',  '―',           '―',   '当分の間 免除'],
    ['期末手当・各種手当',                'メモ', 0,       '固定',  '一部対象外',  '委託/自主', '≒700千円/人 要確定（総額未計上）'],
    ['専門家費用(社労・税・弁)',          'メモ', 0,       '固定',  '一部対象外',  '自主', '≒1,298千円 備考 要確定']
  ];

  var body = items.map(function (it, idx) {
    return [idx + 1, it[0], it[1], it[2] === null ? '' : it[2], it[3], it[4], it[5], it[6], kaikei[idx]];
  });
  var first = HROW + 1;
  s.getRange(first, 1, body.length, 9).setValues(body);
  // 謝金行(1行目)の金額を採用案に連動
  s.getRange(first, 4).setFormula('=IF(採用案="A",F3,IF(採用案="B",F4,F5))');
  var last = first + body.length - 1;
  s.getRange(first, 4, body.length, 1).setNumberFormat('#,##0');

  // メモ行を薄いグレーに
  for (var i = 0; i < items.length; i++) {
    if (items[i][1] === 'メモ') s.getRange(first + i, 1, 1, 9).setBackground('#f4f4f4').setFontColor('#777');
  }

  // --- 合計ブロック ---
  var t = last + 2;
  var C = 'C' + first + ':C' + last, D = 'D' + first + ':D' + last, F = 'F' + first + ':F' + last;
  var defs = [
    ['直接事業費', '=SUMIF(' + C + ',"直接",' + D + ')', '資料②＝16,039,600（採用案Cのとき）'],
    ['間接事業費', '=SUMIF(' + C + ',"間接",' + D + ')', '資料②③＝744,800'],
    ['歳出計(諸経費前)', '=D' + t + '+D' + (t + 1), '＝16,784,400'],
    ['諸経費(直接×30%)', '=D' + t + '*0.3', '資料③＝4,811,880'],
    ['総事業費', '=D' + t + '+D' + (t + 1) + '+D' + (t + 3), '資料②③＝21,596,280'],
    ['（参考）市委託料', '=市委託料', '＝事業委託費(直接費)'],
    ['（参考）補助対象計', '=SUMIF(' + F + ',"補助*",' + D + ')', '別添1-2の補助対象'],
    ['（参考）補助対象外計', '=SUMIF(' + F + ',"*対象外*",' + D + ')', '間接費相当']
  ];
  for (var j = 0; j < defs.length; j++) {
    s.getRange(t + j, 2).setValue(defs[j][0]).setFontWeight('bold');
    s.getRange(t + j, 4).setFormula(defs[j][1]).setNumberFormat('#,##0').setFontWeight('bold');
    s.getRange(t + j, 5).setValue(defs[j][2]).setFontColor('#555');
  }
  s.getRange(t, 2, defs.length, 1).setBackground('#eef7ee');
  s.getRange(t + 4, 2, 1, 4).setBackground('#dcefe0'); // 総事業費強調

  // 記録用に総事業費/直接/間接の行番号（03から参照）
  s.getRange(t + 10, 2).setValue('参照キー：直接=D' + t + ' 間接=D' + (t + 1) + ' 諸経費=D' + (t + 3) + ' 総事業費=D' + (t + 4)).setFontColor('#999').setFontSize(9);
  PropertiesService.getDocumentProperties().setProperties({
    EXP_DIRECT: 'D' + t, EXP_INDIRECT: 'D' + (t + 1), EXP_SHOKEIHI: 'D' + (t + 3),
    EXP_TOTAL: 'D' + (t + 4), EXP_SUBSIDY: 'D' + (t + 6), EXP_NONSUB: 'D' + (t + 7),
    EXP_HEADER: String(HROW), EXP_FIRST: String(first), EXP_LAST: String(last),
    EXP_C_A: 'F3', EXP_C_C: 'F5', EXP_KAIKEI: 'I'
  });
  s.setColumnWidth(2, 260); s.setColumnWidth(8, 300);
}

/* ============================ 03_収支サマリー ============================ */

function _buildSummary(ss) {
  var s = _sheet(ss, SH.SUM);
  var p = PropertiesService.getDocumentProperties();
  var E = "'" + SH.EXP + "'!";
  var total = E + p.getProperty('EXP_TOTAL');
  var direct = E + p.getProperty('EXP_DIRECT');
  var indirect = E + p.getProperty('EXP_INDIRECT');

  _title(s, '03_収支サマリー ｜ 参加者数連動の歳入・歳出・収支・返還見込');
  _header(s, 2, ['区分', '金額(円)', '計算式 / 備考']);

  var rows = [
    ['① 参加者連動収入',   '=参加者数*参加者単価', '参加者数×単価（当年度）'],
    ['② 固定収入',         '=正会員収入+賛助個人+賛助法人+市委託料', '会費＋市委託料'],
    ['③ 協賛金',           "=SUM('" + SH.SPON + "'!E3:E200)", '10_協賛管理の入金合計'],
    ['④ 寄付金',           '=寄付金', '00_入力条件'],
    ['歳入計 (①+②+③+④)', '=B3+B4+B5+B6', '協賛・寄付込みの総収入'],
    ['', '', ''],
    ['総事業費(歳出)',     '=' + total, '02_支出シミュレーション'],
    ['　うち 直接事業費',   '=' + direct, '委託料対象の中核'],
    ['　うち 間接事業費',   '=' + indirect, 'NPO自主財源で負担'],
    ['', '', ''],
    ['収支（歳入−歳出）',   '=B7-B9', 'プラス＝手残り（但し返還前）'],
    ['返還見込（参加者相当分）', '=B3', '資料②備考：参加者相当分を市に戻す'],
    ['返還後 収支',         '=B13-B14', '返還を織り込んだ実質収支'],
    ['', '', ''],
    ['市委託料',           '=市委託料', '＝事業委託費(直接費)'],
    ['NPO自主財源で賄う額', '=B11', '＝間接事業費（委託料外）'],
    ['自主財源で補填が必要な額', '=MAX(0,-B15)', '返還後がマイナス→協賛金/寄付で補填が必要'],
    ['必要協賛金の目安', '=MAX(0,B11-正会員収入-賛助個人-賛助法人-寄付金)', '間接費−固定会費（協賛でカバー）']
  ];
  for (var i = 0; i < rows.length; i++) {
    var r = i + 3;
    s.getRange(r, 1).setValue(rows[i][0]);
    if (rows[i][1]) s.getRange(r, 2).setFormula(rows[i][1]).setNumberFormat('#,##0');
    s.getRange(r, 3).setValue(rows[i][2]).setFontColor('#555');
  }
  s.getRange(7, 1, 1, 3).setBackground('#eef4fb').setFontWeight('bold');   // 歳入計
  s.getRange(9, 1, 1, 3).setBackground('#fbeeee').setFontWeight('bold');   // 歳出
  s.getRange(13, 1, 1, 3).setBackground('#fff7e0').setFontWeight('bold');  // 収支
  s.getRange(15, 1, 1, 3).setBackground('#eef7ee').setFontWeight('bold');  // 返還後
  s.setColumnWidth(1, 220); s.setColumnWidth(3, 320);
}

/* ============================ 04_指導員配置 ============================ */

function _buildStaff(ss) {
  var s = _sheet(ss, SH.STAFF);
  _title(s, '04_指導員配置 ｜ 種目別謝金（実運営C）＋ 研修/資格ステータス。必要44 vs 配置30の差に注意（§3-3）');
  _header(s, 2, ['#', '種目名', '想定参加', '必要指導員', '配置指導員', '活動時間', '年間回数', '時給(円)',
    '年間謝金(円)', '追加判定', '主担当', '副担当', '代替', '保険', '一般研修', 'ハラ研修', '救命講習', '緊急連絡先', '備考']);

  var species = [
    ['野球', 13, 3, 2], ['サッカー', 13, 3, 2], ['バレー', 15, 3, 2], ['バスケット', 16, 3, 2],
    ['テニス', 13, 3, 2], ['ハンドボール', 13, 3, 2], ['卓球', 13, 3, 2], ['柔道', 13, 3, 2],
    ['剣道', 13, 3, 2], ['フライングディスク', 13, 3, 2], ['ゴルフ', 13, 3, 2], ['吹奏楽', 13, 3, 2],
    ['囲碁', 13, 3, 2], ['生け花', 13, 3, 2], ['ドローン', 13, 2, 2]
  ];
  var start = 3;
  for (var i = 0; i < species.length; i++) {
    var r = start + i, sp = species[i];
    s.getRange(r, 1).setValue(i + 1);
    s.getRange(r, 2).setValue(sp[0]);
    s.getRange(r, 3).setValue(sp[1]);
    s.getRange(r, 4).setValue(sp[2]);
    s.getRange(r, 5).setValue(sp[3]);
    s.getRange(r, 6).setFormula('=時間_実');
    s.getRange(r, 7).setFormula('=回数');
    s.getRange(r, 8).setFormula('=時給_実');
    s.getRange(r, 9).setFormula('=F' + r + '*G' + r + '*H' + r + '*E' + r); // 時間×回数×時給×配置
    s.getRange(r, 10).setFormula('=IF(C' + r + '>=31,"種目分割/別日",IF(C' + r + '>=21,"指導員3名",IF(C' + r + '>=11,"2名+補助員検討","2名")))');
    // 研修列は初期空欄（○/×を手入力）
  }
  var tr = start + species.length;
  s.getRange(tr, 2).setValue('計').setFontWeight('bold');
  s.getRange(tr, 3).setFormula('=SUM(C' + start + ':C' + (tr - 1) + ')').setFontWeight('bold');
  s.getRange(tr, 4).setFormula('=SUM(D' + start + ':D' + (tr - 1) + ')').setFontWeight('bold');
  s.getRange(tr, 5).setFormula('=SUM(E' + start + ':E' + (tr - 1) + ')').setFontWeight('bold');
  s.getRange(tr, 9).setFormula('=SUM(I' + start + ':I' + (tr - 1) + ')').setFontWeight('bold'); // ＝7,560,000
  s.getRange(tr, 1, 1, 9).setBackground('#eef7ee');
  s.getRange(tr + 1, 2).setValue('※必要指導員 計と配置指導員 計の差＝恒常的な不足。補助員/追加ルールで吸収（§6-2）').setFontColor('#b00');
  s.getRange(start, 9, species.length + 1, 1).setNumberFormat('#,##0');
  s.getRange(start, 8, species.length, 1).setNumberFormat('#,##0');
  s.setColumnWidth(2, 140);
}

/* ============================ 05_参加者管理 ============================ */

function _buildMember(ss) {
  var s = _sheet(ss, SH.MEMBER);
  _title(s, '05_参加者管理 ｜ 参加者台帳（§7）。健康・アレルギー・既往歴は要配慮個人情報＝権限/監査管理');
  _header(s, 2, ['生徒氏名', '学校名', '学年', '保護者氏名', '保護者連絡先', 'LINE登録', '参加種目',
    '入会金支払', '参加費支払', '保険加入', 'アプリ料支払', '緊急連絡先', '健康配慮', 'アレルギー',
    '既往歴', '写真掲載可否', '退会日', '備考']);
  // 集計ブロック
  var base = 60;
  s.getRange(base, 1).setValue('― 集計 ―').setFontWeight('bold');
  var kpi = [
    ['登録者数', '=COUNTA(A3:A' + (base - 5) + ')'],
    ['LINE登録済', '=COUNTIF(F3:F' + (base - 5) + ',"済")'],
    ['入会金 未払', '=COUNTIF(H3:H' + (base - 5) + ',"未")'],
    ['参加費 未払', '=COUNTIF(I3:I' + (base - 5) + ',"未")'],
    ['保険 未加入', '=COUNTIF(J3:J' + (base - 5) + ',"未")']
  ];
  for (var i = 0; i < kpi.length; i++) {
    s.getRange(base + 1 + i, 1).setValue(kpi[i][0]);
    s.getRange(base + 1 + i, 2).setFormula(kpi[i][1]);
  }
  // 入力補助：プルダウン
  var pd = SpreadsheetApp.newDataValidation().requireValueInList(['済', '未'], true).build();
  s.getRange(3, 6, base - 8, 1).setDataValidation(pd);
  s.getRange(3, 8, base - 8, 3).setDataValidation(pd);
  s.getRange(3, 10, base - 8, 1).setDataValidation(pd);
  s.setColumnWidth(1, 120); s.setColumnWidth(4, 120);
}

/* ============================ 06_活動日報 ============================ */

function _buildDaily(ss) {
  var s = _sheet(ss, SH.DAILY);
  _title(s, '06_活動日報 ｜ 指導員が実施ごとに入力。07月次実績の元データ');
  _header(s, 2, ['日付', '月', '種目', '会場', '予定/実施/中止', '参加予定', '実参加', '欠席',
    '指導員数', '指導員稼働時間(計)', '内容', '所感', '事故有無', 'ヒヤリハット有無', '入力者']);
  // 月列は日付から自動
  for (var r = 3; r <= 200; r++) {
    s.getRange(r, 2).setFormula('=IF(A' + r + '="","",TEXT(A' + r + ',"m")&"月")');
    s.getRange(r, 8).setFormula('=IF(F' + r + '="","",F' + r + '-G' + r + ')'); // 欠席=予定-実
    s.getRange(r, 10).setFormula('=IF(I' + r + '="","",I' + r + '*時間_実)');    // 稼働=人数×時間
  }
  s.setColumnWidth(3, 120); s.setColumnWidth(11, 200);
}

/* ============================ 07_月次実績 ============================ */

function _buildMonthly(ss) {
  var s = _sheet(ss, SH.MONTH);
  _title(s, '07_月次実績 ｜ 市・理事会・内部向け月次報告（§11）。06日報から集計');
  _header(s, 2, ['月', '開催種目数', '開催回数', '延べ参加者', '実参加者', '欠席者', '指導員稼働時間',
    '指導員謝金', '事故ケガ', 'ヒヤリハット', '保護者問合せ', 'LINE配信', '参加費収入', '協賛金収入',
    '支出実績', '予算差異', '次月改善事項']);
  var months = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
  var D = "'" + SH.DAILY + "'!";
  for (var i = 0; i < months.length; i++) {
    var r = 3 + i, m = months[i];
    s.getRange(r, 1).setValue(m);
    s.getRange(r, 3).setFormula('=COUNTIFS(' + D + 'B:B,A' + r + ',' + D + 'E:E,"実施")');
    s.getRange(r, 4).setFormula('=SUMIFS(' + D + 'G:G,' + D + 'B:B,A' + r + ')');
    s.getRange(r, 6).setFormula('=SUMIFS(' + D + 'H:H,' + D + 'B:B,A' + r + ')');
    s.getRange(r, 7).setFormula('=SUMIFS(' + D + 'J:J,' + D + 'B:B,A' + r + ')');
    s.getRange(r, 8).setFormula('=G' + r + '*時給_実'); // 稼働時間×時給
    s.getRange(r, 9).setFormula('=COUNTIFS(' + D + 'M:M,"有",' + D + 'B:B,A' + r + ')');
    s.getRange(r, 10).setFormula('=COUNTIFS(' + D + 'N:N,"有",' + D + 'B:B,A' + r + ')');
  }
  var tr = 3 + months.length;
  s.getRange(tr, 1).setValue('年間計').setFontWeight('bold');
  [3, 4, 6, 7, 8, 9, 10, 13, 14, 15].forEach(function (c) {
    var col = _colName(c);
    s.getRange(tr, c).setFormula('=SUM(' + col + '3:' + col + (tr - 1) + ')').setFontWeight('bold');
  });
  s.getRange(tr, 1, 1, 17).setBackground('#eef4fb');
  s.getRange(3, 8, months.length + 1, 1).setNumberFormat('#,##0');
  s.getRange(3, 13, months.length + 1, 4).setNumberFormat('#,##0');
}

/* ============================ 08 / 09 補助対象・対象外 ============================ */

function _buildSubsidy(ss) {
  var s = _sheet(ss, SH.SUBSIDY);
  var p = PropertiesService.getDocumentProperties();
  var E = "'" + SH.EXP + "'!";
  var first = p.getProperty('EXP_FIRST'), last = p.getProperty('EXP_LAST');
  _title(s, '08_補助対象経費 ｜ 02から自動抽出（補助区分が「補助…」）');
  _header(s, 2, ['費目', '金額(円)', '補助区分', '財源', '積算根拠']);
  s.getRange(3, 1).setFormula(
    '=IFERROR(FILTER({' + E + 'B' + first + ':B' + last + ',' + E + 'D' + first + ':D' + last + ',' +
    E + 'F' + first + ':F' + last + ',' + E + 'G' + first + ':G' + last + ',' + E + 'H' + first + ':H' + last + '},' +
    'LEFT(' + E + 'F' + first + ':F' + last + ',2)="補助"),"該当なし")');
  s.getRange(30, 1).setValue('補助対象 合計').setFontWeight('bold');
  s.getRange(30, 2).setFormula('=SUMIF(' + E + 'F' + first + ':F' + last + ',"補助*",' + E + 'D' + first + ':D' + last + ')').setNumberFormat('#,##0').setFontWeight('bold');
  s.getRange(31, 1).setValue('※別添1-2に載せる補助対象。謝金は提出案(A/B)で置換→13参照').setFontColor('#b00');
  s.setColumnWidth(1, 260); s.setColumnWidth(5, 300);
}

function _buildNonSubsidy(ss) {
  var s = _sheet(ss, SH.NONSUB);
  var p = PropertiesService.getDocumentProperties();
  var E = "'" + SH.EXP + "'!";
  var first = p.getProperty('EXP_FIRST'), last = p.getProperty('EXP_LAST');
  _title(s, '09_補助対象外経費 ｜ 02から自動抽出（補助区分に「対象外」を含む）。NPO自主財源で説明');
  _header(s, 2, ['費目', '金額(円)', '補助区分', '財源', '積算根拠']);
  s.getRange(3, 1).setFormula(
    '=IFERROR(FILTER({' + E + 'B' + first + ':B' + last + ',' + E + 'D' + first + ':D' + last + ',' +
    E + 'F' + first + ':F' + last + ',' + E + 'G' + first + ':G' + last + ',' + E + 'H' + first + ':H' + last + '},' +
    'ISNUMBER(SEARCH("対象外",' + E + 'F' + first + ':F' + last + '))),"該当なし")');
  s.getRange(30, 1).setValue('補助対象外 合計').setFontWeight('bold');
  s.getRange(30, 2).setFormula('=SUMIF(' + E + 'F' + first + ':F' + last + ',"*対象外*",' + E + 'D' + first + ':D' + last + ')').setNumberFormat('#,##0').setFontWeight('bold');
  s.setColumnWidth(1, 260); s.setColumnWidth(5, 300);
}

/* ============================ 10_協賛管理 ============================ */

function _buildSponsor(ss) {
  var s = _sheet(ss, SH.SPON);
  _title(s, '10_協賛管理 ｜ 協賛企業台帳（E列＝入金額を03が合計）＋ 収入シミュレーション（§8）');
  _header(s, 2, ['企業名', '担当者名', '連絡先', '協賛区分', '協賛金額(円)', '契約日', '請求日', '入金日',
    '掲載場所', '掲載期間', 'ロゴ有無', '更新予定日', '次回営業', '備考']);
  // 協賛区分プルダウン
  var pd = SpreadsheetApp.newDataValidation()
    .requireValueInList(['胸スポンサー', '背中スポンサー', '袖スポンサー', '応援スポンサー'], true).build();
  s.getRange(3, 4, 100, 1).setDataValidation(pd);
  s.getRange(3, 5, 100, 1).setNumberFormat('#,##0');
  s.getRange(2, 5).setNote('この列(E)の合計が 03_収支サマリー の協賛金に反映されます');

  // シミュレーション
  var b = 40;
  s.getRange(b, 1).setValue('― 協賛金シミュレーション ―').setFontWeight('bold');
  _header(s, b + 1, ['パターン', '社数', '平均単価(円)', '協賛金収入(円)']);
  var sim = [['小規模', 10, 30000], ['中規模', 20, 50000], ['大規模', 30, 80000]];
  for (var i = 0; i < sim.length; i++) {
    var r = b + 2 + i;
    s.getRange(r, 1, 1, 3).setValues([sim[i]]);
    s.getRange(r, 4).setFormula('=B' + r + '*C' + r).setNumberFormat('#,##0');
  }
  var b2 = b + 7;
  s.getRange(b2, 1).setValue('― 協賛区分メニュー（単価目安）―').setFontWeight('bold');
  _header(s, b2 + 1, ['区分', '単価目安(円)', '想定社数', '小計(円)']);
  var menu = [['胸スポンサー', 100000, 5], ['背中スポンサー', 60000, 5], ['袖スポンサー', 30000, 10], ['応援スポンサー', 10000, 10]];
  for (var j = 0; j < menu.length; j++) {
    var r2 = b2 + 2 + j;
    s.getRange(r2, 1, 1, 3).setValues([menu[j]]);
    s.getRange(r2, 4).setFormula('=B' + r2 + '*C' + r2).setNumberFormat('#,##0');
  }
  s.getRange(b2 + 2 + menu.length, 1).setValue('メニュー合計').setFontWeight('bold');
  s.getRange(b2 + 2 + menu.length, 4).setFormula('=SUM(D' + (b2 + 2) + ':D' + (b2 + 1 + menu.length) + ')').setNumberFormat('#,##0').setFontWeight('bold');
  s.setColumnWidth(1, 160);
}

/* ============================ 11_請求入金管理 ============================ */

function _buildBilling(ss) {
  var s = _sheet(ss, SH.BILL);
  _title(s, '11_請求入金管理 ｜ 参加費・協賛金等の請求と消込');
  _header(s, 2, ['請求日', '請求先', '種別', '請求額(円)', '入金日', '入金額(円)', '差額(未収)', '督促状況', '備考']);
  for (var r = 3; r <= 200; r++) {
    s.getRange(r, 7).setFormula('=IF(D' + r + '="","",D' + r + '-N(F' + r + '))');
  }
  var pd = SpreadsheetApp.newDataValidation().requireValueInList(['参加費', '入会金', '保険', 'アプリ料', '協賛金', 'その他'], true).build();
  s.getRange(3, 3, 198, 1).setDataValidation(pd);
  var b = 205;
  s.getRange(b, 1).setValue('未収合計').setFontWeight('bold');
  s.getRange(b, 7).setFormula('=SUM(G3:G200)').setNumberFormat('#,##0').setFontWeight('bold');
  s.getRange(3, 4, 197, 1).setNumberFormat('#,##0');
  s.getRange(3, 6, 197, 2).setNumberFormat('#,##0');
}

/* ============================ 12_年度末精算 ============================ */

function _buildSettlement(ss) {
  var s = _sheet(ss, SH.SETTLE);
  var p = PropertiesService.getDocumentProperties();
  var E = "'" + SH.EXP + "'!", U = "'" + SH.SUM + "'!";
  _title(s, '12_年度末精算 ｜ 予算/実績/差額・補助/対象外・委託料・返還（§12）');
  _header(s, 2, ['精算区分', '予算額(円)', '実績額(円)', '差額(円)', '備考']);
  var rows = [
    ['総事業費', '=' + E + p.getProperty('EXP_TOTAL'), '', '実績は証憑合計を入力'],
    ['　補助対象経費', "='" + SH.SUBSIDY + "'!B30", '', '別添1-2ベース'],
    ['　補助対象外経費', "='" + SH.NONSUB + "'!B30", '', '自主財源で説明'],
    ['市委託料', '=市委託料', '', '事業委託費(直接費)'],
    ['参加者収入', '=参加者数*参加者単価', '', '返還対象の可能性'],
    ['NPO自主財源(協賛+賛助+寄付)', "=正会員収入+賛助個人+賛助法人+寄付金+SUM('" + SH.SPON + "'!E3:E200)", '', '返還対象外'],
    ['返還見込(参加者相当分)', '=' + U + 'B14', '', '市と算式合意'],
    ['返還後 NPO手残り', '=' + U + 'B15', '', '実質収支']
  ];
  for (var i = 0; i < rows.length; i++) {
    var r = 3 + i;
    s.getRange(r, 1).setValue(rows[i][0]);
    if (rows[i][1]) s.getRange(r, 2).setFormula(rows[i][1]).setNumberFormat('#,##0');
    s.getRange(r, 3).setNumberFormat('#,##0'); // 実績は手入力
    s.getRange(r, 4).setFormula('=IF(C' + r + '="","",C' + r + '-B' + r + ')').setNumberFormat('#,##0');
    s.getRange(r, 5).setValue(rows[i][3]).setFontColor('#555');
  }
  // 証憑チェックリスト
  var b = 14;
  s.getRange(b, 1).setValue('― 証憑管理チェックリスト ―').setFontWeight('bold');
  var chk = ['領収書（費目別）', '請求書', '契約書（指導員・協賛・システム）', '出勤簿・謝金支払記録',
    '保険加入者名簿', '活動日報・出席簿', '市への報告書控え', '県への報告書控え'];
  for (var k = 0; k < chk.length; k++) {
    s.getRange(b + 1 + k, 1).setValue(chk[k]);
    s.getRange(b + 1 + k, 2).insertCheckboxes();
  }
  s.setColumnWidth(1, 260); s.setColumnWidth(5, 260);
}

/* ============================ 13_行政提出様式出力（別添1-2） ============================ */

function _buildGov(ss) {
  var s = _sheet(ss, SH.GOV);
  var p = PropertiesService.getDocumentProperties();
  var E = "'" + SH.EXP + "'!";
  _title(s, '13_行政提出様式出力 ｜ 別添1-2（間接補助）。謝金は提出案(A/B)で計上（§13）');
  s.getRange(2, 1).setValue('弥富市｜①休日の地域クラブ活動費等の支援（間接補助）｜積算内訳').setFontWeight('bold');
  _header(s, 3, ['区分', '費目', '積算内訳', '金額(円)']);

  // 提出用は謝金を提出案(A/B)に置換して計上（他は実額と同一）
  var subsidyTotalCell = E + p.getProperty('EXP_SUBSIDY');
  var cA = E + p.getProperty('EXP_C_A'); // A案 F3
  var cC = E + p.getProperty('EXP_C_C'); // C案(実支給) F5

  var rows = [
    ['諸謝金', '指導者謝金(15種目)', '提出案(A/B)：3H×40回×1,600円×30人 等', '=IF(提出案="B",' + E + 'F4,' + cA + ')'],
    ['諸謝金', '指導者講習等講師謝金', '50,000×2回', '=100000'],
    ['人件費', '費用弁償 指導者研修費', '1,800×3H×30人×2回', '=324000'],
    ['人件費', '通勤手当', '210×30人×40回', '=252000'],
    ['人件費', '管理者報酬', '1,800×6H×2人×3日/週×52週', '=3369600'],
    ['旅費', '指導者旅費', '20,000×15種目', '=300000'],
    ['印刷製本費', '募集チラシ・マニュアル', '一式', '=150000'],
    ['備品費', '競技用備品', '40,000×15種目', '=600000'],
    ['消耗品費', '競技用消耗品', '40,000×15種目', '=600000'],
    ['保険料', '指導員保険料', '800×30人', '=24000'],
    ['雑役務費', 'HPサーバ管理料', '5,000×12月', '=60000'],
    ['雑役務費', 'LINE公式プラットフォーム等', '25,000×12月', '=300000'],
    ['委託費', '部活動展開システム運用保守包括委託', '200,000×12月', '=2400000'],
    ['補助金', '諸経費（直工費×30%）', '直接事業費×0.3', '=' + E + p.getProperty('EXP_SHOKEIHI')]
  ];
  var start = 4;
  for (var i = 0; i < rows.length; i++) {
    var r = start + i;
    s.getRange(r, 1, 1, 3).setValues([[rows[i][0], rows[i][1], rows[i][2]]]);
    s.getRange(r, 4).setFormula(rows[i][3]).setNumberFormat('#,##0');
  }
  var tr = start + rows.length;
  s.getRange(tr, 2).setValue('合計（提出用・補助対象）').setFontWeight('bold');
  s.getRange(tr, 4).setFormula('=SUM(D' + start + ':D' + (tr - 1) + ')').setNumberFormat('#,##0').setFontWeight('bold');
  s.getRange(tr, 1, 1, 4).setBackground('#eef4fb');

  s.getRange(tr + 2, 1).setValue('参考：実支給(C案)との差額').setFontWeight('bold');
  s.getRange(tr + 2, 4).setFormula('=' + cC + '-IF(提出案="B",' + E + 'F4,' + cA + ')').setNumberFormat('#,##0').setFontColor('#b00');
  // 資料③（実提出＝C案）は補助対象16,039,600＋諸経費4,811,880＝20,851,480＝市委託料に一致
  s.getRange(tr + 3, 1).setValue('参考：資料③実績＝実支給C案 合計').setFontWeight('bold');
  s.getRange(tr + 3, 4).setFormula('=' + E + p.getProperty('EXP_SUBSIDY') + '+' + E + p.getProperty('EXP_SHOKEIHI')).setNumberFormat('#,##0');
  s.getRange(tr + 3, 3).setValue('補助対象16,039,600＋諸経費4,811,880');
  s.getRange(tr + 4, 1).setValue('　（比較）市委託料').setFontWeight('bold');
  s.getRange(tr + 4, 4).setFormula('=市委託料').setNumberFormat('#,##0');
  s.getRange(tr + 4, 3).setValue('↑ C案合計＝委託料に一致（資料③の実提出）');
  s.getRange(tr + 6, 1).setValue('※資料③別添1-2の実提出はC案(20,851,480＝委託料)。提出案をA/Bにすると委託料と差が出る。').setFontColor('#b00');
  s.getRange(tr + 7, 1).setValue('　差額は委託料内配分/自主財源で説明（§1-3）。この様式は基準額で提出、実支給は02/03で管理。').setFontColor('#b00');
  s.setColumnWidth(2, 260); s.setColumnWidth(3, 320);
}

/* ============================ 14_収支予算書（会計要項） ============================ */

function _buildBudgetStatement(ss) {
  var s = _sheet(ss, SH.BUDGET);
  var p = PropertiesService.getDocumentProperties();
  var E = "'" + SH.EXP + "'!";
  var kai = p.getProperty('EXP_KAIKEI');                 // 'I'
  var f = p.getProperty('EXP_FIRST'), l = p.getProperty('EXP_LAST');
  var Irng = E + kai + f + ':' + kai + l, Drng = E + 'D' + f + ':D' + l;
  var syo = E + p.getProperty('EXP_SHOKEIHI');           // 諸経費
  var spon = "SUM('" + SH.SPON + "'!E3:E200)";           // 協賛金合計
  var kaihi = '正会員収入+賛助個人+賛助法人';

  _title(s, '14_収支予算書（会計要項）｜ 00_入力条件の参加者数で連動。収入の部／支出の部（事業費・管理費）');
  _header(s, 2, ['科目', '予算額(円)', '積算 / 備考']);

  // ※各行は r=i+3。相互参照は下記の実行番号に一致させること。
  //   3見出/4会費計/5正/6個/7法/8利用/9事業計/10参加費/11保険/12アプリ/13委託/14協賛/15寄付/16収入合計
  //   17見出/18事業費/19人件費/20その他/21諸経費/22管理費/23支出合計/24当期/25見出/26返還見込/27返還後/28必要協賛
  var rows = [
    ['【収入の部】', '', '', 'grp'],
    ['会費収入', '=B5+B6+B7+B8', '小計', 'sub'],
    ['　正会員入会金', '=正会員収入', '', ''],
    ['　賛助会員会費(個人)', '=賛助個人', '', ''],
    ['　賛助会員会費(法人)', '=賛助法人', '', ''],
    ['　利用会員入会金', '=参加者数*利用入会金', '参加者数×単価', ''],
    ['事業収入', '=B10+B11+B12', '小計', 'sub'],
    ['　参加費収入', '=参加者数*参加費月額*参加月数', '', ''],
    ['　スポーツ安全保険料', '=参加者数*保険単価', '', ''],
    ['　アプリ使用料収入', '=参加者数*アプリ単価', '', ''],
    ['補助金等収入（市委託料）', '=市委託料', '', 'sub'],
    ['協賛金収入', '=' + spon, '10_協賛管理', 'sub'],
    ['寄付金収入', '=寄付金', '', 'sub'],
    ['収入合計', '=B4+B9+B13+B14+B15', '', 'total'],
    ['【支出の部】', '', '', 'grp'],
    ['事業費', '=B19+B20+B21', '人件費+その他+諸経費', 'sub'],
    ['　人件費(小計)', '=SUMIF(' + Irng + ',"人件費",' + Drng + ')', '指導者謝金ほか', ''],
    ['　その他事業費(小計)', '=SUMIF(' + Irng + ',"その他事業費",' + Drng + ')', '', ''],
    ['　諸経費(直接×30%)', '=' + syo, '', ''],
    ['管理費', '=SUMIF(' + Irng + ',"管理費",' + Drng + ')', '間接費', 'sub'],
    ['支出合計', '=B18+B22', '', 'total'],
    ['当期収支差額（収入−支出）', '=B16-B23', '', 'bal'],
    ['【参考】返還・自主財源', '', '', 'grp'],
    ['　返還見込（参加者相当分）', '=参加者数*参加者単価', '資料②備考', ''],
    ['　返還後 収支差額', '=B24-B26', '', 'bal'],
    ['　必要協賛金の目安', '=B22-(' + kaihi + ')-寄付金', '管理費−固定会費', '']
  ];
  for (var i = 0; i < rows.length; i++) {
    var r = i + 3;
    s.getRange(r, 1).setValue(rows[i][0]);
    if (rows[i][1]) s.getRange(r, 2).setFormula(rows[i][1]).setNumberFormat('#,##0');
    if (rows[i][2]) s.getRange(r, 3).setValue(rows[i][2]).setFontColor('#666');
    var cls = rows[i][3];
    if (cls === 'grp') s.getRange(r, 1, 1, 3).setBackground('#e8eef7').setFontWeight('bold');
    if (cls === 'sub') { s.getRange(r, 1).setFontWeight('bold'); s.getRange(r, 2).setFontWeight('bold'); }
    if (cls === 'total') s.getRange(r, 1, 1, 3).setBackground('#eef7ee').setFontWeight('bold');
    if (cls === 'bal') s.getRange(r, 1, 1, 3).setBackground('#fff7e0').setFontWeight('bold');
  }
  s.setColumnWidth(1, 260); s.setColumnWidth(3, 220);
}

/* ============================ 15_中期収支計画（成長カーブ） ============================ */

function _buildMidterm(ss) {
  var s = _sheet(ss, SH.MID);
  var p = PropertiesService.getDocumentProperties();
  var total = "'" + SH.EXP + "'!" + p.getProperty('EXP_TOTAL');   // 総事業費
  var indirect = "'" + SH.EXP + "'!" + p.getProperty('EXP_INDIRECT'); // 間接
  var kaihi = '正会員収入+賛助個人+賛助法人';

  _title(s, '15_中期収支計画（成長カーブ）｜ 年度別の参加者・協賛を入力（黄）。支出計は02連動、参加者連動収入が返還対象');
  // 年度ヘッダ（編集可） 行2、B..F
  var yLabels = ['R9', 'R10', 'R11', 'R12', 'R13'];
  s.getRange(2, 1).setValue('年度').setFontWeight('bold').setBackground('#e8eef7');
  s.getRange(2, 2, 1, 5).setValues([yLabels]).setFontWeight('bold').setBackground('#e8eef7').setHorizontalAlignment('right');
  s.setFrozenRows(2); s.setFrozenColumns(1);

  // 入力行：参加者(3)・協賛(4)
  s.getRange(3, 1).setValue('参加者数（入力）');
  s.getRange(3, 2, 1, 5).setValues([[200, 240, 280, 300, 320]]).setBackground('#fffbe6');
  s.getRange(4, 1).setValue('協賛金（入力）');
  s.getRange(4, 2, 1, 5).setValues([[0, 0, 0, 0, 0]]).setBackground('#fffbe6');

  var cols = ['B', 'C', 'D', 'E', 'F'];
  // 計算行の定義：[ラベル, 行, 各列の数式(colを受け取る), クラス]
  var calcRows = [
    ['収入計', 5, function (c) { return '=(' + kaihi + '+市委託料)+' + c + '3*参加者単価+' + c + '4+寄付金'; }, 'sub'],
    ['支出計（02連動）', 6, function (c) { return '=' + total; }, 'sub'],
    ['当期収支差額', 7, function (c) { return '=' + c + '5-' + c + '6'; }, 'bal'],
    ['返還見込（参加者相当分）', 8, function (c) { return '=' + c + '3*参加者単価'; }, ''],
    ['返還後 収支差額', 9, function (c) { return '=' + c + '7-' + c + '8'; }, 'bal'],
    ['必要協賛金の目安', 10, function (c) { return '=' + indirect + '-(' + kaihi + ')-寄付金'; }, ''],
    ['返還後 累計', 11, null, 'total']
  ];
  for (var i = 0; i < calcRows.length; i++) {
    var def = calcRows[i], r = def[1];
    s.getRange(r, 1).setValue(def[0]);
    if (def[2]) {
      for (var c = 0; c < 5; c++) s.getRange(r, c + 2).setFormula(def[2](cols[c]));
    }
    var cls = def[3];
    if (cls === 'sub') s.getRange(r, 1).setFontWeight('bold');
    if (cls === 'bal') s.getRange(r, 1, 1, 6).setBackground('#fff7e0').setFontWeight('bold');
    if (cls === 'total') s.getRange(r, 1, 1, 6).setBackground('#eef7ee').setFontWeight('bold');
    s.getRange(r, 2, 1, 5).setNumberFormat('#,##0');
  }
  // 返還後累計（行11）：B=B9, C=B11+C9 ...
  s.getRange(11, 2).setFormula('=B9');
  s.getRange('C11').setFormula('=B11+C9'); s.getRange('D11').setFormula('=C11+D9');
  s.getRange('E11').setFormula('=D11+E9'); s.getRange('F11').setFormula('=E11+F9');
  s.getRange(11, 2, 1, 5).setNumberFormat('#,##0');

  s.getRange(13, 1).setValue('※前提（単価・費目・採用案）は全年度共通。参加者だけ増やしても返還後はほぼ一定＝手残りは協賛/単価/費目の見直しで改善。').setFontColor('#b00');
  s.setColumnWidth(1, 210);
  for (var w = 2; w <= 6; w++) s.setColumnWidth(w, 110);
}

/* ============================ ★月次シミュレーション（主軸） ============================ */

function _buildMonthlySim(ss) {
  var s = _sheet(ss, SH.MSIM);
  var p = PropertiesService.getDocumentProperties();
  var E = "'" + SH.EXP + "'!";
  var TOTAL = E + p.getProperty('EXP_TOTAL');       // 総事業費
  var SAL = E + 'D' + p.getProperty('EXP_FIRST');   // 指導員謝金(採用案連動) セル
  var 通勤年 = 252000;                               // 210×40回×30人（年）

  _title(s, '★月次シミュレーション（主軸）｜ 黄=入力（開催回数・参加者・その他収入・協賛）。年間へ集約し02/14と一致');
  _header(s, 2, ['月', '開催回数', '参加者数', '参加費収入', 'その他収入(一時)', '市委託料',
    '協賛金', '収入計', '指導員謝金', '通勤手当', '運営費(固定)', '支出計', '月次収支', '累計収支']);

  // 月と入力の既定値（9〜3月に活動、40回、参加者200、一時金は9月に一括）
  var 一時 = '=参加者数*(利用入会金+保険単価+アプリ単価)+正会員収入+賛助個人+賛助法人'; // 入会+保険+アプリ+固定会費
  var months = [
    ['4月', 0, 0, 0], ['5月', 0, 0, 0], ['6月', 0, 0, 0], ['7月', 0, 0, 0], ['8月', 0, 0, 0],
    ['9月', 6, 200, 1], ['10月', 6, 200, 0], ['11月', 6, 200, 0], ['12月', 6, 200, 0],
    ['1月', 6, 200, 0], ['2月', 5, 200, 0], ['3月', 5, 200, 0]
  ];
  var start = 3;
  for (var i = 0; i < months.length; i++) {
    var r = start + i, m = months[i];
    s.getRange(r, 1).setValue(m[0]);
    s.getRange(r, 2).setValue(m[1]);                 // B 開催回数(入力)
    s.getRange(r, 3).setValue(m[2]);                 // C 参加者数(入力)
    // D 参加費収入 = 活動月のみ 参加者×月額
    s.getRange(r, 4).setFormula('=IF(B' + r + '>0,C' + r + '*参加費月額,0)');
    // E その他収入(一時) 9月のみ 入会+保険+アプリ+固定会費、他は0（入力可）
    s.getRange(r, 5).setValue(0);
    if (m[3] === 1) s.getRange(r, 5).setFormula(一時);
    // F 市委託料 = 委託料/12
    s.getRange(r, 6).setFormula('=市委託料/12');
    // G 協賛金(入力)
    s.getRange(r, 7).setValue(0);
    // H 収入計
    s.getRange(r, 8).setFormula('=D' + r + '+E' + r + '+F' + r + '+G' + r);
    // I 指導員謝金 = 開催回数 × (年間謝金/回数)
    s.getRange(r, 9).setFormula('=B' + r + '*(' + SAL + '/回数)');
    // J 通勤手当 = 開催回数 × 指導員数 × 210
    s.getRange(r, 10).setFormula('=B' + r + '*指導員数*210');
    // K 運営費(固定) = (総事業費 − 謝金年 − 通勤年)/12
    s.getRange(r, 11).setFormula('=(' + TOTAL + '-' + SAL + '-' + 通勤年 + ')/12');
    // L 支出計
    s.getRange(r, 12).setFormula('=I' + r + '+J' + r + '+K' + r);
    // M 月次収支
    s.getRange(r, 13).setFormula('=H' + r + '-L' + r);
    // N 累計収支
    s.getRange(r, 14).setFormula(i === 0 ? '=M' + r : '=N' + (r - 1) + '+M' + r);
  }
  // 入力セルを黄色
  s.getRange(start, 2, months.length, 2).setBackground('#fffbe6'); // 開催回数・参加者
  s.getRange(start, 5, months.length, 1).setBackground('#fffbe6'); // その他収入
  s.getRange(start, 7, months.length, 1).setBackground('#fffbe6'); // 協賛

  // 計 行
  var tr = start + months.length;
  s.getRange(tr, 1).setValue('計').setFontWeight('bold');
  ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].forEach(function (col) {
    s.getRange(col + tr).setFormula('=SUM(' + col + start + ':' + col + (tr - 1) + ')').setFontWeight('bold');
  });
  s.getRange(tr, 14).setFormula('=M' + tr).setFontWeight('bold'); // 累計=年間収支
  s.getRange(tr, 1, 1, 14).setBackground('#eef7ee');

  // 照合行
  var cr = tr + 2;
  s.getRange(cr, 1).setValue('▼ 年間照合（02/14と一致するはず）').setFontWeight('bold');
  s.getRange(cr + 1, 1).setValue('収入計(年)');   s.getRange(cr + 1, 2).setFormula('=H' + tr);
  s.getRange(cr + 1, 4).setValue('＝14_収支予算書 収入合計 / 目安 24,272,480（200人・協賛0）');
  s.getRange(cr + 2, 1).setValue('支出計(年)');   s.getRange(cr + 2, 2).setFormula('=L' + tr);
  s.getRange(cr + 2, 4).setValue('＝総事業費 21,596,280');
  s.getRange(cr + 3, 1).setValue('当期収支差額(年)'); s.getRange(cr + 3, 2).setFormula('=M' + tr);
  s.getRange(cr + 3, 4).setValue('＝2,676,200（返還前）');
  s.getRange(cr + 5, 1).setValue('※開催回数の計＝40、参加者・協賛・一時金は入力で調整。参加費は活動月のみ計上。').setFontColor('#b00');

  // 書式
  s.getRange(start, 4, months.length + 1, 11).setNumberFormat('#,##0');
  s.getRange(cr + 1, 2, 3, 1).setNumberFormat('#,##0');
  s.setColumnWidth(1, 64); for (var w = 2; w <= 14; w++) s.setColumnWidth(w, 96);
  s.setColumnWidth(5, 130); s.setColumnWidth(4, 130);
}
