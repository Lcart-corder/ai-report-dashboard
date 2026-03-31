const vi = {
  // Common
  app_title: "Báo cáo sản xuất",
  loading: "Đang tải...",
  save: "Lưu",
  cancel: "Hủy",
  delete: "Xóa",
  confirm: "Xác nhận",
  back: "Quay lại",
  close: "Đóng",
  error: "Đã xảy ra lỗi",
  success: "Đã lưu thành công",
  required: "Bắt buộc",

  // Login
  login_title: "Hệ thống báo cáo sản xuất",
  login_subtitle: "Quản lý sản xuất nhà máy",
  login_button: "Đăng nhập bằng Google",
  login_unauthorized: "Tài khoản này chưa được đăng ký",
  logout: "Đăng xuất",

  // Home
  home_title: "Trang chủ",
  home_today_report: "Báo cáo hôm nay",
  home_no_report: "Chưa tạo báo cáo",
  home_create_report: "Tạo báo cáo",
  home_continue_input: "Tiếp tục nhập",
  home_view_summary: "Xem tổng hợp",
  home_progress: "Tiến độ nhập",
  home_slots_filled: "Đã nhập {filled}/{total} khung giờ",
  home_past_reports: "Báo cáo trước đây",
  home_pending_approvals: "Danh sách chờ phê duyệt",
  home_no_pending: "Không có mục chờ phê duyệt",
  home_machine_select: "Chọn máy",

  // Time Slot List
  slot_list_title: "Danh sách khung giờ",
  slot_next_input: "Nhập tiếp",
  slot_status_empty: "Chưa nhập",
  slot_status_filled: "Đã nhập",
  slot_status_has_stop: "Có dừng máy",
  slot_input_button: "Nhập",
  slot_go_to_next: "Nhập khung giờ tiếp theo",

  // Input Form
  input_title: "Nhập khung giờ",
  input_case_no_start: "Số Case bắt đầu",
  input_case_no_end: "Số Case kết thúc",
  input_product_name: "Tên sản phẩm",
  input_has_stop: "Dừng máy",
  input_has_stop_yes: "Có",
  input_has_stop_no: "Không",
  input_stop_code: "Mã dừng",
  input_stop_time: "Thời gian dừng (phút)",
  input_abnormality: "Nội dung bất thường",
  input_discharge_count: "Số lượng xả",
  input_machine_discharge: "Xả máy",
  input_verification: "Đối chiếu",
  input_first_weight: "Trọng lượng 1ST",
  input_judgment: "Phán định",
  input_judgment_pass: "Đạt",
  input_judgment_fail: "Không đạt",
  input_save_next: "Lưu và tiếp tục",
  input_save_next_with_time: "Lưu và tiếp tục ({time}〜)",
  input_save_complete: "Lưu và xem tổng hợp",
  input_delete_confirm: "Bạn có muốn xóa dữ liệu này không?",
  input_select_stop_code: "Chọn mã dừng",

  // Summary
  summary_title: "Tổng hợp báo cáo",
  summary_total_discharge: "Tổng số lượng xả",
  summary_total_machine_discharge: "Tổng xả máy",
  summary_stop_count: "Số lần dừng",
  summary_ng_count: "Số lượng NG",
  summary_total_stop_minutes: "Tổng thời gian dừng (phút)",
  summary_time_slot_table: "Bảng theo khung giờ",
  summary_submit: "Gửi yêu cầu phê duyệt",
  summary_submit_confirm:
    "Bạn có muốn gửi yêu cầu phê duyệt? Sau khi gửi sẽ không thể chỉnh sửa.",
  summary_already_submitted: "Đã gửi yêu cầu phê duyệt",
  summary_not_complete: "Chưa nhập đủ tất cả khung giờ",

  // Approval
  approval_title: "Phê duyệt",
  approval_status: "Trạng thái phê duyệt",
  approval_approve: "Phê duyệt",
  approval_reject: "Trả lại",
  approval_comment: "Bình luận",
  approval_comment_required: "Bình luận là bắt buộc khi trả lại",
  approval_approve_confirm: "Bạn có muốn phê duyệt không?",
  approval_reject_confirm: "Bạn có muốn trả lại không?",
  approval_pending: "Chờ phê duyệt",
  approval_approved: "Đã phê duyệt",
  approval_rejected: "Đã trả lại",
  approval_step_kakarichou: "Trưởng nhóm",
  approval_step_hinshitsu: "QA",
  approval_step_buchou: "Trưởng phòng",

  // Status
  status_draft: "Bản nháp",
  status_submitted: "Đang xin phê duyệt",
  status_approved_kakarichou: "Trưởng nhóm đã duyệt",
  status_approved_hinshitsu: "QA đã duyệt",
  status_approved_buchou: "Đã xác nhận",
  status_rejected: "Đã trả lại",
  status_resubmitted: "Đang xin phê duyệt lại",

  // Machine
  machine_m06: "Máy số 6",
  machine_m07: "Máy số 7",
} as const;

export default vi;
