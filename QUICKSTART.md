# Quick Start - String Art Generator

## 🚀 Installazione e Avvio

```bash
cd react-string-art
npm install
npm run dev
```

Apri http://localhost:5173

## 📝 Uso Base (Consigliato)

### 1. Carica Immagine
- Clicca su "Clicca o trascina un'immagine qui"
- Scegli un'immagine (meglio con alto contrasto)

### 2. Usa Parametri Default
I parametri di default sono **ottimizzati per velocità**:
- Pins: 300
- Max Lines: 3000
- Image Size: 600px
- Web Worker: Attivo ✅

### 3. Genera
- Clicca "Genera String Art"
- Attendi 2-5 secondi
- Vedrai il progresso in tempo reale

### 4. Esporta
- **Immagine PNG**: Clicca "Scarica Immagine"
- **Coordinate JSON**: Clicca "Esporta Coordinate JSON"

## ⚙️ Regolare i Parametri

### Per Risultati Migliori

**Più Dettaglio** → Aumenta "Numero Massimo Linee" (ma più lento)
**Più Definizione** → Aumenta "Numero di Pin" (ma più lento)
**Linee più visibili** → Aumenta "Peso Linea"
**Immagine più grande** → Aumenta "Dimensione Immagine" (ma molto più lento)

### ⚠️ Attenzione
- Non superare 400 pins
- Non superare 5000 linee
- Non superare 800px image size
- **Oltre questi limiti il browser potrebbe bloccarsi!**

## 🎨 Algoritmo Avanzato (Solo per Utenti Esperti)

### Quando Usarlo
- ✅ Output finale di alta qualità
- ✅ Immagini importanti (ritratti, loghi)
- ❌ **NON** per preview o test rapidi

### Come Attivare
1. Apri "Opzioni Avanzate"
2. Spunta "Usa Algoritmo Avanzato"
3. **Raccomandato**: Lascia Edge Detection ✅
4. **NON consigliato**: Look-Ahead (troppo lento)
5. **Solo export finale**: Anti-Aliasing

### Tempo Previsto
- Algoritmo Base: ~3 secondi
- Algoritmo Avanzato: ~15-30 secondi
- Con Look-Ahead: ~45-60 secondi
- Con Anti-Aliasing: ~60-120 secondi

## 🐛 Risoluzione Problemi

### Il browser si blocca
- **Causa**: Parametri troppo alti
- **Soluzione**: Riduci pins/lines/imageSize, ricarica la pagina

### Risultato poco definito
- **Causa**: Poche linee o immagine poco contrastata
- **Soluzione**: Aumenta "Max Lines" o modifica l'immagine

### Troppo lento
- **Causa**: Algoritmo avanzato o parametri alti
- **Soluzione**: Usa algoritmo base con Web Worker (default)

### Errore durante generazione
- **Causa**: Immagine troppo grande o corrotta
- **Soluzione**: Riduci dimensione immagine prima del caricamento

## 💡 Tips

1. **Preprocessing**: Aumenta contrasto dell'immagine prima di caricarla
2. **Test incrementale**: Inizia con pochi pins/linee, poi aumenta
3. **Salva configurazioni**: Annota i parametri che funzionano
4. **Export multipli**: Salva sia JSON che PNG

## 📊 Parametri Consigliati per Tipo Immagine

### Ritratto
```
Pins: 300-350
Max Lines: 4000
Line Weight: 15-18
Image Size: 600
Algoritmo: Avanzato + Edge Detection
```

### Logo/Testo
```
Pins: 250
Max Lines: 2500
Line Weight: 20
Image Size: 600
Algoritmo: Avanzato + Edge Detection 1.0
```

### Paesaggio
```
Pins: 250-300
Max Lines: 3000
Line Weight: 12-15
Image Size: 600
Algoritmo: Base o Avanzato
```

### Preview Veloce
```
Pins: 200
Max Lines: 2000
Line Weight: 15
Image Size: 400
Algoritmo: Base + Web Worker
```

## 📄 Formato JSON Output

Il file JSON contiene:
- `lineSequence`: Array di indici pin nell'ordine di disegno
- `pinCoords`: Coordinate (x,y) di ogni pin
- `parameters`: Parametri usati
- `stats`: Statistiche generazione

Usa questo JSON per ricreare la string art fisicamente o in altri software.
