import json
import os
import sys
import time
from datetime import datetime

try:
    import win32com.client  # type: ignore
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

    hwp = None
    try:
        hwp = win32com.client.Dispatch('HWPFrame.HwpObject')
        hwp.RegisterModule('FilePathCheckDLL', 'SecurityModule')
        log_write(log_path, '한글 객체 생성 완료')

        if not os.path.exists(input_path):
            log_write(log_path, '입력 파일이 존재하지 않습니다.')
            sys.exit(1)

        hwp.Open(input_path)
        log_write(log_path, f'문서 열기 성공: {input_path}')

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

        extension = os.path.splitext(input_path)[1].lower()
        filled_path = os.path.join(output_dir, f'filled{extension}')
        hwp.SaveAs(filled_path)
        log_write(log_path, f'채워진 파일 저장: {filled_path}')

        pdf_path = os.path.join(output_dir, 'result.pdf')
        hwp.HAction.GetDefault('FileSaveAs', hwp.HParameterSet.HFileSaveAs.HSet)
        pset = hwp.HParameterSet.HFileSaveAs
        for key in ('SaveFileName', 'FileName', 'Filename', 'Path'):
            try:
                pset.SetItem(key, pdf_path)
                log_write(log_path, f'PDF 경로 설정 성공 (SetItem {key})')
                break
            except Exception:
                continue
        else:
            try:
                pset.SaveFileName = pdf_path
                log_write(log_path, 'PDF 경로 설정 성공 (속성 SaveFileName)')
            except Exception as err:
                log_write(log_path, f'PDF 경로 설정 실패: {err}')
                log_write(log_path, f'HFileSaveAs dir: {[x for x in dir(pset)]}')
                raise
        pset.Format = 'PDF'
        hwp.HAction.Execute('FileSaveAs', pset.HSet)
        log_write(log_path, f'PDF 저장 완료: {pdf_path}')

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
