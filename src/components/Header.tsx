import React from 'react';
import { Moon, GraduationCap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rose-500 to-emerald-500 p-0.5 shadow-sm shadow-slate-300 flex-shrink-0">
              <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center">
                  <span className="text-rose-600">C</span>
                  <span className="text-emerald-600">ò</span>
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                  Cò Lọc LMS
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 font-medium">
                  LMS Red-Green Classifier
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                Lọc thông báo LMS tiếng Hàn thành việc <span className="text-rose-600 font-semibold">🔴 Bắt buộc</span> và <span className="text-emerald-700 font-semibold">🟢 Tham khảo</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 text-xs text-slate-700">
            <Moon className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="text-slate-500">KTX lúc 19:00:</span>
            <span className="text-amber-900 font-medium">Chuẩn bị bài ngày mai</span>
            <span className="hidden sm:inline-block text-amber-200">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-500">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              Tự tin lên lớp
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
