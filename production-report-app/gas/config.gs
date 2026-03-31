/**
 * 設定値 — シート名・定数
 */
var CONFIG = {
  SPREADSHEET_ID: '1sttdBmN6V5WLrAp7vagFlWePk_ldV1auVFzqj8-XrNc',

  SHEETS: {
    USERS:             'Users',
    DAILY_REPORTS:     'DailyReports',
    TIME_SLOTS:        'TimeSlots',
    PRODUCTION_INPUTS: 'ProductionInputs',
    APPROVALS:         'Approvals',
    STOP_CODES:        'StopCodes',
    AUDIT_LOG:         'AuditLog',
  },

  // 承認順序（固定）
  APPROVAL_ORDER: ['kakarichou', 'hinshitsu', 'buchou'],

  // 承認者ごとに承認可能な日報status
  APPROVABLE_STATUS: {
    kakarichou: ['submitted', 'resubmitted'],
    hinshitsu:  ['approved_kakarichou'],
    buchou:     ['approved_hinshitsu'],
  },

  // 承認後のstatus
  APPROVED_STATUS: {
    kakarichou: 'approved_kakarichou',
    hinshitsu:  'approved_hinshitsu',
    buchou:     'approved_buchou',
  },

  // 時間帯（7:00開始、24本）
  TIME_SLOT_HOURS: [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0,1,2,3,4,5,6],
};
