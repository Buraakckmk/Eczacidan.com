# Eczacıdan.com B2B Platform

Bu monorepo yapısı, eczaneler arası B2B e-ticaret ve pazaryeri platformu için
Clean Architecture prensiplerine uygun bir başlangıç temelini sunar.

## Klasör yapısı

- backend/: FastAPI, SQLAlchemy, Pydantic tabanlı API katmanı
- frontend-web/: Vite + React + TypeScript + PWA tabanlı web uygulaması
- frontend-mobile/: Expo + React Native + TypeScript tabanlı mobil uygulama

## Başlangıç adımları

1. Backend bağımlılıklarını kurun:
   - `cd backend`
   - `pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic`

2. Web uygulamasını kurun:
   - `cd frontend-web`
   - `npm create vite@latest . -- --template react-ts`
   - `npm install`
   - `npm install -D vite-plugin-pwa`

3. Mobil uygulamasını kurun:
   - `cd frontend-mobile`
   - `npx create-expo-app . --template blank-typescript`

4. API'yi çalıştırın:
   - `cd backend`
   - `uvicorn backend.main:app --reload`

5. Web uygulamasını çalıştırın:
   - `cd frontend-web`
   - `npm run dev`

6. Mobil uygulamasını çalıştırın:
   - `cd frontend-mobile`
   - `npx expo start`
