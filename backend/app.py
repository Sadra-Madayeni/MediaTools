import os
import time
import re
import io
import requests
import yt_dlp
from dotenv import load_dotenv
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from youtubesearchpython import VideosSearch
import http.cookiejar

load_dotenv()

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

app.config.update(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'default-fallback-secret-key'),
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=False,
    SESSION_COOKIE_HTTPONLY=True,
    SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOAD_FOLDER = os.path.join(BASE_DIR, 'downloads')
COOKIES_FILE = os.path.join(BASE_DIR, 'cookies.txt')
FFMPEG_PATH = BASE_DIR

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)

history_list = []
download_status = {}

if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    name = db.Column(db.String(150), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

with app.app_context():
    db.create_all()

def progress_hook(d):
    download_id = d.get('info_dict', {}).get('download_id')
    if not download_id: return
    
    if d['status'] == 'downloading':
        total = d.get('total_bytes') or d.get('total_bytes_estimate')
        downloaded = d.get('downloaded_bytes', 0)
        
        if total and total > 0:
            percent = round((downloaded / total) * 100, 1)
            download_status[download_id] = {'status': 'downloading', 'percent': percent, 'msg': 'در حال دانلود...'}
            
    elif d['status'] == 'finished':
        download_status[download_id] = {'status': 'converting', 'percent': 100, 'msg': 'ترکیب صدا و تصویر...'}

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()
    if user: return jsonify({'error': 'Email already exists'}), 400
    
    new_user = User(email=data.get('email'), name=data.get('name'), password=generate_password_hash(data.get('password'), method='scrypt'))
    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)
    return jsonify({'status': 'success', 'name': new_user.name})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()
    if user and check_password_hash(user.password, data.get('password')):
        login_user(user)
        return jsonify({'status': 'success', 'name': user.name})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout')
def logout():
    logout_user()
    return jsonify({'status': 'success'})

@app.route('/api/user')
def get_user():
    if current_user.is_authenticated:
        return jsonify({'is_logged_in': True, 'name': current_user.name})
    return jsonify({'is_logged_in': False})

