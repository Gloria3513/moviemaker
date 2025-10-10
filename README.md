# Movie Maker 🎬

영상 제작을 위한 웹 애플리케이션

## 기능

- 🔐 Google 소셜 로그인
- 📁 파일 업로드 (드래그 앤 드롭)
- 📚 영상 라이브러리
- 🎥 영상 편집 (개발 예정)

## 배포된 앱 보기

🚀 **라이브 데모**: [moviemaker.vercel.app](https://moviemaker.vercel.app) (배포 후 URL 업데이트 예정)

## 시작하기

### 1. 의존성 설치

```bash
# 전체 의존성 설치
npm run install:all
```

### 2. Firebase 설정

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 프로젝트 생성
2. Authentication에서 Google 로그인 활성화
3. 웹 앱 등록 후 설정값 복사
4. `client/.env` 파일 생성 및 설정값 입력:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=http://localhost:5000
```

### 3. 개발 서버 실행

```bash
# 클라이언트와 서버 동시 실행
npm run dev
```

또는 개별 실행:

```bash
# 서버만 실행
npm run server:dev

# 클라이언트만 실행
npm run client:dev
```

### 4. 접속

- 클라이언트: http://localhost:5173
- 서버 API: http://localhost:5000

## 프로젝트 구조

```
moviemaker/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── contexts/       # Context API
│   │   ├── hooks/          # Custom Hooks
│   │   ├── services/       # API 서비스
│   │   └── firebase/       # Firebase 설정
│   └── package.json
├── server/                 # Express 백엔드
│   ├── index.js           # 서버 메인 파일
│   └── package.json
├── uploads/               # 업로드된 파일들
└── package.json          # 루트 package.json
```

## API 엔드포인트

- `POST /api/upload` - 파일 업로드
- `GET /api/files` - 파일 목록 조회
- `DELETE /api/files/:filename` - 파일 삭제
- `GET /uploads/:filename` - 파일 다운로드

## 기술 스택

### Frontend
- React 19
- React Router
- Firebase Authentication
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express
- Multer (파일 업로드)
- CORS
- FFmpeg (영상 처리)

## 개발 현황

- ✅ 마일스톤 1: 로그인 시스템
- ✅ 마일스톤 2: 파일 관리 시스템
- 🚧 마일스톤 3: 영상 편집 기능 (개발 중)

## 라이선스

ISC