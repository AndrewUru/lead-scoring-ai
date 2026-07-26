# LocalLead AI

Aplicación local-first para importar, analizar, puntuar y segmentar leads sin enviar información a servicios externos.

## Características

- Importación de CSV con mapeo automático de columnas
- Leads de Instagram, LinkedIn, TikTok, Facebook, X y YouTube
- Señales sociales: usuario, seguidores, engagement, mensajes, comentarios, clics y campaña
- Detección de duplicados por email, teléfono o identidad
- Scoring comercial configurable y explicable
- Similitud semántica local con WebGPU y respaldo WASM
- Desglose de encaje, intención, engagement, calidad y semántica
- Segmentos dinámicos
- Dashboard y gráficos
- Copias de seguridad JSON
- Persistencia mediante IndexedDB y Dexie
- Sin OpenAI, claves API ni backend

## Tecnología

Next.js 16, React 19, TypeScript, IndexedDB/Dexie, Transformers.js, Tailwind CSS, Recharts y Papa Parse.

## Ejecución

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Privacidad

Los leads permanecen en el navegador. La aplicación no incluye rutas de scoring en servidor ni depende de una base de datos externa. El modelo se descarga la primera vez que se activa su inferencia, se ejecuta en el dispositivo y queda en la caché del navegador. El directorio `public/models/` está preparado para distribuir modelos ONNX propios.

## CSV de redes sociales

La importación reconoce encabezados en español e inglés como `red social`, `platform`, `usuario`, `handle`, `followers`, `engagement_rate`, `dms`, `comments`, `social_clicks` y `campaign`. Un lead social puede importarse únicamente con su usuario, aunque no tenga nombre o email.

## Limitaciones

Los datos dependen del almacenamiento del navegador. Crea copias de seguridad periódicas desde Configuración.
