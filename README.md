# MediaTools: Universal Media & Metadata Processor

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.x-lightgray.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://react.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.x-purple.svg)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A robust full-stack web application built with **Flask** (backend) and **React** (frontend) for seamless extraction, advanced processing, and intelligent delivery of media and metadata from popular platforms like YouTube, Instagram, and TikTok. It leverages `yt-dlp` and `FFmpeg` for powerful media handling capabilities, including format conversion and high-fidelity content retrieval.

## ⚠️ Disclaimer

This project is developed for **educational purposes and personal learning**. It serves as a technical demonstration of advanced media processing and extraction capabilities using open-source tools.

**Users are solely responsible** for ensuring their use of this application complies with all applicable laws, intellectual property rights, and the terms of service of third-party platforms (e.g., YouTube, Instagram, TikTok). The developers do not endorse or encourage any unauthorized use, distribution, or infringement of copyrighted material. By using this software, you agree to assume all risks and not hold the developers liable for any consequences.

## 🌟 Features

- **YouTube Integration (High‑fidelity content retrieval)**
  - Comprehensive YouTube video search by query or URL
  - Extract detailed video information (title, thumbnail, duration, available qualities)
  - Obtain YouTube videos in various resolutions (e.g., 1080p, 720p) with format conversion
  - Convert YouTube videos directly to MP3 audio format
  - Bypass API rate limits and retrieve rich video details

- **Instagram Extractor (Metadata & public media)**
  - Fetch public Instagram profile information, including high‑quality profile pictures
  - Extract metadata and public media from Instagram posts (videos, images, slideshows)
  - Intelligent request handling to navigate platform intricacies

- **TikTok Handler (Watermark‑free video extraction)**
  - Extract raw video sources from TikTok **without watermarks**
  - Retrieve video metadata and associated music information
  - Supports both single videos and slideshows

- **Universal Media Processor & Delivery**
  - Centralized mechanism for processing and delivering content from all supported platforms
  - Real‑time content processing progress tracking directly in the UI
  - Server‑side media processing using `yt-dlp` and `FFmpeg`

- **User Authentication**
  - Secure user registration, login, and logout
  - Password hashing using `scrypt`
  - Session management with `Flask-Login`

- **Dynamic Frontend**
  - Modern, responsive, intuitive UI built with React
  - Smooth animations and transitions using `Framer Motion`
  - Easy tool selection and navigation

- **CORS Support**
  - Pre‑configured for seamless communication between frontend (e.g., `http://localhost:5173`) and backend

## 🛠 Technologies Used

### Backend (Flask)
- **Python** – Programming language
- **Flask** – Lightweight web framework
- **Flask-SQLAlchemy** – ORM for SQLite database
- **Flask-Login** – User session & authentication
- **Flask-CORS** – Cross‑Origin Resource Sharing
- **Werkzeug Security** – Password hashing (`scrypt`)
- **yt-dlp** – Downloading videos from YouTube and other sites
- **requests** – HTTP library
- **FFmpeg** – Multimedia framework (must be installed separately)

### Frontend (React)
- **React** – UI library
- **Vite** – Fast build tool
- **React Router DOM** – Navigation
- **Framer Motion** – Animations
- **Tailwind CSS** – Utility‑first CSS framework

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- **Python 3.9+** – [Download Python](https://www.python.org/downloads/)
- **Node.js & npm** – [Download Node.js](https://nodejs.org/)
- **FFmpeg** – Critical for `yt-dlp` (media conversion & stream merging)

#### Installing FFmpeg
- **Windows**: Download a static build from [ffmpeg.org](https://ffmpeg.org/download.html). Extract and place `ffmpeg.exe` and `ffprobe.exe` directly into your `backend/` directory (where `app.py` resides) or add them to your system PATH.
- **macOS**: `brew install ffmpeg` (requires [Homebrew](https://brew.sh/))
- **Linux (Debian/Ubuntu)**: `sudo apt update && sudo apt install ffmpeg`

### 1. Clone the Repository

```bash
git clone https://github.com/Sadra-Madayeni/MediaTools.git
cd MediaTools
```
### 2. Backend Setup (Flask)
``` bash 
cd backend
python -m venv venv

# Activate the virtual environment
# Windows:
.\venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```
# Create .env file for your secret key in MediaTools/backend
# DO NOT USE ECHO COMMAND TO PREVENT ENCODING ISSUES
paste these in your .env file
```bash
SECRET_KEY=your_super_secret_key_123
DATABASE_URL=sqlite:///users.db
DEBUG=True
PORT=5000
```
# (Optional) If you encounter YouTube 429 errors, export your YouTube cookies as cookies.txt and place it in backend/

### 3. run the backend server

```bash 
python app.py
```
### 4. Frontend Setup (React)

Open A new Termunal Window

```bash 
cd frontend
npm install
npm run dev
```

### 5. Run The application
```bash 
Backend: http://localhost:5000

Frontend: http://localhost:5173
```
Open your browser and go to http://localhost:5173