@app.route('/api/search/youtube', methods=['POST'])
def search_youtube():
    data = request.json
    query = data.get('query')

    target_url = query
    if not query.startswith("http"):
        try:
            videos_search = VideosSearch(query, limit=1)
            results = videos_search.result()
            if results and results.get('result'):
                target_url = results['result'][0]['link']
            else:
                return jsonify({'error': 'Video not found'}), 404
        except Exception as e:
            print(f"Search API Error: {e}")
            return jsonify({'error': str(e)}), 500

    ydl_opts = {
        'quiet': True, 
        'noplaylist': True,
        'extractor_args': {'youtube': ['player_client=android,ios']},
        'ffmpeg_location': FFMPEG_PATH
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(target_url, download=False)
            if 'entries' in info: 
                info = info['entries'][0]

            formats = info.get('formats', [])
            
            if not formats:
                return jsonify({'error': 'هیچ فرمتی یافت نشد. ویدیو ممکن است محدودیت سنی یا کپی‌رایت داشته باشد.'}), 400

            unique_heights = set(f['height'] for f in formats if f.get('height'))

            return jsonify({
                'title': info.get('title'),
                'thumbnail': info.get('thumbnail'),
                'duration': info.get('duration_string'),
                'url': info.get('webpage_url') or target_url,
                'qualities': sorted(list(unique_heights), reverse=True)
            })
    except Exception as e:
        print(f"yt-dlp Extraction Error: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/search/instagram', methods=['POST'])
def search_instagram():
    data = request.json
    url = data.get('url')
    mode = data.get('mode', 'video')
    
    if mode == 'profile':
        try:
            username = url.split("instagram.com/")[1].split("/")[0] if "instagram.com" in url else url.replace('@', '')
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-Fetch-Mode': 'navigate'
            }
            
            cj = http.cookiejar.MozillaCookieJar(COOKIES_FILE)
            try:
                cj.load(ignore_discard=True, ignore_expires=True)
            except Exception:
                pass
                
            session = requests.Session()
            session.cookies = cj
            
            response = session.get(f"https://www.instagram.com/{username}/", headers=headers, timeout=10)
            
            if response.status_code == 200:
                html = response.text
                
                thumbnail = None
                hd_match = re.search(r'"profile_pic_url_hd":"([^"]+)"', html)
                if hd_match:
                    thumbnail = hd_match.group(1).replace('\\u0026', '&').replace('\\/', '/')
                else:
                    pic_match = re.search(r'"profile_pic_url":"([^"]+)"', html)
                    if pic_match:
                        thumbnail = pic_match.group(1).replace('\\u0026', '&').replace('\\/', '/')
                    else:
                        og_match = re.search(r'property="og:image"\s*content="([^"]+)"', html)
                        if not og_match:
                            og_match = re.search(r'content="([^"]+)"\s*property="og:image"', html)
                        if og_match:
                            thumbnail = og_match.group(1).replace('&amp;', '&')
                
                biography = ""
                desc_match = re.search(r'"biography":"([^"]*)"', html)
                if desc_match:
                    biography = desc_match.group(1).replace('\\n', '\n')
                
                if not thumbnail:
                    return jsonify({'error': 'عکس پروفایل یافت نشد، ممکن است اینستاگرام دسترسی را مسدود کرده باشد.'}), 404
                
                # crop settings
                
                thumbnail = re.sub(r'/[sp]\d+x\d+/', '/', thumbnail) 
                thumbnail = re.sub(r'/c\d+(?:\.\d+)+/', '/', thumbnail)
                
                return jsonify({
                    'type': 'profile', 
                    'uploader': username, 
                    'biography': biography, 
                    'thumbnail': thumbnail,
                    'url': thumbnail,
                    'is_private': False
                })
            else:
                return jsonify({'error': 'Profile not found or blocked by Instagram'}), 404
                
        except Exception as e: 
            return jsonify({'error': str(e)}), 400

    ydl_opts = {'cookiefile': COOKIES_FILE, 'quiet': True, 'noplaylist': True, 'ffmpeg_location': FFMPEG_PATH}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            media_type = 'slideshow' if 'entries' in info else 'video'
            slides = [e['url'] for e in info['entries']] if media_type == 'slideshow' else []
            return jsonify({'type': media_type, 'title': info.get('description') or info.get('title'), 'thumbnail': info.get('thumbnail'), 'url': info.get('webpage_url'), 'slides': slides})
    except Exception as e: 
        return jsonify({'error': str(e)}), 500

@app.route('/api/search/tiktok', methods=['POST'])
def search_tiktok():
    data = request.json
    url = data.get('url')
    ydl_opts = {'quiet': True, 'noplaylist': True, 'ffmpeg_location': FFMPEG_PATH}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            media_type = 'slideshow' if 'entries' in info else 'video'
            slides = [e['url'] for e in info['entries']] if media_type == 'slideshow' else []
            return jsonify({'type': media_type, 'title': info.get('description') or info.get('title'), 'thumbnail': info.get('thumbnail'), 'music_info': f"{info.get('artist')} - {info.get('track')}", 'slides': slides, 'url': info.get('webpage_url')})
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/download', methods=['POST'])
def download():
    data = request.json
    download_id = data.get('id')
    quality = data.get('quality')
    
    download_status[download_id] = {'status': 'starting', 'percent': 0, 'msg': 'شروع دانلود...'}
    
    clean_title = re.sub(r'[^\w\s-]', '', data.get('title')).strip()[:50]
    if quality and quality != 'best':
        safe_title = f"{clean_title}_{quality}p"
    else:
        safe_title = clean_title
    if not safe_title: safe_title = f"dl_{int(time.time())}"
    
    ydl_opts = {
        'outtmpl': os.path.join(DOWNLOAD_FOLDER, f'{safe_title}.%(ext)s'),
        'noplaylist': True,
        'progress_hooks': [progress_hook],
        'http_headers': {'User-Agent': 'Mozilla/5.0 ...'},
        'merge_output_format': 'mp4' if data.get('type') != 'mp3' else None,
        'extractor_args': {'youtube': ['player_client=android,ios']},
        'ffmpeg_location': FFMPEG_PATH,
        'quiet': True,
        'noprogress': True
    }
    
    if data.get('type') == 'mp3':
        ydl_opts.update({
            'format': 'bestaudio/best', 
            'final_ext': 'mp3',
            'postprocessors': [
                {'key': 'FFmpegExtractAudio','preferredcodec': 'mp3','preferredquality': '192'}, 
                {'key': 'EmbedThumbnail'},
                {'key': 'FFmpegMetadata','add_metadata': True}
            ]
        })
    else:
        if quality and quality != 'best':
            ydl_opts['format'] = f'bestvideo[height<={quality}]+bestaudio/best[height<={quality}]/best'
        else:
            ydl_opts['format'] = 'bestvideo+bestaudio/best'

    try:
        class MyLogger:
            def debug(self, msg): pass
            def warning(self, msg): pass
            def error(self, msg): print(msg)

        ydl_opts['logger'] = MyLogger()

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(data.get('url'), download=True)
            info['download_id'] = download_id
            
            expected_filename = ydl.prepare_filename(info)
            base, _ = os.path.splitext(expected_filename)
            final_file = None
            
            possible_exts = ['.mp4', '.mkv', '.webm', '.mp3']

            clean_base = base.strip()
            for ext in possible_exts:
                if os.path.exists(clean_base + ext):
                    final_file = clean_base + ext
                    break
        
            if not final_file:
                for ext in possible_exts:
                    if os.path.exists(base + ext):
                        final_file = base + ext
                        break

            if not final_file:
                raise FileNotFoundError("فایل نهایی پیدا نشد")

            clean_name = os.path.basename(final_file)
            
            if download_id in download_status: del download_status[download_id]
            return jsonify({'status': 'ready', 'filename': clean_name})

    except Exception as e:
        error_msg = str(e)
        print(f"Download Error: {e}")
        if download_id in download_status: del download_status[download_id]
        clean_error = re.sub(r'\x1b\[.*?m', '', error_msg)
        return jsonify({'error': clean_error}), 500

@app.route('/api/progress/<download_id>')
def progress(download_id):
    return jsonify(download_status.get(download_id, {'percent': 0}))

@app.route('/api/file/<filename>')
def get_file(filename):
    return send_file(os.path.join(DOWNLOAD_FOLDER, filename), as_attachment=True)

@app.route('/api/proxy-image')
def proxy_image():
    url = request.args.get('url')
    try:
        r = requests.get(url, stream=True)
        return send_file(io.BytesIO(r.content), mimetype='image/jpeg')
    except: return "Error", 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)      