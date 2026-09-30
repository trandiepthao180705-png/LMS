import React from 'react';
import { SavedNoticeItem } from '../types.ts';
import { History, Clock, ArrowUpRight, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

interface HistoryNoticesProps {
  history: SavedNoticeItem[];
  onSelectNotice: (item: SavedNoticeItem) => void;
  onDeleteNotice: (id: string, e: React.MouseEvent) => void;
  onClearHistory: () => void;
  activeNoticeId?: string;
}

export const HistoryNotices: React.FC<HistoryNoticesProps> = ({
  history,
  onSelectNotice,
  onDeleteNotice,
  onClearHistory,
  activeNoticeId,
}) => {
  return (
    <div id="section-history" className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center flex-shrink-0">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                최근 확인한 공지 목록
              </h3>
              <span className="text-xs text-slate-500 font-normal">
                (Lịch sử thông báo đã xem)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Bấm vào để xem lại phân loại và checklist mà không cần dán lại tiếng Hàn
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>기록 전체 삭제 (Xóa lịch sử)</span>
          </button>
        )}
      </div>

      <div className="mt-3.5">
        {history.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
            <Clock className="w-6 h-6 mx-auto mb-2 text-slate-400" />
            <p className="font-semibold text-slate-700">아직 저장된 공지가 없습니다 (Chưa có lịch sử)</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Mỗi khi Đức lọc một thông báo mới, thông báo sẽ tự động được lưu tại đây để tiện mở lại bất cứ lúc nào!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {history.map((item) => {
              const isActive = activeNoticeId === item.id;
              const hasRed = item.result.summary.hasMandatoryAction;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectNotice(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative select-none flex flex-col justify-between group ${
                    isActive
                      ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-200 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Row: Timestamp & Status badge */}
                    <div className="flex items-center justify-between gap-2 text-xs mb-2">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.dateStr}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {item.isCompleted ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>출력 완료 (Đã xong)</span>
                          </span>
                        ) : hasRed ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>미완료 (Cần chuẩn bị)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                            참고용 (Tham khảo)
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => onDeleteNotice(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 text-slate-400 transition-opacity rounded cursor-pointer"
                          title="삭제 (Xóa)"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Notice snippet / title */}
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 font-mono leading-relaxed">
                      {item.title}
                    </h4>

                    {/* Main Takeaway */}
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                      👉 {item.result.summary.mainTakeaway}
                    </p>
                  </div>

                  {/* Bottom Row: Counts & Restore button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-rose-600 font-semibold">
                        🔴 {item.result.summary.redCount} 필수 (bắt buộc)
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-emerald-700 font-semibold">
                        🟢 {item.result.summary.greenCount} 참고 (tham khảo)
                      </span>
                    </div>

                    <button
                      type="button"
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>다시 보기 (Xem lại)</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
