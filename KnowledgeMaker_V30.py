import os
import sys
import json
import requests
import threading
import textwrap
import shutil
import re
import random
import time
import numpy as np
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import customtkinter as ctk
from tkinter import messagebox, filedialog
from moviepy.editor import *
import moviepy.audio.fx.all as afx
from proglog import ProgressBarLogger # 진행률 연동용

# AI 라이브러리 체크
try:
    from google import genai
    from google.genai import types
except ImportError:
    pass

try:
    from openai import OpenAI
except ImportError:
    pass


# ==========================================
# 1. 설정 및 리소스
# ==========================================
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("dark-blue")

# 🎨 [네온-미니멀 테마] 촌스럽지 않은 고급 네온
BG = "#0B0F14"
CARD = "#121826"
CARD2 = "#0F1724"
TEXT = "#B8C4D6"
MUTED = "#7A869A"
NEON = "#00E5FF"
NEON2 = "#7C5CFF"
BORDER = "#1F2A3A"
SUCCESS = "#2CC985"
DANGER = "#FF3B5C"

# 폰트 (Malgun Gothic 통일)
TITLE_FONT = ("Malgun Gothic", 26, "bold")
H2_FONT = ("Malgun Gothic", 15, "bold")
BODY_FONT = ("Malgun Gothic", 13)
SMALL_FONT = ("Malgun Gothic", 12)
FONT_BOLD = ("Malgun Gothic", 16, "bold")
FONT_NORMAL = ("Malgun Gothic", 14)
FONT_SMALL = ("Malgun Gothic", 12)
R = 20  # corner_radius

FONT_PATH = "C:/Windows/Fonts/malgunbd.ttf"
if not os.path.exists(FONT_PATH):
    FONT_PATH = "C:/Windows/Fonts/malgun.ttf"
if not os.path.exists(FONT_PATH):
    FONT_PATH = "C:/Windows/Fonts/gulim.ttc"

CONFIG_FILE = "config_ultra.json"

VOICE_OPTIONS = {
    "차분한 남성 (Antoni)": "ErXwobaYiN019PkySvjV",
    "밝은 여성 (Rachel)": "21m00Tcm4TlvDq8ikWAM",
    "굵은 남성 (Clyde)": "2EiwWnXFnvU5JabPnv8n",
    "할머니 (Mimi)": "zrHiDhphv9ZnVXBqCLjz"
}

COLOR_OPTIONS = {
    "황금색 (기본)": "#FFD700",
    "깔끔한 흰색": "#FFFFFF",
    "네온 민트": "#00FFC8",
    "강렬한 레드": "#FF0000"
}

LANG_OPTIONS = ["Korean", "English", "Japanese", "Spanish"]

def load_config():
    default = {"openai_key": "", "eleven_key": "", "google_key": ""}
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f: return {**default, **json.load(f)}
        except: pass
    return default

def save_config(openai, eleven, google):
    with open(CONFIG_FILE, "w") as f:
        json.dump({"openai_key": openai, "eleven_key": eleven, "google_key": google}, f)

# ==========================================
# 2. 로직 함수들
# ==========================================
# [수정] 진행률 로거: 숫자가 '바뀔 때만' GUI 업데이트 (렉 방지)
class TkLogger(ProgressBarLogger):
    def __init__(self, callback):
        super().__init__()
        self.callback = callback
        self.last_percentage = -1 # 마지막으로 보고한 퍼센트

    def bars_callback(self, bar, attr, value, old_value=None):
        if bar == 't':
            if self.bars[bar]['total'] > 0:
                percentage = int((value / self.bars[bar]['total']) * 100)
                # 🔥 [핵심] 1%라도 변했을 때만 업데이트 (GUI 부하 99% 감소)
                if percentage != self.last_percentage:
                    self.callback(percentage)
                    self.last_percentage = percentage

def retry_on_429(func, max_retries=3, initial_wait=60):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                if attempt < max_retries - 1:
                    wait_time = initial_wait * (2 ** attempt)
                    print(f"⏳ API 제한 감지. {wait_time}초 대기 후 재시도 ({attempt+1}/{max_retries})...")
                    time.sleep(wait_time)
                    continue
                else:
                    raise Exception(f"API 할당량 초과. 나중에 다시 시도하세요.")
            else:
                raise e
    raise Exception("재시도 실패")

