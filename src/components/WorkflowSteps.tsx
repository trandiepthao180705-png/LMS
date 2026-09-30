import React from 'react';
import { ClipboardEdit, SplitSquareVertical, CheckSquare2, ArrowRight } from 'lucide-react';

interface WorkflowStepsProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
  isAllCompleted?: boolean;
}

export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  currentStep,
  onStepClick,
  isAllCompleted,
}) => {
  const steps = [
    {
      step: 1 as const,
      numKo: '1단계',
      numVi: 'Bước 1',
      titleKo: '공지 붙여넣기',
      titleVi: 'Dán thông báo LMS',
      descVi: 'Dán tiếng Hàn hoặc chọn mẫu',
      icon: ClipboardEdit,
    },
    {
      step: 2 as const,
      numKo: '2단계',
      numVi: 'Bước 2',
      titleKo: '빨강/초록 확인',
      titleVi: 'Phân loại Đỏ / Xanh',
      descVi: '🔴 Bắt buộc & 🟢 Tham khảo',
      icon: SplitSquareVertical,
    },
    {
      step: 3 as const,
      numKo: '3단계',
      numVi: 'Bước 3',
      titleKo: '완료 체크',
      titleVi: 'Đánh dấu hoàn thành',
      descVi: isAllCompleted ? '✓ Đã sẵn sàng 100%' : 'Tích "Đã in / Đã làm"',
      icon: CheckSquare2,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            사용 단계 안내 · Quy trình 3 bước cho Đức
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
          3단계만 거치면 내일 수업 준비 끝!
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        {steps.map((s, idx) => {
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step || (s.step === 3 && isAllCompleted);
          const Icon = s.icon;

          return (
            <div
              key={s.step}
              onClick={() => onStepClick?.(s.step)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex items-start gap-3 select-none ${
                isActive
                  ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200 shadow-xs'
                  : isDone
                  ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
              }`}
            >
              {/* Step number badge / icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Text info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-800'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {s.numKo} · {s.numVi}
                  </span>
                  {isDone && (
                    <span className="text-[10px] font-bold text-emerald-600">✓ 완료</span>
                  )}
                </div>

                <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1 truncate">
                  {s.titleKo}
                </div>
                <div className="text-[11px] text-slate-600 font-medium truncate">
                  {s.titleVi}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {s.descVi}
                </div>
              </div>

              {/* Arrow separator for desktop */}
              {idx < 2 && (
                <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 text-slate-300 z-10 pointer-events-none">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
