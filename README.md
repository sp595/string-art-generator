# String Art Generator - React

Advanced React application to generate stunning string art patterns from your images.

**🌐 Live Demo:** https://your-domain.com
**📖 Full Documentation:** See guides below

## Caratteristiche

### Core Features
- **Caricamento immagine**: Trascina o seleziona un'immagine (drag & drop)
- **Parametri configurabili**:
  - Numero di pin (100-500)
  - Distanza minima tra pin (10-100)
  - Numero massimo di linee (1000-8000)
  - Peso della linea (5-30)
  - Dimensione dell'immagine (400-1200px)
- **Export multipli**: Scarica coordinate JSON e immagine PNG
- **Anteprima interattiva**: Toggle tra originale e risultato

### Algoritmi Disponibili

#### Algoritmo Base (Veloce)
1. **Algoritmo di Bresenham**: Tracciamento linee efficiente
2. **Pre-caching completo**: Tutte le linee pre-calcolate
3. **Greedy error minimization**: Minimizzazione iterativa dell'errore
4. **Conversione luminanza**: Formula ottimale 0.299R + 0.587G + 0.114B

#### Algoritmo Avanzato (Qualità Superiore) ⭐ NEW
1. **Edge Detection (Sobel)**: Priorità automatica ai bordi dell'immagine
2. **Weighted Error Function**: Importanza pesata per aree critiche
3. **Adaptive Line Weight**: Peso dinamico basato su progressione e errore residuo
4. **Look-Ahead Algorithm**: Valuta passi futuri per scelte ottimali
5. **Anti-Aliasing (Wu)**: Linee smooth con algoritmo di Wu (opzionale)

### Ottimizzazioni Performance

- **Web Workers**: Esecuzione in thread separato (non blocca UI)
- **Progress tracking**: Feedback in tempo reale durante generazione
- **Memory efficient**: Gestione ottimizzata delle strutture dati

## Come Usare

### Modalità Base
1. Carica un'immagine
2. Regola i parametri base (pin, linee, peso)
3. Clicca "Genera String Art"

### Modalità Avanzata
1. Apri "Opzioni Avanzate"
2. Attiva "Usa Algoritmo Avanzato"
3. Configura:
   - Edge Detection per enfatizzare i bordi
   - Look-Ahead per scelte più intelligenti
   - Anti-Aliasing per linee più smooth
   - Peso Edge Detection (0.0-1.0)
4. Genera e confronta i risultati

### ⚠️ Performance e Limiti

### Configurazione Consigliata (Default)
```
Pins: 300
Max Lines: 3000
Image Size: 600px
Algoritmo: Base
Web Worker: ✅ Attivo
```

**Tempo stimato**: ~2-5 secondi

### Algoritmo Avanzato
L'algoritmo avanzato è **significativamente più lento** (5-10x):
- ✅ **Quando usarlo**: Output finale, immagini importanti
- ❌ **Quando evitarlo**: Preview, test rapidi
- ⚠️ **Look-Ahead**: Aggiunge +50% tempo - usare solo se necessario
- ⚠️ **Anti-Aliasing**: Aggiunge +100% tempo - solo per esportazione finale

### Limiti Tecnici
- **Image Size max**: 800px (oltre causa lentezza estrema)
- **Max Lines max**: 5000 (oltre blocca il browser)
- **Pins max**: 400 (oltre rallenta molto)

### Performance Tips

- **Per velocità massima**: Algoritmo base + Web Worker (default)
- **Per qualità alta**: Algoritmo avanzato + Edge Detection (NO look-ahead)
- **Per qualità massima**: Come sopra + Anti-Aliasing (solo export finale)

## Ricerca Scientifica

Basato su paper accademici recenti (2024) sulla computational string art:
- Greedy algorithm con gradient descent
- Importance weighting per pixel
- Multi-step look-ahead optimization
- Sobel edge detection per feature enhancement

## Installazione

```bash
npm install
```

## Utilizzo

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

## Formato Output JSON

```json
{
  "lineSequence": [23, 145, 67, ...],
  "pinCoords": [
    { "x": 400, "y": 0 },
    { "x": 398, "y": 8 },
    ...
  ],
  "parameters": {
    "pins": 300,
    "minDistance": 30,
    "maxLines": 4000,
    "lineWeight": 15,
    "imageSize": 800
  },
  "stats": {
    "totalLines": 4000,
    "generatedAt": "2025-10-05T..."
  }
}
```

## Tecnologie

- React 18
- Vite
- Canvas API
- Algoritmo greedy ottimizzato

## License

MIT
