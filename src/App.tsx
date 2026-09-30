/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { WorkflowSteps } from './components/WorkflowSteps.tsx';
import { NoticeInput } from './components/NoticeInput.tsx';
import { ClassificationDisplay } from './components/ClassificationDisplay.tsx';
import { HistoryNotices } from './components/HistoryNotices.tsx';
import { KoreanLmsCheatSheet } from './components/KoreanLmsCheatSheet.tsx';
import { SAMPLE_NOTICES } from './utils/sampleData.ts';
import { analyzeKoreanLMSNotice } from './utils/koreanLmsAnalyzer.ts';
import { ClassificationResult, SavedNoticeItem } from './types.ts';

const STORAGE_KEY = 'co_loc_lms_notice_history';

export default function App() {
  const initialNotice = SAMPLE_NOTICES[0].koreanText;
  const [inputText, setInputText] = useState<string>(initialNotice);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult>(() =>
    analyzeKoreanLMSNotice(initialNotice)
  );

  // Completed checklist IDs for the currently active notice
  const [completedChecklistIds, setCompletedChecklistIds] = useState<string[]>([]);

  // History of checked notices
  const [history, setHistory] = useState<SavedNoticeItem[]>([]);
  const [activeNoticeId, setActiveNoticeId] = useState<string>('init-duc-sample');

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedNoticeItem[];
        setHistory(parsed);
      } else {
        const initialSaved: SavedNoticeItem = {
          id: 'init-duc-sample',
          timestamp: Date.now(),
          dateStr: '오늘 19:00 KST (Tối nay)',
          title: '[다음 주 강의 안내] 1주차 학습자료실 강의계획서 및 수업자료 출력 지참',
          rawText: initialNotice,
          result: classificationResult,
          isCompleted: false,
          completedChecklistIds: [],
        };
        setHistory([initialSaved]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([initialSaved]));
      }
    } catch {
      // LocalStorage fallback
    }
  }, []);

  // Save history helper
  const persistHistory = (newHistory: SavedNoticeItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch {
      // ignore storage quota issues
    }
  };

  // Determine current active step (1, 2, or 3)
  const allRedChecklists: string[] = [];
  classificationResult?.redItems.forEach((item) => {
    if (item.checklistItems && item.checklistItems.length > 0) {
      item.checklistItems.forEach((c) => allRedChecklists.push(c.id));
    } else {
      allRedChecklists.push(`chk-fallback-${item.id}`);
    }
  });

  const isAllCompleted =
    allRedChecklists.length > 0 &&
    allRedChecklists.every((id) => completedChecklistIds.includes(id));

  let currentStep: 1 | 2 | 3 = 1;
  if (classificationResult) {
    if (completedChecklistIds.length > 0 || isAllCompleted) {
      currentStep = 3;
    } else {
      currentStep = 2;
    }
  }

  // Classification Handler
  const handleClassify = async (overrideText?: string) => {
    const textToAnalyze = overrideText !== undefined ? overrideText : inputText;
    if (!textToAnalyze.trim()) return;

    setIsLoading(true);

    // 1. Instant local heuristic analysis
    const localResult = analyzeKoreanLMSNotice(textToAnalyze);
    setClassificationResult(localResult);
    setCompletedChecklistIds([]); // Reset checks for new notice

    const newId = 'notice-' + Date.now();
    setActiveNoticeId(newId);

    const now = new Date();
    const dateStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} KST`;

    const firstLine = textToAnalyze.trim().split('\n')[0] || '공지사항 안내';
    const cleanTitle = firstLine.slice(0, 60);

    const newSavedItem: SavedNoticeItem = {
      id: newId,
      timestamp: Date.now(),
      dateStr,
      title: cleanTitle,
      rawText: textToAnalyze,
      result: localResult,
      isCompleted: false,
      completedChecklistIds: [],
    };

    const updatedHistory = [newSavedItem, ...history.filter((h) => h.rawText !== textToAnalyze)].slice(
      0,
      10
    );
    persistHistory(updatedHistory);

    // 2. Try background AI enhancement
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeText: textToAnalyze }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.data) {
          const aiData = data.data;
          const enhancedResult: ClassificationResult = {
            summary: {
              hasMandatoryAction: aiData.summary.hasMandatoryAction,
              mainTakeaway: aiData.summary.mainTakeaway,
              redCount: aiData.redItems.length,
              greenCount: aiData.greenItems.length,
              urgencyLevel: aiData.summary.hasMandatoryAction ? 'HIGH' : 'RELAXED',
            },
            redItems: aiData.redItems,
            greenItems: aiData.greenItems,
            sunbaeTipVi: aiData.sunbaeTipVi || localResult.sunbaeTipVi,
            rawText: textToAnalyze,
          };
          setClassificationResult(enhancedResult);

          const withAi = updatedHistory.map((h) =>
            h.id === newId ? { ...h, result: enhancedResult } : h
          );
          persistHistory(withAi);
        }
      }
    } catch {
      // Keep local result
    } finally {
      setIsLoading(false);
    }
  };

  // Checkbox toggle
  const handleToggleCheck = (id: string) => {
    const nextChecked = completedChecklistIds.includes(id)
      ? completedChecklistIds.filter((item) => item !== id)
      : [...completedChecklistIds, id];

    setCompletedChecklistIds(nextChecked);

    if (activeNoticeId) {
      const isNowComplete =
        allRedChecklists.length > 0 &&
        allRedChecklists.every((cId) => nextChecked.includes(cId));

      const updated = history.map((item) => {
        if (item.id === activeNoticeId) {
          return {
            ...item,
            completedChecklistIds: nextChecked,
            isCompleted: isNowComplete,
          };
        }
        return item;
      });
      persistHistory(updated);
    }
  };

  // Mark all completed
  const handleMarkAllCompleted = () => {
    const isCurrentlyAll =
      allRedChecklists.length > 0 &&
      allRedChecklists.every((id) => completedChecklistIds.includes(id));

    const nextChecked = isCurrentlyAll ? [] : allRedChecklists;
    setCompletedChecklistIds(nextChecked);

    if (activeNoticeId) {
      const updated = history.map((item) => {
        if (item.id === activeNoticeId) {
          return {
            ...item,
            completedChecklistIds: nextChecked,
            isCompleted: !isCurrentlyAll,
          };
        }
        return item;
      });
      persistHistory(updated);
    }
  };

  // Restore notice from history
  const handleSelectHistoryNotice = (saved: SavedNoticeItem) => {
    setActiveNoticeId(saved.id);
    setInputText(saved.rawText);
    setClassificationResult(saved.result);
    setCompletedChecklistIds(saved.completedChecklistIds || []);

    const el = document.getElementById('step-2-results');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Delete single history item
  const handleDeleteHistoryNotice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((h) => h.id !== id);
    persistHistory(updated);
    if (activeNoticeId === id) {
      setActiveNoticeId('');
    }
  };

  // Clear all history
  const handleClearHistory = () => {
    if (confirm('최근 확인한 공지 기록을 모두 삭제하시겠습니까? (Xóa toàn bộ lịch sử?)')) {
      persistHistory([]);
      setActiveNoticeId('');
    }
  };

  // Step click navigation
  const handleStepClick = (step: 1 | 2 | 3) => {
    if (step === 1) {
      const el = document.getElementById('step-1-input');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById('step-2-results');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 flex flex-col font-sans selection:bg-rose-500/20 selection:text-rose-900">
      {/* Top Header */}
      <Header />

      {/* Main Single-Screen Body Container for Desktop */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* User Context Banner (Đức KTX tối thứ 5 - Song ngữ) */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 font-bold">🎯 Đức의 LMS 필터:</span>
            <span className="text-slate-600">
              <strong className="text-rose-600 font-semibold">🔴 빨강 필수 (Bắt buộc)</strong> &{' '}
              <strong className="text-emerald-700 font-semibold">🟢 초록 참고 (Tham khảo)</strong> 분류기
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>무로그인 (Không cần đăng nhập) · 한국어/베트남어 병기</span>
          </div>
        </div>

        {/* 1. Workflow Stepper */}
        <WorkflowSteps
          currentStep={currentStep}
          onStepClick={handleStepClick}
          isAllCompleted={isAllCompleted}
        />

        {/* 2. Notice Input (Step 1) */}
        <NoticeInput
          inputText={inputText}
          setInputText={setInputText}
          onClassify={handleClassify}
          isLoading={isLoading}
        />

        {/* 3. Classification & Checklist Output (Step 2 & Step 3) */}
        {classificationResult && (
          <div id="step-2-results">
            <ClassificationDisplay
              result={classificationResult}
              completedChecklistIds={completedChecklistIds}
              onToggleCheck={handleToggleCheck}
              onMarkAllCompleted={handleMarkAllCompleted}
            />
          </div>
        )}

        {/* 4. History / Saved Notices (Step 4) */}
        <HistoryNotices
          history={history}
          onSelectNotice={handleSelectHistoryNotice}
          onDeleteNotice={handleDeleteHistoryNotice}
          onClearHistory={handleClearHistory}
          activeNoticeId={activeNoticeId}
        />

        {/* 5. Korean LMS Freshmen Cheat Sheet */}
        <KoreanLmsCheatSheet />
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Cò Lọc LMS</span>
            <span>— 한국 대학교 LMS 공지 분류기 (Bộ lọc thông báo đại học Hàn Quốc)</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            한국 유학 생활 · 목요일 밤 기숙사 · 내일 수업 완벽 대비
          </div>
        </div>
      </footer>
    </div>
  );
}
