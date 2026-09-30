import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface CheatWord {
  korean: string;
  type: 'RED' | 'GREEN';
  meaningVi: string;
  professorTrapVi: string;
}

const CHEAT_WORDS: CheatWord[] = [
  {
    korean: '출력 / 인쇄 / 지참 (출력하여 지참)',
    type: 'RED',
    meaningVi: 'In ra và mang theo vào lớp',
    professorTrapVi: 'Giáo sư Hàn KHÔNG phát đề ở lớp. Bắt buộc phải in trước ở KTX/quán photo!'
  },
  {
    korean: '과제 제출 / 업로드 / 마감',
    type: 'RED',
    meaningVi: 'Nộp bài tập / tải file lên LMS đúng hạn',
    professorTrapVi: 'Hệ thống tự động đóng lúc 23:59. Nộp trễ 1 phút coi như 0 điểm.'
  },
  {
    korean: '퀴즈 / 쪽지시험 (단원평가)',
    type: 'RED',
    meaningVi: 'Kiểm tra nhanh 5-10 phút đầu giờ',
    professorTrapVi: 'Giáo sư dùng để điểm danh ngầm. Đến trễ là không được thi lại!'
  },
  {
    korean: '노트북 / 준비물 지참',
    type: 'RED',
    meaningVi: 'Mang laptop, sạc pin và dụng cụ học tập',
    professorTrapVi: 'Không có thiết bị thực hành sẽ ngồi không và mất điểm buổi đó.'
  },
  {
    korean: '별도의 과제 제출은 없습니다 (과제 없음)',
    type: 'GREEN',
    meaningVi: 'Tuần này không có bài tập phải nộp lên LMS',
    professorTrapVi: 'Cẩn thận: Không có bài nộp KHÔNG CÓ NGHĨA là không cần in tài liệu mang theo!'
  },
  {
    korean: '참고자료 / 권장도서 / 예습',
    type: 'GREEN',
    meaningVi: 'Tài liệu đọc thêm / Khuyến khích xem trước',
    professorTrapVi: 'Không bắt buộc. Nếu tối nay bận thì chỉ cần đọc lướt mục lục là được.'
  },
  {
    korean: '자율 학습 / 자유 참여',
    type: 'GREEN',
    meaningVi: 'Tự học tự do, không bắt buộc điểm danh',
    professorTrapVi: 'Không ảnh hưởng điểm chuyên cần nếu vắng.'
  }
];

export const KoreanLmsCheatSheet: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="section-cheatsheet" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Sổ tay bỏ túi: 7 từ khoá LMS "bẫy" sinh viên năm nhất</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 border border-slate-200">
                Đọc 1 phút là hiểu
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Nhận biết tức thì từ nào Bắt buộc (Đỏ) và từ nào Tham khảo (Xanh)
            </p>
          </div>
        </div>

        <div className="text-slate-400 p-1">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-4 pt-0 border-t border-slate-200 bg-slate-50/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
            {CHEAT_WORDS.map((w, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs ${
                  w.type === 'RED'
                    ? 'bg-rose-50/60 border-rose-200 text-slate-800'
                    : 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="font-bold text-sm tracking-tight font-mono text-slate-900">
                    {w.korean}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      w.type === 'RED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {w.type === 'RED' ? '🔴 BẮT BUỘC' : '🟢 THAM KHẢO'}
                  </span>
                </div>
                <div className="font-semibold text-slate-700 mt-1">
                  👉 {w.meaningVi}
                </div>
                <div className="text-[11px] text-amber-800 mt-1 italic">
                  💡 {w.professorTrapVi}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