# 🔥 [신규] 이모지/특수문자 제거 함수
def strip_emojis(text):
    if not text:
        return text
    # 이모지/픽토그램/변형 선택자/ZWJ 제거
    emoji_pattern = re.compile(
        "[" 
        "\U0001F1E0-\U0001F1FF"  # flags
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F680-\U0001F6FF"  # transport & map
        "\U0001F700-\U0001F77F"  # alchemical
        "\U0001F780-\U0001F7FF"  # geometric
        "\U0001F800-\U0001F8FF"  # arrows
        "\U0001F900-\U0001F9FF"  # supplemental symbols
        "\U0001FA00-\U0001FAFF"  # extended symbols
        "\u2600-\u27BF"          # misc symbols
        "\uFE0F"                 # variation selector-16
        "\u200D"                 # zero width joiner
        "]+",
        flags=re.UNICODE
    )
    text = emoji_pattern.sub("", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def generate_viral_content(api_key, topic, language):
    print(f"[Gemini] 기획안 + SEO 데이터 생성 중 ({language})...")
    client = genai.Client(api_key=api_key)
    
    system_prompt = f"""
    You are a viral YouTube Shorts expert. 
    Topic: {topic}. Target Language: **{language}**.
    
    1. Create a "Hook Title" (3-5 words, clickbait).
    2. Create a script (Casual tone, 40-50 secs).
    3. Create 6 Image Prompts (English only, cinematic style).
    4. **Create YouTube Metadata (SEO):** 3 Titles, Description, 15 Hashtags.
    
    - DO NOT use emojis, emoticons, or decorative symbols.
    - Use plain text only. No special characters except basic punctuation.
    
    Output Format (Strictly):
    [Hook]... [Script]... [Prompts]... [Metadata]...
    """
    
    def _generate():
        response = client.models.generate_content(model='gemini-2.0-flash', contents=system_prompt)
        text = strip_emojis(response.text)  # 🔥 이모지 제거 후처리
        hook = "Watch This!"; script = ""; prompts = ["Abstract background"]; metadata = "SEO Data Not Generated."

        if "[Hook]" in text:
            parts = text.split("[Hook]")[1].split("[Script]")
            hook = strip_emojis(parts[0].strip())
            if len(parts) > 1:
                script_parts = parts[1].split("[Prompts]")
                script = script_parts[0].strip()
                # 괄호 안의 설명 제거
                script = re.sub(r'\([^)]*\)', '', script)
                script = re.sub(r'\[[^\]]*\]', '', script)
                script = re.sub(r'\s+', ' ', script).strip()
                script = strip_emojis(script)  # 🔥 이모지 제거
                if len(script_parts) > 1:
                    prompt_parts = script_parts[1].split("[Metadata]")
                    prompts = [p.strip() for p in prompt_parts[0].split('\n') if p.strip()]
                    if len(prompt_parts) > 1:
                        metadata = strip_emojis(prompt_parts[1].strip())  # 🔥 이모지 제거
        return hook, script, prompts, metadata
    
    try:
        return retry_on_429(_generate)
    except Exception as e:
        raise Exception(f"AI 생성 실패: {e}")

def generate_voice(api_key, text, out_path, voice_id):
    print(f"🎙️ [ElevenLabs] 음성 생성 중...")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {"xi-api-key": api_key, "Content-Type": "application/json"}
    data = {"text": text, "model_id": "eleven_multilingual_v2"} 
    res = requests.post(url, json=data, headers=headers)
    if res.status_code == 200:
        with open(out_path, "wb") as f: f.write(res.content)
        return True
    return False

def generate_images(api_key, prompts):
    print("🎨 [OpenAI DALL-E] 이미지 생성 중...")
    client = OpenAI(api_key=api_key)
    paths = []
    if os.path.exists("images_ultra"): shutil.rmtree("images_ultra")
    os.makedirs("images_ultra")
    
    MAX_IMAGES = 6  # ✅ 6장으로 증가
    if not prompts: prompts = ["Abstract background"]
    prompts = prompts[:MAX_IMAGES]
    
    for i, p in enumerate(prompts):
        path = f"images_ultra/scene_{i}.png"
        clean_p = re.sub(r'^\d+[\.\)]\s*', '', p)
        try:
            print(f"   └─ 이미지 {i+1} 생성 요청...")
            response = client.images.generate(
                model="dall-e-3", prompt=f"high quality, cinematic, vertical composition, {clean_p}",
                size="1024x1792", quality="standard", n=1
            )
            image_url = response.data[0].url
            img_data = requests.get(image_url).content
            with open(path, 'wb') as f: f.write(img_data)
            paths.append(path)
            print(f"   ✅ 이미지 {i+1} 완료")
        except Exception as e:
            print(f"   ⚠️ 이미지 {i+1} 실패, 기본 이미지 사용: {e}")
            img = Image.new('RGB', (1024, 1792), '#1a1a2e')
            d = ImageDraw.Draw(img)
            d.text((450, 900), f"Scene {i+1}", fill='#888888')
            img.save(path); paths.append(path)
    return paths

def create_hook_clip(text, duration=3.0):
    w, h = 1080, 1920
    img = Image.new('RGB', (w, h), (20, 20, 20))
    draw = ImageDraw.Draw(img)
    try: font = ImageFont.truetype(FONT_PATH, 110)
    except: font = ImageFont.load_default()
    lines = textwrap.wrap(text, width=10); total_h = len(lines) * 130; y = (h - total_h) // 2
    for line in lines:
        bbox = draw.textbbox((0,0), line, font=font); x = (w - (bbox[2]-bbox[0])) // 2
        draw.text((x+5, y+5), line, font=font, fill="black")
        draw.text((x, y), line, font=font, fill="#FF0055")
        y += 130
    return ImageClip(np.array(img)).set_duration(duration)

def create_caption_clip(text, duration, text_color):
    """자막 클립 생성 - RGBA 투명 배경 + mask 방식 (이미지가 보이도록)"""
    w, h = 1080, 1920
    
    # 빈 텍스트면 완전 투명 클립 반환
    if not text.strip():
        transparent = np.zeros((h, w, 3), dtype=np.uint8)
        mask_arr = np.zeros((h, w), dtype=np.float64)
        clip = ImageClip(transparent).set_duration(duration)
        mask = ImageClip(mask_arr, ismask=True).set_duration(duration)
        return clip.set_mask(mask).set_position("center")
    
    # 🔥 [핵심] RGBA 투명 배경으로 이미지 생성
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype(FONT_PATH, 70)
    except:
        font = ImageFont.load_default()
    
    lines = textwrap.wrap(text, width=14)
    y = int(h * 0.75) - ((len(lines) * 85) // 2)
    
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        x = (w - (bbox[2] - bbox[0])) // 2
        # 그림자 (불투명)
        draw.text((x + 5, y + 5), line, font=font, fill=(30, 30, 30, 255))
        # 본문 (불투명)
        from PIL import ImageColor
        try:
            r, g, b = ImageColor.getrgb(text_color)
        except:
            r, g, b = 255, 215, 0  # 기본 황금색
        draw.text((x, y), line, font=font, fill=(r, g, b, 255))
        y += 85
    
    # RGBA를 RGB + Alpha mask로 분리
    arr = np.array(img)
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3] / 255.0  # 0~1 범위로 정규화
    
    clip = ImageClip(rgb).set_duration(duration)
    mask = ImageClip(alpha, ismask=True).set_duration(duration)
    return clip.set_mask(mask).set_position("center")

# [최종 수정] make_video 함수: 효과 제거 + Pillow 강제 리사이징 (블랙스크린 해결용)
def make_video(voice_path, bgm_path, img_paths, script, hook_title, out_name, text_color, use_hook, progress_callback=None):
    print("🎬 영상 조립 및 렌더링 준비...")
    
    # 1. 오디오 설정
    voice = AudioFileClip(voice_path)
    total_dur = voice.duration + 1.0
    
    final_audio = voice
    if bgm_path and os.path.exists(bgm_path):
        bgm = AudioFileClip(bgm_path)
        full_len = total_dur + (3.0 if use_hook else 0)
        bgm = afx.audio_loop(bgm, duration=full_len).volumex(0.12)
        final_audio = bgm 

    # 2. 이미지 개수 계산 (2초 컷 기준 - 더 역동적)
    CUT_SEC = 2.0
    if not img_paths: return
    req_imgs = max(len(img_paths), int(total_dur / CUT_SEC))
    if len(img_paths) < req_imgs: img_paths = img_paths * (req_imgs//len(img_paths)+1)
    img_paths = img_paths[:req_imgs]

    # 3. 자막 분할 (한국어 호환 - 길이 기반 균등 분할)
    n = len(img_paths)
    script_clean = re.sub(r'\s+', ' ', script).strip()
    
    if n <= 1 or not script_clean:
        chunks = [script_clean] if script_clean else [""]
    else:
        # 길이 기반 균등 분할
        size = max(1, len(script_clean) // n)
        chunks = []
        for i in range(0, len(script_clean), size):
            chunk = script_clean[i:i+size].strip()
            if chunk:
                chunks.append(chunk)
        # 부족하면 마지막 청크 반복
        while len(chunks) < n:
            chunks.append(chunks[-1] if chunks else "")
        chunks = chunks[:n]

    clip_dur = total_dur / n
    main_clips = []
    
    # 🔥 [역동적 효과] 설정
    TRANSITION = 0.20   # 빠른 전환
    SCALE = 1.18        # 확대 (팬 효과용)
    FLASH_DUR = 0.06    # 컷 시작 번쩍
    FLASH_OPA = 0.20    # 플래시 투명도
    ROTATE_DEG = 1.2    # 미세 회전
    
    print("   └─ 이미지 클립 생성 중 (역동적 카메라 무빙 적용)...")
    for i, (p, txt) in enumerate(zip(img_paths, chunks)):
        try:
            # 1. PIL로 안전하게 이미지 로드
            pil_img = Image.open(p).convert('RGB')
            img_array = np.array(pil_img)
            
            # 2. 이미지 클립 생성 + 확대
            img = ImageClip(img_array).set_duration(clip_dur)
            img = img.resize(newsize=(1080, 1920)).resize(SCALE)
            
            # 3. 🔥 팬 효과 (위치만 이동 - 안정적)
            dx = img.w - 1080
            dy = img.h - 1920
            
            # 4방향 패턴: 좌→우, 우→좌, 상→하, 하→상
            patterns = [
                ((0, dy/2), (dx, dy/2)),       # left -> right
                ((dx, dy/2), (0, dy/2)),       # right -> left
                ((dx/2, 0), (dx/2, dy)),       # top -> bottom
                ((dx/2, dy), (dx/2, 0)),       # bottom -> top
            ]
            (sx, sy), (ex, ey) = patterns[i % len(patterns)]
            
            def pos(t, sx=sx, sy=sy, ex=ex, ey=ey, dur=clip_dur):
                p = t / dur if dur > 0 else 0
                x = sx + (ex - sx) * p
                y = sy + (ey - sy) * p
                return (-x, -y)
            
            img = img.set_position(pos)
            
            # 4. 🔥 가끔 미세 회전
            if i % 3 == 0:
                img = img.rotate(ROTATE_DEG)
            elif i % 3 == 1:
                img = img.rotate(-ROTATE_DEG)
            
            # 5. 자막 생성
            sub = create_caption_clip(txt, clip_dur, text_color)
            
            # 6. 합체
            combined = CompositeVideoClip([img, sub], size=(1080, 1920))
            
            # 7. 🔥 컷 시작 플래시 (번쩍)
            from moviepy.video.VideoClip import ColorClip
            flash = ColorClip(size=(1080, 1920), color=(255, 255, 255)).set_duration(FLASH_DUR).set_opacity(FLASH_OPA)
            combined = CompositeVideoClip([combined, flash.set_start(0)], size=(1080, 1920))
            
            # 8. 크로스페이드 효과
            combined = combined.fadein(TRANSITION).fadeout(TRANSITION)
            
            main_clips.append(combined)
            
        except Exception as e:
            print(f"⚠️ 이미지 처리 오류 (Scene {i}): {e}")
            continue

    if not main_clips: 
        print("❌ 생성된 클립 없음"); return
        
    # 🔥 크로스페이드로 이어붙이기 (겹치면서 전환)
    final_main_clip = concatenate_videoclips(main_clips, method="compose", padding=-TRANSITION)
    
    # 오디오 및 후킹 로직 (기존 유지)
    if bgm_path and os.path.exists(bgm_path): pass 
    else: final_audio = voice

    if use_hook and hook_title:
        hook_clip = create_hook_clip(hook_title, duration=3.0)
        final_video = concatenate_videoclips([hook_clip, final_main_clip])
        
        if bgm_path and os.path.exists(bgm_path):
            bgm_clip = AudioFileClip(bgm_path)
            bgm_clip = afx.audio_loop(bgm_clip, duration=final_video.duration).volumex(0.12)
            voice = voice.set_start(3.0)
            final_video = final_video.set_audio(CompositeAudioClip([bgm_clip, voice]))
        else:
            voice = voice.set_start(3.0)
            final_video = final_video.set_audio(voice)
    else:
        final_video = final_main_clip
        if bgm_path and os.path.exists(bgm_path):
            bgm_clip = AudioFileClip(bgm_path)
            bgm_clip = afx.audio_loop(bgm_clip, duration=final_main_clip.duration).volumex(0.12)
            final_video = final_video.set_audio(CompositeAudioClip([voice, bgm_clip]))
        else:
            final_video = final_video.set_audio(voice)

    print("🎬 렌더링 시작 (안전 모드)...")
    final_video.write_videofile(
        out_name, 
        fps=24, 
        codec='libx264', 
        audio_codec='aac', 
        preset='medium',
        threads=4
    )
    return out_name

# ==========================================
# 3. GUI (ULTRA - Console Embedded)
# ==========================================
class KnowledgeMakerUltra(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Knowledge Maker V30")
        self.geometry("700x850")
        self.configure(fg_color=BG)
        cfg = load_config()
        self.selected_bgm = None
        self.gen_data = {} 

        # 메인 컨테이너 (스크롤 가능)
        self.main_scroll = ctk.CTkScrollableFrame(self, fg_color=BG)
        self.main_scroll.pack(fill="both", expand=True)

        # 1. 헤더 (네온-미니멀)
        header = ctk.CTkFrame(self.main_scroll, fg_color="transparent")
        header.pack(fill="x", padx=20, pady=(20, 10))
        ctk.CTkLabel(header, text="Knowledge Maker", font=TITLE_FONT, text_color=TEXT).pack(side="left")
        ctk.CTkLabel(header, text="v3.0", font=SMALL_FONT, text_color=NEON).pack(side="left", padx=10)

        # 2. API 카드
        f_conf = ctk.CTkFrame(self.main_scroll, fg_color=CARD, corner_radius=R, border_width=1, border_color=BORDER)
        f_conf.pack(fill="x", padx=20, pady=10)
        ctk.CTkLabel(f_conf, text="API 설정", font=H2_FONT, text_color=NEON).pack(anchor="w", padx=20, pady=10)
        
        self.entries = {}
        gf = ctk.CTkFrame(f_conf, fg_color="transparent")
        gf.pack(fill="x", padx=10, pady=(0, 10))
        gf.columnconfigure(1, weight=1)
        
        for r, (lbl, key) in enumerate([("Google Gemini", "google_key"), ("ElevenLabs", "eleven_key"), ("OpenAI (DALL-E)", "openai_key")]):
            ctk.CTkLabel(gf, text=lbl, font=BODY_FONT, text_color=TEXT).grid(row=r, column=0, sticky="w", pady=5)
            e = ctk.CTkEntry(gf, height=32, border_color=BORDER, fg_color=CARD2, text_color=TEXT, show="*")
            e.grid(row=r, column=1, sticky="ew", padx=10, pady=5)
            e.insert(0, cfg[key]); self.entries[key] = e

        # 3. 옵션 카드
        f_opt = ctk.CTkFrame(self.main_scroll, fg_color=CARD, corner_radius=R, border_width=1, border_color=BORDER)
        f_opt.pack(fill="x", padx=20, pady=10)
        f_opt.columnconfigure(0, weight=1); f_opt.columnconfigure(1, weight=1)
        
        self.lang_var = ctk.StringVar(value="Korean")
        ctk.CTkOptionMenu(f_opt, variable=self.lang_var, values=LANG_OPTIONS, fg_color=CARD2, button_color=NEON, text_color=TEXT).grid(row=0, column=0, padx=10, pady=10, sticky="ew")
        
        self.voice_var = ctk.StringVar(value=list(VOICE_OPTIONS.keys())[0])
        ctk.CTkOptionMenu(f_opt, variable=self.voice_var, values=list(VOICE_OPTIONS.keys()), fg_color=CARD2, button_color=NEON, text_color=TEXT).grid(row=0, column=1, padx=10, pady=10, sticky="ew")
        
        self.color_var = ctk.StringVar(value=list(COLOR_OPTIONS.keys())[0])
        ctk.CTkOptionMenu(f_opt, variable=self.color_var, values=list(COLOR_OPTIONS.keys()), fg_color=CARD2, button_color=NEON, text_color=TEXT).grid(row=1, column=0, padx=10, pady=10, sticky="ew")
        
        self.hook_var = ctk.BooleanVar(value=True)
        ctk.CTkCheckBox(f_opt, text="후킹 타이틀(3초) 생성", variable=self.hook_var, font=BODY_FONT, text_color=TEXT, fg_color=NEON).grid(row=1, column=1, padx=10, pady=10, sticky="w")

        # 4. 생성 카드
        f_run = ctk.CTkFrame(self.main_scroll, fg_color=CARD, corner_radius=R, border_width=1, border_color=BORDER)
        f_run.pack(fill="x", padx=20, pady=10)
        
        self.entry_topic = ctk.CTkEntry(f_run, placeholder_text="주제를 입력하세요 (예: 맛집 베스트 5)", height=40, font=BODY_FONT, fg_color=CARD2, border_color=BORDER, text_color=TEXT)
        self.entry_topic.pack(fill="x", padx=15, pady=15)
        
        btn_box = ctk.CTkFrame(f_run, fg_color="transparent")
        btn_box.pack(fill="x", padx=15, pady=(0, 10))
        self.btn_bgm = ctk.CTkButton(btn_box, text="BGM 선택", font=BODY_FONT, fg_color=CARD2, hover_color=BORDER, text_color=TEXT, height=40, corner_radius=R, command=self.select_bgm)
        self.btn_bgm.pack(side="left", fill="x", expand=True, padx=(0, 5))
        self.btn_gen = ctk.CTkButton(btn_box, text="1. 기획안 생성", font=FONT_BOLD, height=40, fg_color=NEON, hover_color="#00B8D4", text_color="black", corner_radius=R, command=self.run_gen)
        self.btn_gen.pack(side="left", fill="x", expand=True, padx=(5, 0))

        self.txt_script = ctk.CTkTextbox(f_run, height=100, fg_color=CARD2, border_color=BORDER, border_width=1, text_color=TEXT)
        self.txt_script.pack(fill="x", padx=15, pady=10)
        
        f_hk = ctk.CTkFrame(f_run, fg_color="transparent"); f_hk.pack(fill="x", padx=15)
        ctk.CTkLabel(f_hk, text="후킹 문구:", font=BODY_FONT, text_color=NEON).pack(side="left")
        self.entry_hook = ctk.CTkEntry(f_hk, height=32, fg_color=CARD2, border_color=BORDER, text_color=TEXT); self.entry_hook.pack(side="right", fill="x", expand=True, padx=(10,0))
        
        self.btn_render = ctk.CTkButton(f_run, text="2. 영상 생성 시작", font=FONT_BOLD, height=50, fg_color=SUCCESS, hover_color="#25A76F", text_color="black", corner_radius=R, state="disabled", command=self.run_render)
        self.btn_render.pack(fill="x", padx=15, pady=15)
        
        # 푸터
        ctk.CTkLabel(self.main_scroll, text="Created by DuDu", font=SMALL_FONT, text_color=MUTED).pack(anchor="e", padx=20, pady=10)

    def select_bgm(self):
        f = filedialog.askopenfilename(filetypes=[("Audio","*.mp3")]); 
        if f: self.selected_bgm=f; self.btn_bgm.configure(text=f"✅ {os.path.basename(f)}", fg_color="#2CC985", text_color="black")

    def run_gen(self):
        t = self.entry_topic.get(); k = self.entries["google_key"].get(); l = self.lang_var.get()
        if not t or not k: return messagebox.showwarning("!", "정보 부족")
        self.btn_gen.configure(state="disabled", text="생성 중...")
        threading.Thread(target=self.th_gen, args=(k, t, l), daemon=True).start()

    def th_gen(self, k, t, l):
        try:
            print("-" * 30)
            print(f"🚀 기획안 생성 시작: {t}")
            hook, script, prompts, metadata = generate_viral_content(k, t, l)
            self.gen_data["prompts"] = prompts
            self.gen_data["metadata"] = metadata
            
            self.txt_script.delete("1.0", "end"); self.txt_script.insert("1.0", script)
            self.entry_hook.delete(0, "end"); self.entry_hook.insert(0, hook)
            
            print("✅ 기획안 생성 완료.")
            messagebox.showinfo("완료", "기획안이 준비되었습니다."); self.btn_render.configure(state="normal")
        except Exception as e: print(f"❌ 에러: {e}"); messagebox.showerror("Err", str(e))
        finally: self.btn_gen.configure(state="normal", text="1. 기획안 생성")

    def run_render(self):
        scr = self.txt_script.get("1.0", "end").strip(); hook = self.entry_hook.get()
        if not scr: return
        
        ks = {k: v.get() for k, v in self.entries.items()}
        save_config(ks["openai_key"], ks["eleven_key"], ks["google_key"])
        
        vid = VOICE_OPTIONS[self.voice_var.get()]; clr = COLOR_OPTIONS[self.color_var.get()]; use_hk = self.hook_var.get()
        
        self.btn_render.configure(state="disabled", text="작업 중...", fg_color="#FF4444")
        threading.Thread(target=self.th_render, args=(ks, scr, hook, vid, clr, use_hk), daemon=True).start()

    def th_render(self, ks, scr, hook, vid, clr, use_hk):
        # 🔥 진행률 시뮬레이션용 플래그
        self.render_done = False
        
        try:
            print("-" * 30)
            print("🎬 영상 렌더링 프로세스 시작...")
            
            # ====== 1단계: 음성 생성 (0-15%) ======
            self.btn_render.configure(text="● 음성 생성 중... 5%")
            vp = "temp_voice.mp3"
            if not generate_voice(ks["eleven_key"], scr, vp, vid): raise Exception("TTS 실패")
            self.btn_render.configure(text="● 음성 완료! 15%")
            
            # ====== 2단계: 이미지 생성 (15-45%) ======
            self.btn_render.configure(text="● 이미지 생성 중... 20%")
            imgs = generate_images(ks["openai_key"], self.gen_data.get("prompts", []))
            self.btn_render.configure(text="● 이미지 완료! 45%")
            
            # ====== 3단계: 렌더링 (45-95%) - 애니메이션 표시 ======
            self.btn_render.configure(text="● 영상 렌더링 중... 50%")
            
            # 별도 스레드에서 진행률 애니메이션 (50% → 95% → 반복)
            def simulate_progress():
                dots = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
                pct = 50
                idx = 0
                while not self.render_done:
                    # 50% → 94% 까지 천천히 증가
                    if pct < 94:
                        pct += 1
                    # 94%에서 애니메이션 계속
                    spinner = dots[idx % len(dots)]
                    self.btn_render.configure(text=f"{spinner} 렌더링 중... {pct}%")
                    idx += 1
                    time.sleep(2.0 if pct < 90 else 0.3)  # 90% 이후는 빠르게 회전
            
            sim_thread = threading.Thread(target=simulate_progress, daemon=True)
            sim_thread.start()
            
            # 실제 렌더링 (blocking)
            out_vid = f"Final_V30_{datetime.now().strftime('%H%M%S')}.mp4"
            make_video(vp, self.selected_bgm, imgs, scr, hook, out_vid, clr, use_hk)
            
            # 렌더링 완료 - 시뮬레이션 중지
            self.render_done = True
            self.btn_render.configure(text="● 마무리 중... 95%")
            
            # ====== 4단계: 정리 (95-100%) ======
            if "metadata" in self.gen_data:
                out_txt = out_vid.replace(".mp4", "_Upload_Info.txt")
                with open(out_txt, "w", encoding="utf-8") as f:
                    f.write(f"📺 주제: {self.entry_topic.get()}\n" + "="*30 + "\n")
                    f.write(self.gen_data["metadata"])
                    f.write("\n" + "="*30 + "\nMade with KnowledgeMaker V30")
                    print(f"📄 업로드 정보 저장됨: {out_txt}")

            if os.path.exists(vp): os.remove(vp)
            shutil.rmtree("images_ultra", ignore_errors=True)
            
            self.btn_render.configure(text="✅ 완료! 100%")
            print(f"✨ 모든 작업 완료! 파일: {out_vid}")
            messagebox.showinfo("성공", f"영상 생성 완료!\n📁 {out_vid}")
            
        except Exception as e: 
            self.render_done = True  # 시뮬레이션 중지
            print(f"❌ 치명적 오류: {e}")
            messagebox.showerror("Err", str(e))
        finally: 
            self.render_done = True
            self.btn_render.configure(state="normal", text="2. 영상 생성 시작", fg_color="#2CC985")

if __name__ == "__main__":
    app = KnowledgeMakerUltra()
    app.mainloop()
