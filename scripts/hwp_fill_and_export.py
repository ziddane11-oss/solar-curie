import json
import os
import shutil
import sys
import time
from datetime import datetime

try:
    import win32com.client  # type: ignore
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


def clear_gen_py_cache():
    """gen_py 캐시 삭제 - EnsureDispatch가 만든 엄격 모드 캐시 제거"""
    try:
        gen_path = getattr(win32com, '__gen_path__', None)
        if gen_path and os.path.isdir(gen_path):
            shutil.rmtree(gen_path, ignore_errors=True)
    except Exception:
        pass


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

    # gen_py 캐시 삭제 (이전 EnsureDispatch 호출이 만든 엄격 모드 캐시)
    clear_gen_py_cache()

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

        # PDF 저장 - SetItem 방식으로 파라미터 설정
        pdf_path = os.path.join(output_dir, 'result.pdf')
        hwp.HAction.GetDefault('FileSaveAs', hwp.HParameterSet.HFileSaveAs.HSet)
        pset = hwp.HParameterSet.HFileSaveAs

        # SetItem으로 파일 경로 설정 (속성 접근은 TypeLib에 따라 실패할 수 있음)
        path_set = False
        for key in ('SaveFileName', 'FileName', 'Filename', 'Path'):
            try:
                pset.SetItem(key, pdf_path)
                log_write(log_path, f'PDF 경로 설정 성공 (SetItem {key})')
                path_set = True
                break
            except Exception:
                continue

        if not path_set:
            # SetItem 실패 시 속성 직접 접근 시도
            for attr in ('SaveFileName', 'FileName', 'Filename'):
                try:
                    setattr(pset, attr, pdf_path)
                    log_write(log_path, f'PDF 경로 설정 성공 (속성 {attr})')
                    path_set = True
                    break
                except Exception:
                    continue

        if not path_set:
            log_write(log_path, f'PDF 경로 설정 실패. pset dir: {[x for x in dir(pset)]}')
            log_write(log_path, f'SetItem 존재 여부: {hasattr(pset, "SetItem")}')
            raise RuntimeError('HFileSaveAs에 파일명 설정 불가')

        # Format도 SetItem으로 시도
        try:
            pset.SetItem('Format', 'PDF')
        except Exception:
            try:
                pset.Format = 'PDF'
            except Exception:
                log_write(log_path, 'Format 설정 실패 - 기본값으로 진행')

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
