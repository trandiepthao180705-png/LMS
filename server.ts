import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// Helper to initialize Gemini SDK if API key exists
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

interface AnalysisChecklist {
  id: string;
  label: string;
  sublabel?: string;
}

interface AnalysisItem {
  id: string;
  type: 'RED' | 'GREEN';
  category: 'PRINT' | 'SUBMIT' | 'QUIZ' | 'ATTENDANCE' | 'PREPARATION' | 'READING' | 'INFO' | 'NO_HOMEWORK';
  koreanSnippet: string;
  titleVi: string;
  detailVi: string;
  implicitMeaningVi: string; // Nghĩa ngầm ngắn gọn
  checklistItems?: AnalysisChecklist[];
  actionItem?: string;
}

interface ClassifyResponse {
  summary: {
    hasMandatoryAction: boolean;
    mainTakeaway: string;
    redCount: number;
    greenCount: number;
  };
  redItems: AnalysisItem[];
  greenItems: AnalysisItem[];
  sunbaeTipVi: string;
}

app.post('/api/classify', async (req, res) => {
  const { noticeText } = req.body;
  if (!noticeText || typeof noticeText !== 'string' || !noticeText.trim()) {
    return res.status(400).json({ error: 'Nội dung thông báo không được để trống.' });
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `
Bạn là "Cò Lọc LMS" - công cụ trợ lý đặc biệt cho bạn sinh viên Việt Nam năm nhất tên Đức đang học tại đại học Hàn Quốc.
Bối cảnh: Đức đang ngồi ký túc xá tối thứ 5, đọc thông báo LMS tiếng Hàn để chuẩn bị cho buổi học ngày mai.
Vấn đề lớn của sinh viên năm nhất: Các bạn thường chỉ lướt thấy "과제 없음" (không bài tập) rồi tưởng không cần làm gì, nhưng thông báo lại có "출력하여 지참" (bắt buộc in mang theo) hoặc nộp file, mang laptop... Dẫn đến việc lên lớp không có bài, xấu hổ và phải phiền tiền bối Linh.

Nhiệm vụ của bạn:
Phân loại thông báo LMS tiếng Hàn thành 2 nhóm rõ ràng:
1. ĐỎ (RED) - BẮT BUỘC: Những việc PHẢI LÀM (in tài liệu, nộp bài, chuẩn bị đồ dùng, quiz...).
2. XANH (GREEN) - THAM KHẢO: Những việc KHÔNG bắt buộc (không có bài tập, đọc thêm, thông tin...).

QUY TẮC BẮT BUỘC:
- Giải thích cực kỳ NGẮN GỌN (1-2 câu ngắn, không viết văn dài dòng).
- Mục ĐỎ (BẮT BUỘC) PHẢI CÓ danh sách checklist hành động cụ thể để sinh viên tích vào làm ngay (ví dụ: "In Đề cương bài giảng (강의계획서)", "In Tài liệu tuần 1-2 PDF", "Bỏ vào balo tối nay").

Dưới đây là thông báo LMS tiếng Hàn cần phân tích:
"""
${noticeText}
"""

Hãy trả về định dạng JSON thuần túy (không markdown bao quanh) với cấu trúc sau:
{
  "summary": {
    "hasMandatoryAction": true / false,
    "mainTakeaway": "Câu tóm tắt cốt lõi 1 dòng (ví dụ: 'Tối nay PHẢI in kế hoạch bài giảng mang đi học, không có bài tập nộp!')",
    "redCount": 1,
    "greenCount": 1
  },
  "redItems": [
    {
      "id": "red-1",
      "type": "RED",
      "category": "PRINT" | "SUBMIT" | "QUIZ" | "PREPARATION",
      "koreanSnippet": "cụm từ tiếng Hàn gốc (ví dụ: 반드시 출력하여 수업에 지참)",
      "titleVi": "BẮT BUỘC: In tài liệu & Mang đến lớp",
      "detailVi": "Giải thích ngắn gọn 1 câu",
      "implicitMeaningVi": "Nghĩa ngầm giáo sư Hàn cực ngắn (ví dụ: Giáo sư KHÔNG phát đề ở lớp, không in là không có tài liệu học!)",
      "checklistItems": [
        { "id": "chk-1", "label": "In Đề cương bài giảng (강의계획서)", "sublabel": "Tải ở mục 학습자료실" },
        { "id": "chk-2", "label": "In Tài liệu học tập tuần 1-2 PDF (수업자료)", "sublabel": "Bản giấy mang theo" },
        { "id": "chk-3", "label": "Bỏ tài liệu vào balo tối nay", "sublabel": "Tránh sáng mai vội quên" }
      ]
    }
  ],
  "greenItems": [
    {
      "id": "green-1",
      "type": "GREEN",
      "category": "NO_HOMEWORK" | "READING" | "INFO",
      "koreanSnippet": "cụm từ tiếng Hàn gốc (ví dụ: 이번 주는 별도의 과제 제출은 없습니다)",
      "titleVi": "Không có bài tập nộp trên web LMS tuần này",
      "detailVi": "Giải thích ngắn gọn 1 câu (ví dụ: Tuần này không cần nộp bài tập hay báo cáo lên hệ thống).",
      "implicitMeaningVi": "Nghĩa ngầm ngắn gọn (ví dụ: Không phải nộp bài, nhưng vẫn PHẢI in tài liệu ở ô Đỏ mang đi học!)",
      "actionItem": "Không cần làm gì"
    }
  ],
  "sunbaeTipVi": "Lưu ý thực tế ngắn gọn 1 câu"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text) as ClassifyResponse;
        return res.json({ success: true, data: parsed, source: 'ai' });
      }
    } catch (err) {
      console.warn('AI classification failed, falling back to local heuristic engine:', err);
    }
  }

  // Local fallback parser
  const fallback = analyzeKoreanNoticeLocally(noticeText);
  return res.json({ success: true, data: fallback, source: 'heuristic' });
});

// Heuristic Korean LMS Analyzer
function analyzeKoreanNoticeLocally(text: string): ClassifyResponse {
  const lower = text.toLowerCase();
  const redItems: AnalysisItem[] = [];
  const greenItems: AnalysisItem[] = [];

  // Rules for RED (Mandatory)
  // 1. Printing & Bringing to class
  if (/출력|인쇄|지참|프린트|가져오/.test(text)) {
    const snippetMatch = text.match(/[^.!?\n]*?(?:출력|인쇄|지참|프린트|가져오)[^.!?\n]*/);
    const hasSyllabus = /강의계획서/.test(text);
    const hasMaterials = /수업자료|유인물|pdf/i.test(text);

    const checklist = [];
    if (hasSyllabus || !hasMaterials) {
      checklist.push({ id: 'chk-srv-syl', label: 'In Đề cương bài giảng (강의계획서)', sublabel: 'Tải ở mục 학습자료실' });
    }
    if (hasMaterials || !hasSyllabus) {
      checklist.push({ id: 'chk-srv-mat', label: 'In Tài liệu học tập (수업자료 PDF)', sublabel: 'In bản giấy mang theo' });
    }
    checklist.push({ id: 'chk-srv-bag', label: 'Bỏ tài liệu đã in vào balo tối nay', sublabel: 'Tránh sáng mai vội quên' });

    redItems.push({
      id: 'red-print-' + Date.now(),
      type: 'RED',
      category: 'PRINT',
      koreanSnippet: snippetMatch ? snippetMatch[0].trim() : '출력하여 수업에 지참',
      titleVi: 'BẮT BUỘC: In tài liệu & Mang đến lớp',
      detailVi: 'Phải in sẵn bản giấy mang đến lớp vào ngày mai.',
      implicitMeaningVi: 'Giáo sư Hàn KHÔNG phát đề/tài liệu ở lớp. Không in là không có tài liệu học!',
      checklistItems: checklist,
      actionItem: 'In tài liệu ngay tối nay.'
    });
  }

  // 2. Homework / Report submission
  const hasNoAssignment = /과제(?:\s*제출)?(?:은|이)?\s*(?:없습니다|없음|없으니)/.test(text);
  if (!hasNoAssignment && /제출|기한|마감|과제|보고서|레포트/.test(text)) {
    const snippetMatch = text.match(/[^.!?\n]*?(?:제출|기한|마감|과제|보고서|레포트)[^.!?\n]*/);
    redItems.push({
      id: 'red-submit-' + Date.now(),
      type: 'RED',
      category: 'SUBMIT',
      koreanSnippet: snippetMatch ? snippetMatch[0].trim() : '과제 제출 기한 안내',
      titleVi: 'BẮT BUỘC: Nộp bài tập / Báo cáo đúng hạn',
      detailVi: 'Nộp sản phẩm học tập lên cổng LMS.',
      implicitMeaningVi: 'LMS khóa tự động đúng hạn 23:59. Nộp muộn tính 0 điểm.',
      checklistItems: [
        { id: 'chk-srv-sub1', label: 'Lưu đúng định dạng file (PDF/HWP)', sublabel: 'MSSV_HọTên.pdf' },
        { id: 'chk-srv-sub2', label: 'Nộp file lên cổng LMS trước hạn chót', sublabel: 'Xác nhận nộp thành công' }
      ],
      actionItem: 'Nộp bài trước hạn chót.'
    });
  }

  // 3. Quiz / Test
  if (/퀴즈|쪽지시험|시험|테스트/.test(text)) {
    const snippetMatch = text.match(/[^.!?\n]*?(?:퀴즈|쪽지시험|시험|테스트)[^.!?\n]*/);
    redItems.push({
      id: 'red-quiz-' + Date.now(),
      type: 'RED',
      category: 'QUIZ',
      koreanSnippet: snippetMatch ? snippetMatch[0].trim() : '퀴즈 안내',
      titleVi: 'BẮT BUỘC: Có Quiz đầu giờ để điểm danh',
      detailVi: 'Kiểm tra nhanh 5-10 phút đầu buổi học.',
      implicitMeaningVi: 'Điểm danh ngầm qua Quiz. Đến trễ 5 phút bị 0 điểm, không được thi lại!',
      checklistItems: [
        { id: 'chk-srv-quiz1', label: 'Xem lướt 3 nội dung trọng tâm tuần trước', sublabel: 'Ôn 10 phút tối nay' },
        { id: 'chk-srv-quiz2', label: 'Đặt báo thức đến lớp trước 10 phút', sublabel: 'Ổn định chỗ ngồi sớm' }
      ],
      actionItem: 'Đến lớp sớm 10 phút.'
    });
  }

  // 4. Laptop / Required Tools
  if (/노트북|계산기|준비물|실습도구/.test(text)) {
    const snippetMatch = text.match(/[^.!?\n]*?(?:노트북|계산기|준비물|실습도구)[^.!?\n]*/);
    redItems.push({
      id: 'red-prep-' + Date.now(),
      type: 'RED',
      category: 'PREPARATION',
      koreanSnippet: snippetMatch ? snippetMatch[0].trim() : '준비물 지참 안내',
      titleVi: 'BẮT BUỘC: Mang Laptop & Thiết bị thực hành',
      detailVi: 'Mang thiết bị cá nhân để thực hành trực tiếp tại lớp.',
      implicitMeaningVi: 'Lớp không có máy tính cho mượn. Quên laptop là ngồi không mất điểm.',
      checklistItems: [
        { id: 'chk-srv-lap1', label: 'Cắm sạc đầy pin laptop tối nay', sublabel: 'Kiểm tra mở sẵn phần mềm' },
        { id: 'chk-srv-lap2', label: 'Bỏ laptop và cục sạc vào balo', sublabel: 'Mang theo vào lớp' }
      ],
      actionItem: 'Sạc pin và bỏ laptop vào balo.'
    });
  }

  // Rules for GREEN (Reference / No action)
  // 1. No homework this week
  if (hasNoAssignment) {
    const snippetMatch = text.match(/[^.!?\n]*?(?:과제(?:\s*제출)?(?:은|이)?\s*(?:없습니다|없음|없으니))[^.!?\n]*/);
    greenItems.push({
      id: 'green-no-hw-' + Date.now(),
      type: 'GREEN',
      category: 'NO_HOMEWORK',
      koreanSnippet: snippetMatch ? snippetMatch[0].trim() : '이번 주는 별도의 과제 제출은 없습니다.',
      titleVi: 'Không có bài tập nộp trên web LMS tuần này',
      detailVi: 'Tuần này không cần nộp bài tập hay báo cáo lên hệ thống.',
      implicitMeaningVi: 'Không phải nộp bài, nhưng vẫn PHẢI in tài liệu ở ô Đỏ mang đi học!',
      actionItem: 'Không cần làm gì.'
    });
  }

  // 2. Reference reading / Optional
  if (/참고|권장|자율|예습|읽어/.test(text)) {
    const snippetMatch = text.match(/[^.!?\n]*?(?:참고|권장|자율|예습|읽어)[^.!?\n]*/);
    greenItems.push({
      id: 'green-reading-' + Date.now(),
      type: 'GREEN',
      category: 'READING',
      koreanSnippet: snippetMatch ? snippetMatch[0].trim() : '참고자료 확인',
      titleVi: 'Đọc trước tài liệu (Tham khảo / Tự chọn)',
      detailVi: 'Khuyến khích đọc trước nếu có thời gian, không ép buộc.',
      implicitMeaningVi: 'Không kiểm tra gắt. Tối nay mệt chỉ cần lướt mục lục 3 phút.',
      actionItem: 'Đọc lướt nếu rảnh.'
    });
  }

  // 3. General Class Info
  if (/강의실|조교|문의사항|이메일/.test(text)) {
    const snippetMatch = text.match(/[^.!?\n]*?(?:강의실|조교|문의사항|이메일)[^.!?\n]*/);
    greenItems.push({
      id: 'green-info-' + Date.now(),
      type: 'GREEN',
      category: 'INFO',
      koreanSnippet: snippetMatch ? snippetMatch[0].trim() : '강의 안내 정보',
      titleVi: 'Thông tin phòng học & Kênh liên hệ',
      detailVi: 'Vị trí phòng học hoặc thông tin liên lạc trợ giảng.',
      implicitMeaningVi: 'Ghi nhớ số phòng để sáng mai không chạy nhầm toà nhà.',
      actionItem: 'Lưu số phòng học.'
    });
  }

  // Fallback if empty
  if (redItems.length === 0 && greenItems.length === 0) {
    greenItems.push({
      id: 'green-default-' + Date.now(),
      type: 'GREEN',
      category: 'INFO',
      koreanSnippet: text.slice(0, 80) + '...',
      titleVi: 'THÔNG TIN THAM KHẢO: Thông báo lớp học thông thường',
      detailVi: 'Không phát hiện từ khóa bắt buộc gấp (như in ấn, nộp bài, kiểm tra).',
      implicitMeaningVi: 'Nhiều khả năng đây chỉ là thông báo lịch trình học hoặc tin nhắn chào mừng thông thường của giáo sư.',
      actionItem: 'Đọc lướt để nắm thông tin, sáng mai đi học đúng giờ.'
    });
  }

  const hasMandatory = redItems.length > 0;
  let mainTakeaway = '';
  if (redItems.some(i => i.category === 'PRINT')) {
    mainTakeaway = 'Tối nay PHẢI IN TÀI LIỆU mang theo! Dù có thể không có bài tập nộp trên LMS.';
  } else if (hasMandatory) {
    mainTakeaway = 'Có ' + redItems.length + ' việc BẮT BUỘC cần thực hiện trước khi đến lớp ngày mai!';
  } else {
    mainTakeaway = 'Không có việc bắt buộc khẩn cấp. Bạn chỉ cần đọc tham khảo và nghỉ ngơi.';
  }

  return {
    summary: {
      hasMandatoryAction: hasMandatory,
      mainTakeaway,
      redCount: redItems.length,
      greenCount: greenItems.length,
    },
    redItems,
    greenItems,
    sunbaeTipVi: hasMandatory 
      ? 'Lưu ý: Nên in bài ngay tối nay để sáng mai không bị vội hoặc kẹt máy in ở KTX.' 
      : 'Thông báo nhẹ nhàng tuần này, chuẩn bị tinh thần thoải mái mai đi học đúng giờ là được!'
  };
}

// In production or dev server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Cò Lọc LMS server running on port ${port}`);
  });
}

startServer();
