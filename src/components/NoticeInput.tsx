import React, { useState } from 'react';
import { SAMPLE_NOTICES } from '../utils/sampleData.ts';
import { SampleNotice } from '../types.ts';
import { Clipboard, Trash2, Sparkles, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';

interface NoticeInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onClassify: (text?: string) => void;
  isLoading: boolean;
}

export const NoticeInput: React.FC<NoticeInputProps> = ({
  inputText,
  setInputText,
  onClassify,
  isLoading,
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample-duc-painpoint');
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleLoadSample = (sample: SampleNotice) => {
    setSelectedSampleId(sample.id);
    setInputText(sample.koreanText);
    onClassify(sample.koreanText);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        onClassify(text);
        setCopiedNotice(true);
        setTimeout(() => setCopiedNotice(false), 2000);
      }
    } catch {
      alert('Vui lòng dán trực tiếp bằng phím Ctrl+V hoặc Cmd+V vào ô bên dưới nhé!');
    }
  };

  const handleClear = () => {
    setInputText('');
  };

  return (
    <div id="step-1-input" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
      {/* Top Banner / Sample Picker */}
      <div className="p-3 sm:p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col gap-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              1단계: LMS 공지 붙여넣기 · Dán thông báo LMS
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleLoadSample(SAMPLE_NOTICES[0])}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-100" />
              <span>Đức 예시 공지 (Nhập mẫu: In bài & Không bài tập)</span>
            </button>

            <button
              type="button"
              onClick={handlePasteClipboard}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="Dán từ bộ nhớ tạm"
            >
              <Clipboard className="w-3.5 h-3.5 text-slate-500" />
              <span>{copiedNotice ? '완료 (Đã dán)' : '붙여넣기 (Dán nhanh)'}</span>
            </button>

            {inputText && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs px-2 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                title="지우기 (Xóa)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Other Samples Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 text-xs no-scrollbar">
          <span className="text-slate-500 text-[11px] whitespace-nowrap font-medium flex items-center gap-1 mr-1">
            <BookOpen className="w-3 h-3 text-slate-400" />
            기타 예시 (Mẫu khác):
          </span>
          {SAMPLE_NOTICES.slice(1).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleLoadSample(s)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all border cursor-pointer ${
                selectedSampleId === s.id && inputText === s.koreanText
                  ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {s.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="p-3 sm:p-4">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
            }}
            placeholder="LMS 한국어 공지를 여기에 붙여넣으세요...&#10;Dán nguyên văn thông báo LMS tiếng Hàn vào đây...&#10;예시: [다음 주 강의 안내] 1주차 학습자료실에 있는 강의계획서 및 수업자료를 반드시 출력하여 수업에 지참하시기 바랍니다. 이번 주는 별도의 과제 제출은 없습니다."
            className="w-full h-32 sm:h-36 p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 text-slate-800 placeholder:text-slate-400 text-sm font-sans leading-relaxed resize-none transition-all outline-none"
          />

          {inputText && (
            <div className="absolute right-3 bottom-3 text-[11px] text-slate-400 font-mono">
              {inputText.length}자 (ký tự)
            </div>
          )}
        </div>

        {/* Action Button Row */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              <strong className="text-rose-600 font-semibold">🔴 빨강 (Bắt buộc)</strong>과{' '}
              <strong className="text-emerald-700 font-semibold">🟢 초록 (Tham khảo)</strong>으로 즉시 분류합니다
            </span>
          </div>

          <button
            type="button"
            disabled={!inputText.trim() || isLoading}
            onClick={() => onClassify()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>분류 분석 중... (Đang phân loại)</span>
              </>
            ) : (
              <>
                <span>2단계: 빨강/초록 분류하기 (Phân loại ngay)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
