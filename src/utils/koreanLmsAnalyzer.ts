import { ClassifiedItem, ClassificationResult } from '../types.ts';

export function analyzeKoreanLMSNotice(text: string): ClassificationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      summary: {
        hasMandatoryAction: false,
        mainTakeaway: 'Dán thông báo LMS hoặc bấm "Nhập mẫu" để bắt đầu lọc.',
        redCount: 0,
        greenCount: 0,
        urgencyLevel: 'RELAXED',
      },
      redItems: [],
      greenItems: [],
      sunbaeTipVi: 'Đức cứ dán nguyên văn thông báo từ LMS vào đây nhé!',
      rawText: '',
    };
  }

  const redItems: ClassifiedItem[] = [];
  const greenItems: ClassifiedItem[] = [];

  // 1. IN ẤN & MANG ĐẾN LỚP (출력, 인쇄, 지참, 프린트, 가져오)
  const printRegex = /(?:반드시\s*)?(?:출력|인쇄|프린트|복사)[^\n.!?]*(?:지참|가져오|참석)|(?:지참하|지참 요망|지참할 것|꼭 지참)/i;
  const generalPrintMatch = /(?:출력|인쇄|지참|프린트|가져오|유인물|수업자료)/i.test(trimmed);

  if (printRegex.test(trimmed) || (generalPrintMatch && /(?:수업자료|강의계획서|유인물|교재|자료집)/.test(trimmed))) {
    const lines = trimmed.split('\n');
    const matchedLine = lines.find(l => /(?:출력|인쇄|지참|프린트)/.test(l)) || '강의계획서 및 수업자료를 반드시 출력하여 수업에 지참하시기 바랍니다.';

    // Check specific documents mentioned
    const hasSyllabus = /강의계획서/.test(trimmed);
    const hasMaterials = /수업자료|유인물|자료집|pdf/i.test(trimmed);

    const checklist = [];
    if (hasSyllabus || !hasMaterials) {
      checklist.push({
        id: 'chk-print-syllabus',
        label: 'In Đề cương bài giảng (강의계획서)',
        sublabel: 'Tải ở mục 학습자료실 1주차'
      });
    }
    if (hasMaterials || !hasSyllabus) {
      checklist.push({
        id: 'chk-print-materials',
        label: 'In Tài liệu học tập (수업자료 PDF)',
        sublabel: 'In sẵn bản giấy mang theo'
      });
    }
    checklist.push({
      id: 'chk-print-pack',
      label: 'Bỏ tài liệu đã in vào balo ngay tối nay',
      sublabel: 'Tránh sáng mai vội quên ở KTX'
    });

    redItems.push({
      id: 'red-print-1',
      type: 'RED',
      category: 'PRINT',
      koreanSnippet: matchedLine.trim(),
      titleVi: 'BẮT BUỘC: In tài liệu & Mang đến lớp',
      detailVi: 'Phải in sẵn bản giấy mang đến lớp vào ngày mai.',
      implicitMeaningVi: 'Giáo sư Hàn KHÔNG phát đề/tài liệu ở lớp. Không in là không có tài liệu học!',
      checklistItems: checklist,
      keywordsHighlighted: ['반드시 출력', '지참']
    });
  }

  // 2. NỘP BÀI TẬP / BÁO CÁO (과제 제출, 레포트, 마감, 기한)
  const hasNoHomeworkText = /(?:별도(?:의)?\s*)?과제(?:\s*제출)?(?:은|이)?\s*(?:없습니다|없음|없으니|안 해도)/i.test(trimmed) ||
    /과제\s*제출은\s*없/i.test(trimmed);

  if (hasNoHomeworkText) {
    const lines = trimmed.split('\n');
    const matchedLine = lines.find(l => /과제.*없/i.test(l)) || '이번 주는 별도의 과제 제출은 없습니다.';
    
    greenItems.push({
      id: 'green-no-hw-1',
      type: 'GREEN',
      category: 'NO_HOMEWORK',
      koreanSnippet: matchedLine.trim(),
      titleVi: 'Không có bài tập nộp trên web LMS tuần này',
      detailVi: 'Tuần này không cần làm bài tập hay nộp báo cáo lên hệ thống.',
      implicitMeaningVi: 'Không có bài tập nộp, nhưng vẫn PHẢI in tài liệu ở ô Đỏ mang đi học!',
      actionItem: 'Không cần thức đêm nộp bài.',
      keywordsHighlighted: ['별도의 과제 제출은 없습니다', '과제 없음']
    });
  }

  // Nếu có nộp bài thực sự
  const hasActualSubmission = /(?:과제|레포트|보고서|과제물)\s*(?:제출|업로드|마감)|기한\s*엄수|자정까지/i.test(trimmed);
  if (hasActualSubmission && !hasNoHomeworkText) {
    const lines = trimmed.split('\n');
    const matchedLine = lines.find(l => /(?:제출|업로드|마감|기한)/.test(l)) || '과제 제출 기한 엄수';

    redItems.push({
      id: 'red-submit-1',
      type: 'RED',
      category: 'SUBMIT',
      koreanSnippet: matchedLine.trim(),
      titleVi: 'BẮT BUỘC: Nộp bài tập / Báo cáo đúng hạn',
      detailVi: 'Có yêu cầu nộp sản phẩm học tập lên cổng LMS.',
      implicitMeaningVi: 'LMS khóa tự động đúng hạn 23:59. Nộp muộn tính 0 điểm.',
      checklistItems: [
        {
          id: 'chk-submit-format',
          label: 'Lưu đúng định dạng file yêu cầu (PDF hoặc HWP)',
          sublabel: 'Đặt tên file: MSSV_HọTên.pdf'
        },
        {
          id: 'chk-submit-upload',
          label: 'Nộp file lên cổng LMS trước hạn chót',
          sublabel: 'Kiểm tra trạng thái nộp thành công'
        }
      ],
      keywordsHighlighted: ['제출', '기한', '마감']
    });
  }

  // 3. QUIZ / KIỂM TRA ĐẦU GIỜ (퀴즈, 쪽지시험, 시험)
  if (/(?:퀴즈|쪽지시험|시험|테스트|단원평가)/i.test(trimmed)) {
    const lines = trimmed.split('\n');
    const matchedLine = lines.find(l => /(?:퀴즈|쪽지시험|시험|테스트)/.test(l)) || '강의 시작 직후 퀴즈 진행';

    redItems.push({
      id: 'red-quiz-1',
      type: 'RED',
      category: 'QUIZ',
      koreanSnippet: matchedLine.trim(),
      titleVi: 'BẮT BUỘC: Có Quiz đầu giờ để điểm danh',
      detailVi: 'Kiểm tra nhanh 5-10 phút đầu buổi học.',
      implicitMeaningVi: 'Điểm danh ngầm qua Quiz. Đến trễ 5 phút bị 0 điểm, không được thi lại!',
      checklistItems: [
        {
          id: 'chk-quiz-review',
          label: 'Xem lướt 3 nội dung trọng tâm tuần trước',
          sublabel: 'Ôn nhanh 10-15 phút tối nay'
        },
        {
          id: 'chk-quiz-alarm',
          label: 'Đặt báo thức đến lớp trước giờ học 10 phút',
          sublabel: 'Ổn định chỗ ngồi sớm'
        }
      ],
      keywordsHighlighted: ['퀴즈', '쪽지시험']
    });
  }

  // 4. CHUẨN BỊ THIẾT BỊ / ĐỒ DÙNG (노트북, 계산기, 준비물, 충전기)
  if (/(?:노트북|계산기|준비물|충전기|실습도구|필기도구)/i.test(trimmed)) {
    const lines = trimmed.split('\n');
    const matchedLine = lines.find(l => /(?:노트북|계산기|준비물|충전기)/.test(l)) || '개인 노트북과 충전기를 반드시 지참';

    redItems.push({
      id: 'red-prep-1',
      type: 'RED',
      category: 'PREPARATION',
      koreanSnippet: matchedLine.trim(),
      titleVi: 'BẮT BUỘC: Mang Laptop & Thiết bị thực hành',
      detailVi: 'Mang thiết bị cá nhân để thực hành trực tiếp tại lớp.',
      implicitMeaningVi: 'Lớp không có máy tính cho mượn. Quên laptop là ngồi không mất điểm.',
      checklistItems: [
        {
          id: 'chk-laptop-charge',
          label: 'Cắm sạc đầy pin laptop tối nay',
          sublabel: 'Kiểm tra mở sẵn phần mềm thực hành'
        },
        {
          id: 'chk-laptop-bag',
          label: 'Bỏ laptop và cục sạc vào balo',
          sublabel: 'Mang theo vào lớp ngày mai'
        }
      ],
      keywordsHighlighted: ['노트북', '충전기', '지참']
    });
  }

  // 5. ĐỌC THAM KHẢO / TỰ HỌC (참고, 권장, 자율, 예습, 읽어오)
  if (/(?:참고|권장|자율|예습|읽어오|읽어보)/i.test(trimmed)) {
    const lines = trimmed.split('\n');
    const matchedLine = lines.find(l => /(?:참고|권장|자율|예습|읽어)/.test(l)) || '교재 내용은 강의 전 자율적으로 참고하여 읽어오시기 바랍니다.';

    greenItems.push({
      id: 'green-reading-1',
      type: 'GREEN',
      category: 'READING',
      koreanSnippet: matchedLine.trim(),
      titleVi: 'Đọc trước tài liệu (Tham khảo / Tự chọn)',
      detailVi: 'Khuyến khích đọc trước nếu có thời gian, không ép buộc.',
      implicitMeaningVi: 'Không kiểm tra gắt. Tối nay mệt chỉ cần lướt mục lục 3 phút.',
      actionItem: 'Đọc lướt nếu rảnh.',
      keywordsHighlighted: ['자율적', '참고', '권장']
    });
  }

  // 6. THÔNG TIN PHÒNG HỌC / TRỢ GIẢNG / LIÊN HỆ
  if (/(?:강의실|조교|이메일|연락처|공지사항|오리엔테이션)/i.test(trimmed)) {
    const lines = trimmed.split('\n');
    const matchedLine = lines.find(l => /(?:강의실|조교|이메일|호)/.test(l)) || '강의실 위치 및 조교 연락처';

    greenItems.push({
      id: 'green-info-1',
      type: 'GREEN',
      category: 'INFO',
      koreanSnippet: matchedLine.trim(),
      titleVi: 'Thông tin phòng học & Kênh liên hệ',
      detailVi: 'Vị trí phòng học hoặc thông tin liên lạc trợ giảng.',
      implicitMeaningVi: 'Ghi nhớ số phòng để mai không chạy nhầm toà nhà.',
      actionItem: 'Lưu số phòng học.',
      keywordsHighlighted: ['강의실', '조교']
    });
  }

  // Nếu không nhận diện được quy tắc đặc thù nào
  if (redItems.length === 0 && greenItems.length === 0) {
    greenItems.push({
      id: 'green-neutral-1',
      type: 'GREEN',
      category: 'INFO',
      koreanSnippet: trimmed.slice(0, 100) + '...',
      titleVi: 'Thông báo thông thường',
      detailVi: 'Không phát hiện yêu cầu nộp bài, in ấn hay kiểm tra.',
      implicitMeaningVi: 'Chỉ cần nắm thông tin và đi học đúng giờ.',
      actionItem: 'Đi học đúng giờ.',
      keywordsHighlighted: []
    });
  }

  // Tính toán tóm tắt dành riêng cho Đức
  const hasMandatory = redItems.length > 0;
  let mainTakeaway = '';
  let urgencyLevel: 'HIGH' | 'MEDIUM' | 'RELAXED' = 'RELAXED';

  if (redItems.some(i => i.category === 'PRINT')) {
    mainTakeaway = 'Tối nay PHẢI IN BÀI GIẢNG mang đi học! Dù không có bài tập nộp trên LMS.';
    urgencyLevel = 'HIGH';
  } else if (redItems.some(i => i.category === 'SUBMIT')) {
    mainTakeaway = 'CÓ BÀI TẬP CẦN NỘP! Chú ý nộp file lên LMS trước hạn chót.';
    urgencyLevel = 'HIGH';
  } else if (hasMandatory) {
    mainTakeaway = `Có ${redItems.length} việc BẮT BUỘC cần làm tối nay. Xem checklist bên dưới!`;
    urgencyLevel = 'MEDIUM';
  } else {
    mainTakeaway = 'Không có việc bắt buộc khẩn cấp. Bạn có thể yên tâm nghỉ ngơi!';
    urgencyLevel = 'RELAXED';
  }

  let sunbaeTip = '';
  if (redItems.some(i => i.category === 'PRINT')) {
    sunbaeTip = 'Lưu ý: Nên in bài ngay tối nay để sáng mai không bị vội hoặc kẹt máy in ở KTX.';
  } else if (redItems.some(i => i.category === 'QUIZ')) {
    sunbaeTip = 'Lưu ý: Có bài kiểm tra đầu giờ, nên đặt báo thức sớm hơn 15 phút để vào lớp đúng giờ.';
  } else if (hasMandatory) {
    sunbaeTip = 'Lưu ý: Hoàn thành các mục trong checklist để sáng mai vào lớp tự tin.';
  } else {
    sunbaeTip = 'Thông báo tuần này nhẹ nhàng, không có bài tập bắt buộc cần nộp.';
  }

  return {
    summary: {
      hasMandatoryAction: hasMandatory,
      mainTakeaway,
      redCount: redItems.length,
      greenCount: greenItems.length,
      urgencyLevel,
    },
    redItems,
    greenItems,
    sunbaeTipVi: sunbaeTip,
    rawText: trimmed,
  };
}
