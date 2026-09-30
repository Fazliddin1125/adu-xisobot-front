# adu-xisobot-front

ADU ATM bo'limi — murojaatlar va topshiriqlar tizimining frontend qismi.

**Texnologiyalar:** React 19, TypeScript, Vite, TailwindCSS 4, React Router, TanStack Query, Recharts, dnd-kit, lucide-react.

## Ishga tushirish

```bash
npm install
npm run dev     # http://localhost:5180
```

Dev rejimda `/api` so'rovlari `http://localhost:4100` ga (backend) yo'naltiriladi — boshqa manzil uchun `VITE_API_PROXY` o'zgaruvchisi.

Production: `npm run build` → `dist/`, yoki `Dockerfile` (nginx, `/api` → `api:4100`).
