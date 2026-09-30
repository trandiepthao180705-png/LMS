import React from 'react';
import { ClassificationResult, ChecklistItem } from '../types.ts';
import {
  AlertTriangle,
  CheckCircle2,
  Printer,
  FileCheck2,
  Clock,
  Lightbulb,
  Check,
  Laptop,
  CheckSquare2,
  Square,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface ClassificationDisplayProps {
  result: ClassificationResult;
  completedChecklistIds: string[];
  onToggleCheck: (id: string) => void;
  onMarkAllCompleted: () => void;
}

export const ClassificationDisplay: React.FC<ClassificationDisplayProps> = ({
  result,
  completedChecklistIds,
  onToggleCheck,
  onMarkAllCompleted,
}) => {
  const { summary, redItems, greenItems } = result;

  // Collect all checklist actions from red items
  const allRedChecklists: { itemId: string; check: ChecklistItem }[] = [];
  redItems.forEach((item) => {
    if (item.checklistItems && item.checklistItems.length > 0) {
      item.checklistItems.forEach((chk) => {
        allRedChecklists.push({ itemId: item.id, check: chk });
      });
    } else {
      allRedChecklists.push({
        itemId: item.id,
        check: {
          id: `chk-fallback-${item.id}`,
          label: item.titleVi.replace(/^BẮT BUỘC:\s*/, ''),
          sublabel: item.actionItem || 'Thực hiện trước giờ học',
        },
      });
    }
  });

  const totalChecks = allRedChecklists.length;
  const completedCount = allRedChecklists.filter(({ check }) =>
    completedChecklistIds.includes(check.id)
  ).length;
  const isAllCompleted = totalChecks > 0 && completedCount === totalChecks;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PRINT':
        return <Printer className="w-4 h-4 text-rose-600" />;
      case 'SUBMIT':
        return <FileCheck2 className="w-4 h-4 text-rose-600" />;
      case 'QUIZ':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'PREPARATION':
        return <Laptop className="w-4 h-4 text-rose-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Big Verdict Summary Banner */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border transition-all ${
          summary.hasMandatoryAction
            ? isAllCompleted
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs'
              : 'bg-rose-50/80 border-rose-300 text-rose-950 shadow-xs'
            : 'bg-teal-50/80 border-teal-300 text-teal-950 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl flex-shrink-0 ${
                isAllCompleted
                  ? 'bg-emerald-100 text-emerald-700'
                  : summary.hasMandatoryAction
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-teal-100 text-teal-700'
              }`}
            >
              {isAllCompleted ? (
                <CheckCircle className="w-6 h-6 text-emerald-700" />
              ) : summary.hasMandatoryAction ? (
                <AlertTriangle className="w-6 h-6 text-rose-700" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-teal-700" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isAllCompleted
                      ? 'bg-emerald-200/80 text-emerald-900 border border-emerald-300'
                      : summary.hasMandatoryAction
                      ? 'bg-rose-200/80 text-rose-900 border border-rose-300'
                      : 'bg-teal-200/80 text-teal-900 border border-teal-300'
                  }`}
                >
                  {isAllCompleted
                    ? '🎉 완료됨 · ĐÃ HOÀN THÀNH'
                    : summary.hasMandatoryAction
                    ? '🔴 필수 할 일 있음 · CÓ VIỆC BẮT BUỘC'
                    : '🟢 안심 · AN TÂM THAM KHẢO'}
                </span>
                <span className="text-xs text-slate-600">
                  {summary.redCount}개 필수 (bắt buộc) · {summary.greenCount}개 참고 (tham khảo)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                {isAllCompleted
                  ? 'Tuyệt vời Đức ơi! Đã in bài và chuẩn bị xong toàn bộ cho sáng mai.'
                  : summary.mainTakeaway}
              </h2>
            </div>
          </div>

          {/* Quick status badge / Progress */}
          {summary.hasMandatoryAction ? (
            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-rose-200/60 pt-2 sm:pt-0">
              <span className="text-xs text-slate-500">내일 준비 진행 상황 (Tiến độ):</span>
              <span
                className={`text-sm font-extrabold ${
                  isAllCompleted ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isAllCompleted ? '✓ 출력 완료 (Đã xong)' : `${completedCount}/${totalChecks} 완료 (Đã làm)`}
              </span>
            </div>
          ) : (
            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-teal-200/60 pt-2 sm:pt-0">
              <span className="text-xs text-slate-500">상태 (Trạng thái):</span>
              <span className="text-sm font-extrabold text-teal-800">안전 100% (An toàn)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Split: RED vs GREEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ===================== CỘT ĐỎ: CHECKLIST BẮT BUỘC ===================== */}
        <div className="bg-white rounded-2xl border-2 border-rose-200 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            {/* Header of Red Column */}
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-xs flex-shrink-0" />
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-rose-900 flex items-center gap-1.5">
                    <span>🔴 빨강: 필수 할 일</span>
                  </h3>
                  <span className="text-xs text-rose-700 font-medium">
                    (ĐỎ: BẮT BUỘC PHẢI LÀM)
                  </span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                {totalChecks > 0 ? `${completedCount}/${totalChecks} 완료` : '0개'}
              </span>
            </div>

            {/* MASTER CONFIRMATION BUTTON / CHECKBOX */}
            {allRedChecklists.length > 0 && (
              <div className="mt-3.5 p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Printer className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>출력 및 준비 완료 확인</span>
                      <span className="text-[10px] text-rose-700 font-normal">
                        (Xác nhận đã in bài)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Bấm để xác nhận đã hoàn thành toàn bộ
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onMarkAllCompleted}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs ${
                    isAllCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isAllCompleted ? '✓ Đã xong hết' : 'Đã in xong tất cả'}</span>
                </button>
              </div>
            )}

            {/* Checklist Action Items (Primary UI) */}
            <div className="mt-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center justify-between">
                <span>체크리스트 (Checklist hành động):</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  Bấm ô vuông để đánh dấu
                </span>
              </div>

              {allRedChecklists.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  필수 과제 및 준비물이 없습니다 (Không có việc bắt buộc nào).
                </div>
              ) : (
                <div className="space-y-2">
                  {allRedChecklists.map(({ check }) => {
                    const isChecked = completedChecklistIds.includes(check.id);
                    return (
                      <div
                        key={check.id}
                        onClick={() => onToggleCheck(check.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 active:scale-[0.99] ${
                          isChecked
                            ? 'bg-slate-50 border-slate-200 opacity-75'
                            : 'bg-white border-rose-200 hover:border-rose-300 shadow-xs'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 flex-shrink-0 cursor-pointer"
                          aria-label={check.label}
                        >
                          {isChecked ? (
                            <CheckSquare2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-rose-500 hover:text-rose-600" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div
                            className={`text-sm font-bold leading-snug transition-all flex items-center gap-1.5 flex-wrap ${
                              isChecked
                                ? 'text-slate-400 line-through'
                                : 'text-slate-900'
                            }`}
                          >
                            <span>{check.label}</span>
                            {isChecked && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                완료됨 (Đã xong)
                              </span>
                            )}
                          </div>
                          {check.sublabel && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {check.sublabel}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Compact Context & Implicit Meaning (Shortened) */}
            {redItems.length > 0 && (
              <div className="mt-4 pt-3 border-t border-rose-100 space-y-2.5">
                {redItems.map((item) => (
                  <div key={item.id} className="text-xs space-y-1.5">
                    {/* Snippet */}
                    <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 flex items-center justify-between gap-1.5">
                      <span className="truncate font-semibold">🇰🇷 원문: {item.koreanSnippet}</span>
                      {getCategoryIcon(item.category)}
                    </div>
                    {/* Concise Implicit meaning */}
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-950 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <div>
                        <strong className="text-amber-800">💡 교수님 뜻 (Nghĩa ngầm): </strong>
                        <span>{item.implicitMeaningVi}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom helper */}
          <div className="mt-4 pt-2.5 border-t border-rose-100 text-[11px] text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              <span>체크 완료 시 내일 수업 100% 안심 (Tích đủ là mai an tâm!)</span>
            </div>
          </div>
        </div>

        {/* ===================== CỘT XANH: THAM KHẢO ===================== */}
        <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            {/* Header of Green Column */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs flex-shrink-0" />
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-emerald-950 flex items-center gap-1.5">
                    <span>🟢 초록: 참고 및 과제 없음</span>
                  </h3>
                  <span className="text-xs text-emerald-700 font-medium">
                    (XANH: THAM KHẢO & KHÔNG CÓ BÀI TẬP)
                  </span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                {greenItems.length}개
              </span>
            </div>

            {/* List of Green Items (Concise & Shortened) */}
            <div className="mt-4 space-y-2.5">
              {greenItems.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                  별도 참고사항 없음 (Không có mục tham khảo riêng).
                </div>
              ) : (
                greenItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/80 shadow-xs space-y-2"
                  >
                    {/* Korean Snippet */}
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 flex items-center justify-between gap-1.5">
                      <span className="truncate font-semibold">🇰🇷 원문: {item.koreanSnippet}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    </div>

                    {/* Shortened Title & Meaning */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        ✓ {item.titleVi}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {item.detailVi}
                      </p>
                    </div>

                    {/* Short Implicit meaning */}
                    <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-[11px] text-teal-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <div>
                        <strong className="text-teal-800">💡 이해하기 (Hiểu đúng): </strong>
                        <span>{item.implicitMeaningVi}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom helper */}
          <div className="mt-4 pt-2.5 border-t border-emerald-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>초록색 항목은 부담 없이 확인만 하세요 (Mục xanh không bị phạt).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
