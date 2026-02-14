import json
import os
import shutil
import sys
import time
from datetime import datetime

try:
    import win32com.client  # type: ignore
    import win32com.client.dynamic  # type: ignore
    import win32com  # type: ignore
except ImportError:
    win32com = None


def log_write(log_path, message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    with open(log_path, 'a', encoding='utf-8') as log_file:
        log_file.write(f"[{timestamp}] {message}\n")


def get_value(data, path):
    current = data
    for part in path.replace(']', '').split('.'):
        if '[' in part:
            key, index = part.split('[')
            current = current.get(key, [])
            current = current[int(index)] if len(current) > int(index) else ''
        else:
            if isinstance(current, dict):
                current = current.get(part, '')
            else:
                current = ''
        if current is None:
            return ''
    return current


def compile_career_text(profile, year_data):
    mode = year_data.get('career_text_compiled_mode', 'one_block')
    lines = []
    for entry in profile.get('career', []):
        line = f"{entry.get('period', '')} {entry.get('school', '')} {entry.get('subject', '')} {entry.get('role', '')}".strip()
        if entry.get('notes'):
            line = f"{line} ({entry.get('notes')})"
        lines.append(line)
    if mode == 'bullet':
        return "\n".join([f"- {line}" for line in lines])
    return "\n".join(lines)


def ensure_output_dir(output_dir):
    os.makedirs(output_dir, exist_ok=True)


def main():
    if len(sys.argv) < 6:
        print('Usage: hwp_fill_and_export.py input_path map_path profile_path year_path output_dir')
        sys.exit(1)

    input_path, map_path, profile_path, year_path, output_dir = sys.argv[1:6]
    ensure_output_dir(output_dir)
    log_path = os.path.join(output_dir, 'log.txt')

    if win32com is None:
        log_write(log_path, 'pywin32가 설치되지 않았습니다.')
        sys.exit(1)

    try:
        with open(profile_path, 'r', encoding='utf-8') as profile_file:
            profile = json.load(profile_file)
        with open(year_path, 'r', encoding='utf-8') as year_file:
            year_data = json.load(year_file)
        with open(map_path, 'r', encoding='utf-8') as map_file:
            template_map = json.load(map_file)
    except Exception as error:
        log_write(log_path, f'JSON 로드 실패: {error}')
        sys.exit(1)

    profile['career_text_compiled'] = compile_career_text(profile, year_data)

    # 1단계: input을 filled로 미리 복사 (SaveAs 회피)
    extension = os.path.splitext(input_path)[1].lower()
    filled_path = os.path.join(output_dir, f'filled{extension}')
    shutil.copyfile(input_path, filled_path)
    log_write(log_path, f'템플릿 복사: {input_path} -> {filled_path}')

    # gen_py 캐시 삭제 (이전 EnsureDispatch가 만든 strict binding 제거)
    try:
        gen_path = getattr(win32com, '__gen_path__', None)
        if gen_path and os.path.isdir(gen_path):
            shutil.rmtree(gen_path, ignore_errors=True)
    except Exception:
        pass

    hwp = None
    try:
        hwp = win32com.client.dynamic.Dispatch('HWPFrame.HwpObject')
        hwp.RegisterModule('FilePathCheckDLL', 'SecurityModule')
        log_write(log_path, '한글 객체 생성 완료')

        # 2단계: 복사본 열기
        if not os.path.exists(filled_path):
            log_write(log_path, '복사 파일이 존재하지 않습니다.')
            sys.exit(1)

        hwp.Open(filled_path)
        log_write(log_path, f'문서 열기 성공: {filled_path}')

        # 3단계: 치환
        for rule in template_map.get('rules', []):
            rule_type = rule.get('type')
            value_path = rule.get('value_path', '')
            value = get_value(profile, value_path)

            if rule_type == 'find_replace':
                find_text = rule.get('find', '')
                try:
                    hwp.HAction.GetDefault('AllReplace', hwp.HParameterSet.HFindReplace.HSet)
                    hwp.HParameterSet.HFindReplace.FindString = find_text
                    hwp.HParameterSet.HFindReplace.ReplaceString = str(value)
                    hwp.HParameterSet.HFindReplace.IgnoreMessage = 1
                    hwp.HAction.Execute('AllReplace', hwp.HParameterSet.HFindReplace.HSet)
                    log_write(log_path, f'치환 성공: {find_text} -> {value}')
                except Exception as error:
                    log_write(log_path, f'치환 실패 ({find_text}): {error}')
            elif rule_type == 'bookmark':
                field_name = rule.get('field', '')
                try:
                    hwp.PutFieldText(field_name, str(value))
                    log_write(log_path, f'필드 입력 성공: {field_name} -> {value}')
                except Exception as error:
                    log_write(log_path, f'필드 입력 실패 ({field_name}): {error}')
            else:
                log_write(log_path, f'지원하지 않는 rule 타입: {rule_type}')

        # 4단계: FileSave로 저장 (SaveAs/FileSaveAs 파라미터셋 회피)
        hwp.HAction.Run('FileSave')
        log_write(log_path, f'채워진 파일 저장: {filled_path}')

        # 5단계: PDF 변환 - FileSaveAsPdf 전용 액션 사용
        pdf_path = os.path.join(output_dir, 'result.pdf')
        try:
            hwp.HAction.GetDefault('FileSaveAsPdf', hwp.HParameterSet.HFileSaveAsPdf.HSet)
            pset = hwp.HParameterSet.HFileSaveAsPdf
            pset.FileName = pdf_path
            hwp.HAction.Execute('FileSaveAsPdf', pset.HSet)
            log_write(log_path, f'PDF 저장 완료 (FileSaveAsPdf): {pdf_path}')
        except Exception as e1:
            log_write(log_path, f'FileSaveAsPdf 실패: {e1}')
            # 폴백: hwp.SaveAs 메서드
            try:
                hwp.SaveAs(pdf_path, 'PDF')
                log_write(log_path, f'PDF 저장 완료 (SaveAs 폴백): {pdf_path}')
            except Exception as e2:
                log_write(log_path, f'SaveAs PDF 폴백 실패: {e2}')
                log_write(log_path, 'PDF 변환 실패 - filled HWP 파일은 정상 저장됨')

        time.sleep(0.5)
        hwp.Quit()
    except Exception as error:
        log_write(log_path, f'한글 자동화 실패: {error}')
        if hwp:
            try:
                hwp.Quit()
            except Exception:
                pass
        sys.exit(1)


if __name__ == '__main__':
    main()
