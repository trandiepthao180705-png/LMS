import { SampleNotice } from '../types.ts';

export const SAMPLE_NOTICES: SampleNotice[] = [
  {
    id: 'sample-duc-painpoint',
    tag: 'Tình huống của Đức',
    title: 'Mẫu 1: In bài giảng & Không có bài tập (Bẫy sv năm nhất)',
    scenario: 'Đức nhìn thấy "과제 없음" nên suýt không in bài, sáng mai lên lớp ai cũng có tài liệu trừ mình!',
    koreanText: `[다음 주 강의 안내]
안녕하세요. 담당 교수입니다.
1주차 학습자료실에 업로드된 강의계획서 및 수업자료(1-2주차 PDF)를 반드시 출력하여 수업에 지참하시기 바랍니다.
이번 주는 별도의 과제 제출은 없습니다. 수업 시간에 뵙겠습니다.`,
    quickNote: '🔴 Đỏ: Phải in tài liệu mang theo | 🟢 Xanh: Không có bài tập nộp trên web'
  },
  {
    id: 'sample-quiz-prep',
    tag: 'Quiz & Đọc bài',
    title: 'Mẫu 2: Quiz 10 phút đầu giờ & Đọc trước giáo trình',
    scenario: 'LMS ghi "đọc chương 2" và có "쪽지시험", không để ý là mất trọn điểm chuyên cần!',
    koreanText: `[3주차 수업 공지]
다음 주 강의 시작 직후 10분간 지난주 학습 내용에 대한 간단한 퀴즈(쪽지시험)가 진행될 예정입니다. 결석이나 지각 시 재시험은 불가합니다.
교재 45~70페이지 내용은 강의 전 자율적으로 참고하여 읽어오시기 바랍니다.`,
    quickNote: '🔴 Đỏ: Có Quiz đầu giờ, tuyệt đối không đi trễ | 🟢 Xanh: Đọc sách chỉ là khuyến khích'
  },
  {
    id: 'sample-assignment-strict',
    tag: 'Nộp bài & Laptop',
    title: 'Mẫu 3: Nộp file báo cáo trước 23:59 & Mang laptop',
    scenario: 'Hạn nộp đêm nay và phải mang thiết bị thực hành vào lớp ngày mai.',
    koreanText: `[실습 과제 제출 및 준비물 안내]
1. 1차 과제물(PDF 형식, 학번_이름.pdf)은 목요일 자정(23:59)까지 과제방에 업로드 필수. 마감 이후 시스템 자동 차단됩니다.
2. 금요일 실습 수업에는 개인 노트북과 충전기를 반드시 지참하여 참석하세요.`,
    quickNote: '🔴 Đỏ: Nộp PDF trước 23:59 + Mang laptop có sạc | 🟢 Xanh: Định dạng tên file chuẩn'
  },
  {
    id: 'sample-pure-info',
    tag: 'Tuần nhẹ nhàng',
    title: 'Mẫu 4: Thông báo phòng học & Không có bài tập',
    scenario: 'Thông báo thuần thông tin, không có hành động bắt buộc nào.',
    koreanText: `[강의실 이동 및 안내]
내일 수업은 인문관 302호에서 정상 진행됩니다.
이번 주말까지 별도 과제는 없으며, 강의 관련 문의는 조교 이메일(ta_assistant@univ.ac.kr)로 연락 바랍니다.`,
    quickNote: '🟢 Xanh: Phòng học & Email trợ giảng, không có việc gấp tối nay'
  }
];
