#!/usr/bin/env python3
"""한컴오피스 2024 COM 자동화 PDF 저장 문제 보고서 생성"""
from fpdf import FPDF

FONT_PATH = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"

class Report(FPDF):
    def header(self):
        self.set_font("cjk", "", 9)
        self.set_text_color(120, 120, 120)
        self.cell(0, 6, "solar-curie HWP COM 자동화 트러블슈팅 보고서", align="R", new_x="LMARGIN", new_y="NEXT")
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("cjk", "", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def section(self, title, level=1):
        if level == 1:
            self.set_font("cjk", "B", 14)
            self.set_text_color(40, 40, 120)
        else:
            self.set_font("cjk", "B", 11)
            self.set_text_color(60, 60, 60)
        self.ln(4)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def body(self, text):
        self.set_font("cjk", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def code(self, text):
        self.set_font("cjk", "", 9)
        self.set_fill_color(240, 240, 240)
        self.set_text_color(30, 30, 30)
        x = self.get_x()
        self.set_x(x + 4)
        self.multi_cell(0, 5.5, text, fill=True)
        self.ln(2)

    def label(self, label_text, value_text):
        self.set_font("cjk", "B", 10)
        self.set_text_color(60, 60, 60)
        self.cell(40, 6, label_text)
        self.set_font("cjk", "", 10)
        self.set_text_color(30, 30, 30)
        self.cell(0, 6, value_text, new_x="LMARGIN", new_y="NEXT")

    def bullet(self, text):
        self.set_font("cjk", "", 10)
        self.set_text_color(30, 30, 30)
        self.cell(0, 6, f"  - {text}", new_x="LMARGIN", new_y="NEXT")


def build():
    pdf = Report()
    pdf.add_font("cjk", "", FONT_PATH)
    pdf.add_font("cjk", "B", FONT_PATH)
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # Title
    pdf.set_font("cjk", "B", 18)
    pdf.set_text_color(20, 20, 80)
    pdf.cell(0, 12, "한컴오피스 2024 COM 자동화", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 12, "PDF 저장 실패 트러블슈팅 보고서", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    pdf.set_font("cjk", "", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 6, "2026-02-14 | solar-curie 프로젝트 | ChatGPT 검토 요청용", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)

    # ========== 1. 프로젝트 개요 ==========
    pdf.section("1. 프로젝트 개요")
    pdf.body(
        "solar-curie는 교사 임용 지원서를 자동으로 작성하는 웹앱입니다.\n"
        "Next.js 14(프론트엔드) + Python COM 자동화(백엔드)로 구성되어 있습니다.\n"
        "사용자가 웹에서 정보를 입력하면, HWP 템플릿에 자동 치환 후 PDF로 변환합니다."
    )

    pdf.section("시스템 구성", 2)
    pdf.label("프론트엔드:", "Next.js 14 + React 18 (Vercel 배포)")
    pdf.label("백엔드:", "Python 3 + pywin32 (Windows PC에서 실행)")
    pdf.label("HWP 자동화:", "win32com.client.Dispatch('HWPFrame.HwpObject')")
    pdf.label("한컴오피스:", "한컴오피스 2024 (C:\\Program Files (x86)\\HNC\\Office 2024)")
    pdf.label("OS:", "Windows 10 (19045.6466)")
    pdf.label("Python:", "pip install pywin32 완료")
    pdf.ln(4)

    # ========== 2. 현재 상태 ==========
    pdf.section("2. 현재 상태 요약")
    pdf.body("HWP 문서 열기, 텍스트 치환, FileSave 저장까지 모두 성공합니다.\nPDF 변환(FileSaveAs) 단계에서만 실패합니다.")

    pdf.section("성공하는 단계", 2)
    pdf.bullet("COM 객체 생성: win32com.client.Dispatch('HWPFrame.HwpObject') -> 성공")
    pdf.bullet("보안 모듈 등록: hwp.RegisterModule('FilePathCheckDLL', 'SecurityModule') -> 성공")
    pdf.bullet("HWP 문서 열기: hwp.Open(path) -> 성공")
    pdf.bullet("텍스트 치환: HFindReplace AllReplace -> 15개 필드 모두 성공")
    pdf.bullet("HWP 저장: hwp.SaveAs(filled_path) -> 성공")
    pdf.bullet("HWP 저장: hwp.HAction.Run('FileSave') -> 성공")

    pdf.section("실패하는 단계", 2)
    pdf.bullet("PDF 내보내기: HFileSaveAs 파라미터셋 속성 접근 시 실패")
    pdf.ln(4)

    # ========== 3. 실패 로그 ==========
    pdf.section("3. 실패 로그 (시간순)")

    pdf.section("시도 1: pset.FileName (대문자 F, N)", 2)
    pdf.code(
        "hwp.HParameterSet.HFileSaveAs.FileName = pdf_path\n"
        "-> AttributeError: '<...HFileSaveAs instance...>'\n"
        "   object has no attribute 'FileName'"
    )

    pdf.section("시도 2: pset.Filename (소문자 n)", 2)
    pdf.code(
        "pset = hwp.HParameterSet.HFileSaveAs\n"
        "pset.Filename = pdf_path\n"
        "-> AttributeError: '<...HFileSaveAs instance...>'\n"
        "   object has no attribute 'Filename'"
    )

    pdf.section("시도 3: pset.SaveFileName", 2)
    pdf.body("dir(pset) 결과에서 ['OpenFileName', 'SaveFileName'] 확인됨.\n그러나 gen_py 캐시 모드에서는 여전히 속성 접근 차단.")
    pdf.code(
        "pset.SaveFileName = pdf_path\n"
        "-> AttributeError: object has no attribute 'SaveFileName'"
    )

    pdf.section("시도 4: SetItem 방식", 2)
    pdf.body("SetItem으로 키-값 설정 시도. 아직 테스트 결과 미확인.")
    pdf.code(
        "for key in ('SaveFileName', 'FileName', 'Filename', 'Path'):\n"
        "    pset.SetItem(key, pdf_path)  # 시도")

    pdf.section("시도 5: FileSave + 사전복사 우회", 2)
    pdf.body("FileSaveAs를 완전히 제거하고, 사전복사 + FileSave 패턴으로 변경.\nHWP 저장은 성공. PDF 변환은 hwp.SaveAs(path, 'PDF')로 시도 중.")
    pdf.code(
        "shutil.copyfile(input_path, filled_path)\n"
        "hwp.Open(filled_path)\n"
        "# ... 치환 ...\n"
        "hwp.HAction.Run('FileSave')  # HWP 저장 성공\n"
        "hwp.SaveAs(pdf_path, 'PDF')  # PDF 변환 시도"
    )
    pdf.ln(4)

    # ========== 4. dir() 결과 ==========
    pdf.section("4. COM 객체 진단 결과")

    pdf.section("HFileSaveAs dir() (file/name 필터)", 2)
    pdf.code(
        "pset = hwp.HParameterSet.HFileSaveAs\n"
        "print([x for x in dir(pset) if 'file' in x.lower() or 'name' in x.lower()])\n"
        "결과: ['OpenFileName', 'SaveFileName']"
    )
    pdf.body(
        "dir()에서 SaveFileName이 보이지만, gen_py 캐시(EnsureDispatch가 생성)가\n"
        "남아있으면 Dispatch로 바꿔도 캐시를 타서 속성 접근이 차단됩니다."
    )

    pdf.section("아직 미확인 사항", 2)
    pdf.bullet("hasattr(pset, 'SetItem') 결과 미확인")
    pdf.bullet("gen_py 캐시 삭제 후 Dispatch 재시도 미확인")
    pdf.bullet("hwp.SaveAs(pdf_path, 'PDF') 메서드 호출 결과 미확인")
    pdf.ln(4)

    # ========== 5. gen_py 캐시 문제 ==========
    pdf.section("5. gen_py 캐시 문제 (핵심 원인 추정)")
    pdf.body(
        "최초에 gencache.EnsureDispatch('HWPFrame.HwpObject')를 사용했습니다.\n"
        "이 호출이 TypeLib 기반 gen_py 캐시를 생성합니다.\n\n"
        "이후 Dispatch()로 변경했지만, gen_py 캐시가 디스크에 남아있으면\n"
        "Dispatch()도 캐시를 자동 로드하여 엄격한 속성 체크를 적용합니다.\n\n"
        "즉, Dispatch()로 바꾸는 것만으로는 불충분하고,\n"
        "gen_py 캐시 폴더를 물리적으로 삭제해야 합니다."
    )
    pdf.section("gen_py 캐시 위치", 2)
    pdf.code(
        "import win32com\n"
        "print(win32com.__gen_path__)\n"
        "# 보통: C:\\Users\\admin\\AppData\\Local\\Temp\\gen_py\\3.x\\..."
    )
    pdf.section("삭제 방법", 2)
    pdf.code(
        "import shutil, win32com\n"
        "shutil.rmtree(win32com.__gen_path__, ignore_errors=True)"
    )
    pdf.ln(4)

    # ========== 6. 질문 ==========
    pdf.section("6. ChatGPT에게 검토 요청 사항")

    pdf.body("아래 질문에 대해 한컴오피스 2024 COM 자동화 기준으로 답변 부탁합니다.")
    pdf.ln(2)

    pdf.section("질문 1: PDF 내보내기 정석 방법", 2)
    pdf.body(
        "한컴오피스 2024에서 Python COM으로 HWP -> PDF 변환하는\n"
        "가장 안정적인 방법은 무엇입니까?\n\n"
        "아래 중 어떤 방식이 맞습니까?\n"
        "  A) hwp.SaveAs(pdf_path, 'PDF')\n"
        "  B) HAction.Execute('FileSaveAs', HFileSaveAs) + 파라미터셋\n"
        "  C) hwp.HAction.Run('FileSaveAsPdf') 같은 별도 액션\n"
        "  D) 기타 (구체적으로)"
    )

    pdf.section("질문 2: HFileSaveAs 파라미터셋 사용법", 2)
    pdf.body(
        "만약 B 방식이 맞다면:\n"
        "  - 파일 경로를 설정하는 정확한 속성명은? (SaveFileName? FileName? SetItem?)\n"
        "  - Format 값은 문자열 'PDF'? 정수 상수?\n"
        "  - gen_py 캐시가 있을 때와 없을 때 차이는?"
    )

    pdf.section("질문 3: gen_py 캐시 영향", 2)
    pdf.body(
        "gencache.EnsureDispatch로 한번 실행한 후\n"
        "Dispatch로 변경했는데도 gen_py 캐시 영향으로\n"
        "속성 접근이 차단되는 경우:\n"
        "  - 캐시 삭제만으로 해결 가능한가?\n"
        "  - win32com.client.dynamic.Dispatch 사용이 더 안전한가?"
    )

    pdf.section("질문 4: hwp.SaveAs 메서드", 2)
    pdf.body(
        "hwp.SaveAs(filled_path)는 HWP 저장에 성공했습니다.\n"
        "hwp.SaveAs(pdf_path, 'PDF')로 PDF 변환이 가능합니까?\n"
        "SaveAs 메서드의 정확한 시그니처와 format 파라미터 값은?"
    )

    pdf.section("질문 5: 대안", 2)
    pdf.body(
        "위 방법이 모두 안 되는 경우,\n"
        "한컴오피스 2024에서 COM으로 PDF를 뽑는 다른 방법이 있습니까?\n"
        "(예: 프린터 드라이버, CLI, 다른 COM 메서드 등)"
    )
    pdf.ln(4)

    # ========== 7. 현재 코드 ==========
    pdf.section("7. 현재 Python 스크립트 (PDF 관련 부분)")
    pdf.code(
        "# 4단계: FileSave로 저장 (성공)\n"
        "hwp.HAction.Run('FileSave')\n"
        "\n"
        "# 5단계: PDF 변환 시도\n"
        "pdf_path = os.path.join(output_dir, 'result.pdf')\n"
        "pdf_ok = False\n"
        "\n"
        "# 방법1: hwp.SaveAs(path, format)\n"
        "try:\n"
        "    hwp.SaveAs(pdf_path, 'PDF')\n"
        "    pdf_ok = True\n"
        "except Exception as e1:\n"
        "    log_write(log_path, f'PDF SaveAs 실패: {e1}')\n"  # noqa
        "\n"
        "# 방법2: hwp.SaveAs(path) - 확장자 자동 판별\n"
        "if not pdf_ok:\n"
        "    try:\n"
        "        hwp.SaveAs(pdf_path)\n"
        "        pdf_ok = os.path.exists(pdf_path)\n"
        "    except Exception as e2:\n"
        "        log_write(log_path, f'PDF 확장자 방식 실패: {e2}')\n"  # noqa
        "\n"
        "if not pdf_ok:\n"
        "    log_write(log_path, 'PDF 변환 실패 - HWP는 정상 저장됨')"
    )
    pdf.ln(4)

    # ========== 8. 환경 정보 ==========
    pdf.section("8. 환경 정보 정리")
    pdf.label("한컴오피스:", "2024 (HOffice130)")
    pdf.label("설치 경로:", "C:\\Program Files (x86)\\HNC\\Office 2024\\HOffice130\\Bin\\Hwp.exe")
    pdf.label("COM ProgID:", "HWPFrame.HwpObject")
    pdf.label("COM 등록:", "Hwp.exe -regserver 실행 완료 (성공 확인)")
    pdf.label("Python:", "3.x + pywin32 (pip install pywin32)")
    pdf.label("Python 테스트:", "Dispatch('HWPFrame.HwpObject') -> 성공 출력 확인")
    pdf.label("OS:", "Windows 10 (10.0.19045.6466)")
    pdf.label("설치 아키텍처:", "32비트 (Program Files (x86))")

    out = "/home/user/solar-curie/hwp_com_troubleshoot_report.pdf"
    pdf.output(out)
    print(f"PDF saved: {out}")


if __name__ == "__main__":
    build()
