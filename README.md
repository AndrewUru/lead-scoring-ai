# MVP de Lead Scoring con IA (Next.js)

Este proyecto es un MVP para analizar y puntuar leads mediante Inteligencia Artificial.

## 🧠 Funcionalidades

- Registro / Login de usuarios
- Subida de leads (CSV o formulario manual)
- Análisis de datos con IA (API externa como OpenAI)
- Visualización del scoring en tabla y gráficos
- Exportación de resultados

---

## 📁 Estructura del proyecto

```
lead-scoring-mvp/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── upload/page.tsx         # Subida de CSV o leads manuales
│   ├── dashboard/page.tsx      # Resultados y visualización
│   └── api/score/route.ts      # Endpoint para hacer el scoring con IA
├── components/
│   ├── Navbar.tsx
│   ├── LeadTable.tsx
│   └── UploadForm.tsx
├── lib/
│   └── openai.ts               # Función para consumir IA
├── styles/
│   └── globals.css
├── public/
├── utils/
│   └── parseCSV.ts             # Conversión de CSV a JSON
├── .env.local
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## 🚀 Siguientes pasos

1. Instalar dependencias:
```bash
npm install
```

2. Configurar `.env.local`:
```
OPENAI_API_KEY=tu_clave
```

3. Ejecutar local:
```bash
npm run dev
```
