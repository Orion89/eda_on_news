# El Eco de las Palabras
### Análisis Lingüístico, Exploratorio y Scrollytelling de Medios Iberoamericanos

[![D3.js](https://img.shields.io/badge/D3.js-v7.9-orange.svg)](https://d3js.org/)
[![Scrollama.js](https://img.shields.io/badge/Scrollama.js-v3.2-blue.svg)](https://github.com/russellgoldenberg/scrollama)
[![Python](https://img.shields.io/badge/Python-3.11+-green.svg)](https://www.python.org/)
[![spaCy](https://img.shields.io/badge/spaCy-NLP-09a3d5.svg)](https://spacy.io/)
[![PySentimiento](https://img.shields.io/badge/PySentimiento-RoBERTa-yellow.svg)](https://github.com/pysentimiento/pysentimiento)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

**El Eco de las Palabras** es una plataforma web de periodismo de datos y *scrollytelling* interactivo diseñada para explorar, auditar y contrastar cuantitativamente los patrones editoriales, la carga emocional, la complejidad léxica, el centralismo geográfico y la autoría en más de **1.17 millones de noticias** publicadas en **Argentina, Chile, España y México**.

El proyecto une el rigor del procesamiento de lenguaje natural (NLP) y la minería de texto con visualizaciones de datos fluidas y responsivas desarrolladas en **D3.js**, guiando al usuario a través de una narrativa estructurada que va desde la macro-estructura del ecosistema informativo hasta la micro-química del lenguaje periodístico.

---

## 📊 Ecosistema de Datos

El corpus analizado abarca un total de **1,179,251 noticias** en español recolectadas de cientos de redacciones digitales y periódicos tradicionales entre los años 2000 y 2026:

| País | Dataset | Filas / Noticias | Medios Analizados | Enfoque Geográfico |
| :--- | :--- | :---: | :---: | :--- |
| 🇦🇷 **Argentina** | `news_argentina` | **293,484** | 25 top redacciones | Medios nacionales, provinciales y portales digitales |
| 🇨🇱 **Chile** | `news_chile` | **206,222** | 25 top redacciones | Diarios nacionales, prensa regional y agencias |
| 🇪🇸 **España** | `news_espana` | **466,443** | 25 top redacciones | Prensa generalista, diarios económicos y autonómicos |
| 🇲🇽 **México** | `news_mexico` | **213,102** | 25 top redacciones | Prensa nacional, diarios estatales y medios nativos digitales |
| 🌎 **Total Regional** | **Corpus Iberoamericano** | **1,179,251** | **100+ redacciones** | **Ecosistema hispanohablante** |

---

## 🛠️ Stack Tecnológico

El proyecto se divide en dos capas fundamentales: el pipeline analítico de procesamiento de lenguaje natural y el motor de visualización interactiva para la web.

### 1. Motor de Visualización y Frontend
- **D3.js (v7.9.0)**: Construcción de gráficos vectoriales personalizados basados en datos SVG y Canvas, escalas matemáticas dinámicas, transiciones animadas y simulación de fuerzas colisionales (`d3.forceSimulation`).
- **Scrollama.js (v3.2.0)**: Coordinación de eventos de *scrollytelling*, detección de intersección basada en `IntersectionObserver` y sincronización entre pasos narrativos y estados visuales.
- **D3-Sankey (v0.12.3)**: Generación de layouts dirigidos de flujo y asignación de anchos de enlace para el análisis de autoría.
- **TopoJSON Client (v3.1.0)**: Descompresión de topologías geográficas y renderizado de geometrías mundiales sobre proyecciones cartográficas Mercator.
- **Vanilla CSS3 Moderno**: Arquitectura de diseño con tokens CSS personalizados, CSS Grid, Flexbox, layout a dos columnas para escritorio y panel persistente `sticky` adaptativo para tabletas y teléfonos móviles.

### 2. Pipeline de Ciencia de Datos y NLP (Python)
- **Pandas & NumPy**: Carga optimizada de datasets Parquet, agregaciones multivariables, remuestreos temporales y transformaciones vectorizadas.
- **NLTK (Natural Language Toolkit)**: Tokenización de oraciones/palabras (`word_tokenize`, `sent_tokenize`), filtrado de *stopwords* y etiquetado morfosináctico (*POS Tagging* con Perceptron Tagger).
- **spaCy (`es_core_news_lg`)**: Reconocimiento de Entidades Nombradas (*Named Entity Recognition* - NER) a gran escala para clasificación de lugares (`LOC`) y personas (`PER`).
- **PySentimiento (RoBERTa)**: Modelos de Transformers adaptados al español para clasificación probabilística de emociones discretas (*alegría, tristeza, ira, miedo*).
- **GeoPy & Nominatim**: Geocodificación de coordenadas geográficas (latitud/longitud) con limitador de tasa y caché persistente en disco.
- **Gender-Guesser & RapidFuzz**: Deduplicación aproximada de cadenas y clasificación probabilística de nombres de pila de periodistas.
- **Pyphen**: Silabación algorítmica para el cálculo de índices de legibilidad y dificultad lectora (INFLESZ).

---

## 🔬 Análisis Exploratorio de Textos (EDA) en Python

El procesamiento exhaustivo de los 4 datasets se encuentra documentado e implementado en la notebook [`notebooks/eda_news.ipynb`](./notebooks/eda_news.ipynb). A continuación se detallan las 5 fases analíticas clave aplicadas sobre el corpus:

### 1. Análisis por Medio y Concentración (Sección 4 de la Notebook)
**Objetivo:** Normalizar la heterogeneidad de los nombres de los medios (eliminando subdominios, esquemas URL y variaciones tipográficas) y evaluar la concentración de la producción periodística bajo la Ley de Pareto.

- **Deduplicación de dominios:** Se utilizó `tldextract` y `rapidfuzz` sobre el catálogo de medios únicos para unificar dominios equivalentes (ej. `m.elmostrador.cl`, `www.elmostrador.cl/noticias` $\rightarrow$ `elmostrador.cl`).
- **Agregaciones:** Se calcularon conteos absolutos, proporciones relativas, medianas de caracteres y palabras por noticia, y la suma acumulada del porcentaje de cobertura.

```python
def extraer_dominio_limpio(texto):
    if pd.isna(texto) or not isinstance(texto, str):
        return ""
    ext = tldextract.extract(texto)
    if ext.domain:
        return f"{ext.domain}.{ext.suffix}"
    return utils.default_process(texto)

def optimizar_nombres_medios(df: pd.DataFrame, columna_origen: str = 'media_name') -> pd.DataFrame:
    medios_unicos = df[columna_origen].dropna().unique()
    df_unicos = pd.DataFrame({columna_origen: medios_unicos})
    df_unicos['clean_name'] = df_unicos[columna_origen].apply(extraer_dominio_limpio)
    
    # Mapeo vectorizado de vuelta al DataFrame principal
    mapeo = dict(zip(df_unicos[columna_origen], df_unicos['clean_name']))
    df['media_name_normalized'] = df[columna_origen].map(mapeo).fillna(df[columna_origen])
    return df
```

### 2. Análisis de Autores y Flujo de Cobertura (Sección 5 de la Notebook)
**Objetivo:** Auditar la transparencia y el tipo de reportería distinguiendo entre contenido de agencia (*refritos informativos*), redacción anónima institucional y periodistas con firma propia, infiriendo además la brecha de género en las firmas.

- **Reglas heurísticas:** Filtrado de prefijos periodísticos ("Por:", "Redacción:") y clasificación de agencias de noticias reconocidas (*EFE, Reuters, AFP, Europa Press, Notimex, Télam*).
- **Inferencia de género:** Detección sobre el primer nombre mediante `gender_guesser.detector.Detector()`, agrupando en flujos para diagramas de Sankey.

```python
def generar_datos_sankey_autoria(df: pd.DataFrame, country_name: str) -> dict:
    gd = gender.Detector(case_sensitive=False)
    
    agencias = ['efe', 'reuters', 'afp', 'europa press', 'notimex', 'telam', 'ap']
    anonimos = ['redacción', 'redaccion', 'el país', 'clarin', 'el universal', 'emol']
    
    def clasificar_autor(autor_str):
        if not autor_str or pd.isna(autor_str):
            return "Anónimo"
        a_low = autor_str.lower()
        if any(ag in a_low for ag in agencias):
            return "Agencia"
        if any(an in a_low for an in anonimos):
            return "Anónimo"
        return "Firmado"
    
    df['tipo_autor'] = df['author'].apply(clasificar_autor)
    # Extracción de primer nombre e inferencia de género para los artículos firmados...
```

### 3. Características Lingüísticas y Legibilidad (Sección 10 de la Notebook)
**Objetivo:** Medir la sofisticación formal de los textos mediante la riqueza léxica (*Type-Token Ratio* - TTR), la longitud promedio de las oraciones y el nivel de escolaridad exigido para su comprensión mediante el índice INFLESZ.

- **Type-Token Ratio (TTR):** Relación entre palabras únicas ($\text{tokens}_{\text{únicos}}$) y el total de palabras del texto ($\text{tokens}_{\text{totales}}$).
- **Índice INFLESZ (Adaptación Flesch-Szigriszt para el español):**
$$\text{INFLESZ} = 206.835 - 62.3 \times \left(\frac{\text{Sílabas}}{\text{Palabras}}\right) - \left(\frac{\text{Palabras}}{\text{Frases}}\right)$$
- **Mapeo a Escolaridad:** Interpolación lineal por tramos para traducir el puntaje INFLESZ a años de educación formal requeridos (Nivel Básico: 6–9 años, Medio: 9–12 años, Universitario: 12–20 años).

```python
def calcular_escolaridad(puntaje_inflesz: float) -> float:
    if puntaje_inflesz >= 80:
        return 6.0 - ((puntaje_inflesz - 80) / 20.0) * 2.0   # 4 a 6 años
    elif puntaje_inflesz >= 65:
        return 8.0 - ((puntaje_inflesz - 65) / 15.0) * 2.0   # 6 a 8 años
    elif puntaje_inflesz >= 55:
        return 12.0 - ((puntaje_inflesz - 55) / 10.0) * 4.0  # 8 a 12 años
    elif puntaje_inflesz >= 40:
        return 16.0 - ((puntaje_inflesz - 40) / 15.0) * 4.0  # 12 a 16 años
    else:
        escolaridad = 16.0 + ((40 - puntaje_inflesz) / 40.0) * 4.0
        return min(escolaridad, 20.0) # Nivel universitario / postgrado
```

### 4. Categorías Gramaticales y POS Tagging (Sección 13 de la Notebook)
**Objetivo:** Descomponer el perfil morfosintáctico de las redacciones para determinar la proporción entre contenido factual (sustantivos), dinamismo narrativo (verbos) y juicios de valor / carga calificativa (adjetivos).

- **Etiquetado:** Uso de `nltk.pos_tag()` con el conjunto de etiquetas Penn Treebank / Universal POS.
- **Categorización:**
  - **Adjetivos (`JJ`, `JJR`, `JJS`)**: Subjetividad y ponderación editorial.
  - **Verbos (`VB`, `VBD`, `VBG`, `VBN`, `VBP`, `VBZ`)**: Acción y desarrollo de eventos.
  - **Sustantivos (`NN`, `NNS`, `NNP`, `NNPS`)**: Referencias fácticas, entidades y sujetos.
  - **Otros**: Preposiciones, determinantes, conjunciones y adverbios.

```python
def top_pos_per_media(df: pd.DataFrame, pos_mapping: dict, column_name: str = "media_name_normalized", 
                      top_k: int = 25, sample_size: int = 100_000) -> dict:
    top_media = df[column_name].value_counts().head(top_k).index.tolist()
    pos_per_media = {}
    
    for media in top_media:
        media_df = df[df[column_name] == media]
        sample = media_df['body'].dropna().sample(n=min(sample_size, len(media_df)), random_state=42)
        media_pos = Counter()
        
        for text in sample:
            words = [w for w in word_tokenize(text) if w.isalpha()]
            if words:
                tagged = pos_tag(words)
                for _, tag in tagged:
                    media_pos[tag] += 1
        pos_per_media[media] = media_pos
    return pos_per_media
```

### 5. Análisis Temporal Avanzado: Emociones y Localizaciones NER (Sección 14 de la Notebook)
**Objetivo:** Evaluar la evolución de las emociones a lo largo de los años y cuantificar el centralismo territorial en la pauta de noticias.

- **Reconocimiento de Entidades Nombradas (NER):** Extracción de entidades `LOC` mediante `spaCy` (`es_core_news_lg`) sobre lotes de texto, geocodificación mediante `geopy.geocoders.Nominatim` con limitador de llamadas y almacenamiento en caché JSON.
- **Análisis de Emociones con Transformers:** Inferencia sobre el *lead* (primeros 250–500 caracteres) utilizando `pysentimiento` para obtener probabilidades de *alegría, tristeza, ira y miedo*. Se aplicó remuestreo temporal diario y suavizado mediante media móvil de 7–14 días (`rolling mean`).

```python
def generar_datos_emocionales(df: pd.DataFrame, pais: str, max_chars: int = 250, window_size: int = 7) -> str:
    analyzer = create_analyzer(task="emotion", lang="es")
    textos = df['body'].astype(str).str.slice(0, max_chars).tolist()
    
    outputs = analyzer.predict(textos)
    resultados = [{'miedo': o.probas['fear'], 'ira': o.probas['anger'],
                   'tristeza': o.probas['sadness'], 'alegría': o.probas['joy']} for o in outputs]
    
    df_emotions = pd.DataFrame(resultados)
    df_emotions['date'] = pd.to_datetime(df['date'])
    
    # Remuestreo diario y suavizado por media móvil
    daily_avg = df_emotions.groupby('date').mean().resample('D').mean().interpolate(method='linear')
    smoothed = daily_avg.rolling(window=window_size, min_periods=1).mean()
    return smoothed.reset_index().melt(id_vars=['date'], var_name='emotion', value_name='intensity').to_json(orient='records')
```

---

## 📖 Estructura del Recorrido Interactivo (Scrollytelling)

El sitio web organiza los hallazgos en **7 capítulos visuales interactivos**:

```
El Eco de las Palabras
 ├── 01. Concentración Mediática (Packed Bubble Chart / Force Simulation)
 ├── 02. Huellas Dactilares Estilísticas (Scatter Plot con Cuadrantes Léxicos)
 ├── 03. La Anatomía del Discurso (100% Stacked Bar Chart de POS Tagging)
 ├── 04. El Termómetro Emocional (Ridgeline Joyplot Multipaís)
 ├── 05. El Mapa del Poder y el Centralismo (Bubble Map Geográfico con TopoJSON)
 ├── 06. La Barrera de Cristal (Beeswarm Plot de Legibilidad INFLESZ)
 └── 07. El Rostro de la Noticia (Diagrama de Sankey de Autoría y Género)
```

---

### Capítulo 1: La Huella de la Concentración Mediática
- **Concepto:** Muestra cómo se distribuye el volumen total de la información en cada país para contrastar la concentración editorial frente a la dispersión de la "larga cola" de pequeños portales.
- **Visualización en D3.js:** *Packed Bubble Chart* animado con simulación de fuerzas (`d3.forceSimulation`, `forceCollide`, `forceX`, `forceY`).
- **Interacción:** Las burbujas se agrupan por país (Argentina, Chile, España, México). Al desplazarse por la narrativa, los medios con menos de 100 noticias colapsan en una sola entidad "Otros", evidenciando que menos del 5% de las redacciones concentran la gran mayoría del volumen noticioso.

---

### Capítulo 2: Huellas Dactilares Estilísticas
- **Concepto:** Analiza el estilo técnico de redacción cruzando la riqueza de vocabulario (TTR) con la longitud promedio de las oraciones en 80 redacciones.
- **Visualización en D3.js:** *Scatter Plot* con cuadrantes de fondo basados en las medianas regionales (32.2 palabras/oración y TTR de 0.474).
- **Interacción:** El usuario puede alternar y filtrar qué país visualizar. Los cuadrantes clasifican los medios en perfiles editoriales: *Complejo/Analítico*, *Simple/Directo*, *Oraciones Largas* y *Vocabulario Rico*.

---

### Capítulo 3: La Anatomía del Discurso
- **Concepto:** Descompone la estructura sintáctica de 100 medios digitales para evaluar el equilibrio entre objetividad (sustantivos y verbos) y subjetividad / juicio de valor (adjetivos).
- **Visualización en D3.js:** *Gráfico de Barras Apiladas Normalizado al 100%* horizontal.
- **Interacción:** Selector interactivo por país y botón dinámico para ordenar de mayor a menor carga adjetival o restablecer el orden alfabético, resaltando qué redacciones presentan un perfil más sobrio frente a aquellas con mayor carga calificativa.

---

### Capítulo 4: El Termómetro Emocional
- **Concepto:** Mide la temperatura psicológica y la carga de afectos (*Alegría, Miedo, Tristeza, Ira*) de las noticias a lo largo de los años.
- **Visualización en D3.js:** *Ridgeline Plot* (Joyplot) con curvas de densidad orgánicas suavizadas mediante `d3.curveBasis`.
- **Interacción:** Botones de alternancia para cambiar entre emociones, permitiendo comparar los patrones basales entre España, México, Argentina y Chile e identificar momentos históricos de máxima tensión o euforia.

---

### Capítulo 5: El Mapa del Poder y el Centralismo
- **Concepto:** Geolocaliza las menciones territoriales en las noticias para medir el grado de centralismo mediático frente a la visibilidad de las regiones.
- **Visualización en D3.js:** *Bubble Map* geográfico proyectado sobre un mapa vectorial TopoJSON de América Latina y Europa con proyección Mercator.
- **Interacción:** Al hacer scroll por cada país, el mapa ejecuta transiciones de *zoom* suave hacia las coordenadas geográficas de cada nación, mostrando la concentración masiva de menciones en las capitales (Santiago, Buenos Aires, Ciudad de México, Madrid).

---

### Capítulo 6: La Barrera de Cristal (Legibilidad y Acceso)
- **Concepto:** Traduce las métricas lingüísticas en años de escolaridad formal requeridos para comprender las noticias según la fórmula INFLESZ, exponiendo si el lenguaje periodístico excluye a sectores con menor formación académica.
- **Visualización en D3.js:** *Beeswarm Plot* (gráfico de enjambre) con simulación física pre-enfriada (*offline ticks*) sobre bandas de nivel educativo: *Básica* (6–9 años), *Media* (9–12 años) y *Universitaria* (12–20 años).
- **Interacción:** Visualización de líneas de mediana por país y *tooltips* interactivos que presentan fragmentos reales de noticias de alta complejidad.

---

### Capítulo 7: El Rostro de la Noticia (Autoría y Género)
- **Concepto:** Audita la transparencia de las notas informativas clasificando el contenido en despachos de agencias, notas anónimas y firmas propias de periodistas, examinando además la paridad de género en los artículos firmados.
- **Visualización en D3.js:** *Diagrama de Sankey* multinivel con degradados SVG dirigidos.
- **Interacción:** Selector por país con cálculo en tiempo real del porcentaje de "periodismo industrial" (agencias + anónimo) versus la distribución entre firmas masculinas y femeninas.

---

## 📚 Metodología, Fuentes y Referencias

### Fuentes de Datos
Los datos originales fueron recolectados utilizando la biblioteca de código abierto [`newspaper4k`](https://newspaper4k.readthedocs.io/en/latest/) de Python directamente desde los portales web públicos de los medios de comunicación seleccionados en cada país, respetando las políticas de acceso y sin comprometer el funcionamiento de los servidores. `newspaper4k` fue desarrollado originalmente por Lucas Ou-Yang bajo la licencia MIT.

### Rigor Metodológico
1. **Normalización y Deduplicación:** Se eliminaron duplicados textuales exactos mediante funciones hash (`body_hash`) y se estandarizaron los nombres de los medios combinando extracción de dominio raíz y agrupamiento difuso (Jaro-Winkler).
2. **Procesamiento de Lenguaje Natural:** El análisis sintáctico y la extracción de entidades se efectuaron mediante pipelines de `spaCy` y `NLTK`, filtrando *stopwords* y entidades espurias.
3. **Modelado Afectivo:** La detección de emociones se realizó con modelos basados en arquitecturas Transformer fine-tuned para el idioma español (`pysentimiento`), aplicando remuestreos diarios y filtros de media móvil para aislar tendencias temporales.
4. **Geolocalización:** Las entidades de ubicación (`LOC`) se normalizaron y geocodificaron utilizando la base de datos de OpenStreetMap mediante Nominatim con control de concurrencia y caché persistente.

### Referencias Bibliográficas
- **Jurafsky, D., & Martin, J. H. (2024).** *Speech and Language Processing* (3rd ed. draft). Stanford University.
- **Bengfort, B., Bilbro, R., & Ojeda, T. (2018).** *Applied Text Analysis with Python*. O'Reilly Media.
- **Silge, J., & Robinson, D. (2017).** *Text Mining with R: A Tidy Approach*. O'Reilly Media.
- **Meeks, E., & Dufour, A. (2024).** *D3.js in Action* (3rd ed.). Manning Publications Co.
- **Asboth, D. (2025).** *The Well-Grounded Data Analyst*. Manning Publications Co.
- **Nussbaumer Knaflic, C. (2015).** *Storytelling with Data: A Data Visualization Guide for Business Professionals*. John Wiley & Sons.

---

## 👤 Autor y Contacto

**Leonardo Molina**  
*Data Science & Visual Analytics*

- 🐙 **GitHub:** [https://github.com/Orion89](https://github.com/Orion89)
- 💼 **LinkedIn:** [https://www.linkedin.com/in/leonardo-molina-v-68a601183/](https://www.linkedin.com/in/leonardo-molina-v-68a601183/)
