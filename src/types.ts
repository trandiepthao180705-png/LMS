export type ItemType = 'RED' | 'GREEN';

export type ActionCategory = 
  | 'PRINT'        // In ấn mang đi
  | 'SUBMIT'       // Nộp bài tập / báo cáo
  | 'QUIZ'         // Kiểm tra / Quiz đầu giờ
  | 'PREPARATION'  // Dụng cụ / Laptop
  | 'NO_HOMEWORK'  // Không có bài tập
  | 'READING'      // Đọc tham khảo
  | 'INFO';        // Thông tin chung

export interface ChecklistItem {
  id: string;
  label: string;
  sublabel?: string;
  isDone?: boolean;
}

export interface ClassifiedItem {
  id: string;
  type: ItemType; // 'RED' | 'GREEN'
  category: ActionCategory;
  koreanSnippet: string;
  titleVi: string;
  detailVi: string;
  implicitMeaningVi: string; // Nghĩa ngầm ngắn gọn
  actionItem?: string;
  checklistItems?: ChecklistItem[]; // Danh sách việc hành động cụ thể cho Đức
  isDone?: boolean;
  keywordsHighlighted?: string[];
}

export interface ClassificationResult {
  summary: {
    hasMandatoryAction: boolean;
    mainTakeaway: string;
    redCount: number;
    greenCount: number;
    urgencyLevel: 'HIGH' | 'MEDIUM' | 'RELAXED';
  };
  redItems: ClassifiedItem[];
  greenItems: ClassifiedItem[];
  sunbaeTipVi: string;
  rawText: string;
}

export interface SampleNotice {
  id: string;
  tag: string;
  title: string;
  scenario: string;
  koreanText: string;
  quickNote: string;
}

export interface SavedNoticeItem {
  id: string;
  timestamp: number;
  dateStr: string;
  title: string;
  rawText: string;
  result: ClassificationResult;
  isCompleted: boolean;
  completedChecklistIds: string[];
}
