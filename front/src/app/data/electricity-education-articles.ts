// front/src/app/data/electricity-education-articles.ts

import { EducationArticle } from '../models/education.model';

export const electricityEducationArticles: EducationArticle[] = [
  {
    id: 'electricidad-001',
    slug: 'electrodomesticos-eficientes-ahorro-energia',
    title: 'Electrodomésticos Eficientes: La Clave del Ahorro Energético Inteligente',
    summary: 'Descubre cómo elegir y usar electrodomésticos eficientes puede reducir tu consumo eléctrico hasta un 40% sin sacrificar comodidad.',
    content: `
      <div class="article-content">
        <img src="https://www.factorenergia.com/wp-content/uploads/2021/04/etiqueta-energ%C3%A9tica.png" alt="Electrodomésticos con etiqueta de eficiencia energética A+++" class="article-image-main">

        <h3>🏷️ Etiqueta de Eficiencia Energética: Tu Mejor Aliada</h3>
        <p>La etiqueta de eficiencia energética es <strong>obligatoria en México desde 2020</strong> y te permite identificar qué tanto consume un electrodoméstico. <strong>Un refrigerador A+++ consume 60% menos energía</strong> que uno de clase D.</p>

        <div class="tip-box">
          <h4>💡 Tip de Compra Inteligente</h4>
          <p>Aunque un electrodoméstico eficiente cueste más inicialmente, el ahorro en electricidad recupera la inversión en 2-3 años.</p>
        </div>

        <h3>❄️ Refrigerador: El Rey del Consumo Doméstico</h3>
        <img src="https://sub-zeromx.com/wp-content/uploads/2023/12/Refrigerador-Sub-Zero-de-Gran-Capacidad.jpg" alt="Refrigerador moderno con clasificación energética A+++" class="article-image">
        <p>El refrigerador consume <strong>25-30% de la electricidad total</strong> de tu hogar. Un modelo eficiente puede ahorrarte hasta <strong>$2,400 MXN al año</strong>.</p>

        <h4>Características de un Refrigerador Eficiente:</h4>
        <ul>
          <li><strong>Clasificación A+++:</strong> Máxima eficiencia disponible</li>
          <li><strong>Tecnología Inverter:</strong> Ajusta automáticamente la potencia</li>
          <li><strong>Tamaño adecuado:</strong> 150L por persona es la medida ideal</li>
          <li><strong>Aislamiento mejorado:</strong> Mantiene temperatura con menos energía</li>
        </ul>

        <h3>💨 Aires Acondicionados y Climatización</h3>
        <p>Los aires acondicionados pueden representar <strong>hasta el 50% del recibo de luz</strong> en temporada de calor. La diferencia entre un equipo eficiente y uno estándar es dramática.</p>

        <div class="action-box">
          <h4>🎯 Cálculo Rápido de Ahorro</h4>
          <p>Minisplit Inverter 12,000 BTU clase A vs. convencional:</p>
          <p><strong>Ahorro mensual: $800-1,200 MXN</strong> (uso 8 horas diarias)</p>
        </div>

        <h3>🔌 Otros Electrodomésticos Clave</h3>

        <h4>Lavadora</h4>
        <img src="https://news.samsung.com/co/wp-content/themes/sw_newsroom/download.php?id=OCBpbebVDzhWNNZhMM1Rp7itXa%2B8xRko9OzCnT8j0zI%3D" alt="Lavadora de carga frontal con certificación energética" class="article-image">
        <ul>
          <li><strong>Carga frontal vs. superior:</strong> 40% menos consumo de agua y electricidad</li>
          <li><strong>Programas eco:</strong> Reducen consumo hasta 30%</li>
          <li><strong>Carga completa:</strong> Maximiza eficiencia por ciclo</li>
        </ul>

        <h4>Televisor</h4>
        <ul>
          <li><strong>LED vs. LCD tradicional:</strong> 50% menos consumo</li>
          <li><strong>Tamaño inteligente:</strong> 32" consume 60W, 55" consume 150W</li>
          <li><strong>Modo standby:</strong> Apágalo completamente, no en standby</li>
        </ul>

        <h3>📊 Impacto Real en tu Recibo</h3>
        <div class="impact-calculator">
          <p><strong>Refrigerador eficiente:</strong> -$200 MXN/mes</p>
          <p><strong>Aire acondicionado Inverter:</strong> -$800 MXN/mes</p>
          <p><strong>Lavadora eficiente:</strong> -$150 MXN/mes</p>
          <p><strong>Iluminación LED:</strong> -$120 MXN/mes</p>
          <p class="total"><strong>Ahorro total mensual: ~$1,270 MXN</strong></p>
        </div>

        <div class="warning-box">
          <h4>⚠️ Cuidado con las Falsas Ofertas</h4>
          <p>Electrodomésticos muy baratos suelen ser ineficientes. Verifica siempre la etiqueta de eficiencia energética antes de comprar.</p>
        </div>

        <h3>🛒 Guía de Compra Inteligente</h3>
        <ol>
          <li><strong>Revisa la etiqueta energética</strong> - Busca clase A++ o A+++</li>
          <li><strong>Calcula el consumo anual</strong> - Multiplica kWh/año × $3.5 MXN</li>
          <li><strong>Compara costo total</strong> - Precio inicial + 10 años de consumo</li>
          <li><strong>Verifica garantía</strong> - Equipos eficientes suelen tener mejor garantía</li>
        </ol>

        <div class="action-box">
          <h4>🎯 Plan de Reemplazo Estratégico</h4>
          <p>No reemplaces todo a la vez. Prioriza: 1) Refrigerador viejo, 2) Aire acondicionado ineficiente, 3) Lavadora, 4) Otros electrodomésticos.</p>
        </div>
      </div>
    `,
    category: 'electricidad',
    imageUrl: 'https://blogs.unsw.edu.au/nowideas/files/2019/03/electrodomesticos-eficientes.jpg',
    readingTime: 1,
    tags: ['electrodomésticos', 'eficiencia', 'ahorro', 'etiqueta energética'],
    publishDate: new Date('2025-01-20'),
    featured: true
  },

  {
    id: 'electricidad-002',
    slug: 'iluminacion-led-ahorro-energia-hogar',
    title: 'Revolución LED: Cómo la Iluminación Inteligente Transforma tu Hogar',
    summary: 'Cambiar a iluminación LED puede reducir el consumo de iluminación hasta 80% y durar 25 veces más que los focos tradicionales.',
    content: `
      <div class="article-content">
        <img src="https://iluminet.com/newpress/wp-content/uploads/2014/09/comparativa-lamps.jpg" alt="Comparación entre bombillas LED, fluorescentes y incandescentes" class="article-image-main">

        <h3>💡 La Revolución de la Iluminación LED</h3>
        <p>Los LEDs (Light Emitting Diodes) han revolucionado la iluminación doméstica. <strong>Un LED de 9W ilumina igual que un foco incandescente de 60W</strong>, consumiendo 85% menos energía.</p>

        <div class="tip-box">
          <h4>💰 Cálculo de Ahorro Inmediato</h4>
          <p>Reemplazar 10 focos incandescentes por LED ahorra aproximadamente <strong>$150 MXN mensuales</strong> en electricidad.</p>
        </div>

        <h3>📊 Comparativa de Tecnologías de Iluminación</h3>
        <img src="https://ledslamparascastellon.wordpress.com/wp-content/uploads/2015/01/150106183100_led_bombillos_y_led_624x351_thinkstock.jpg" alt="Tabla comparativa de consumo entre diferentes tipos de iluminación" class="article-image">

        <div class="savings-table">
          <h4>Consumo para 800 lúmenes (equivalente a foco de 60W):</h4>
          <p><strong>Incandescente:</strong> 60W - Vida útil: 1,000 horas - $1.80/mes</p>
          <p><strong>Fluorescente compacto:</strong> 13W - Vida útil: 8,000 horas - $0.39/mes</p>
          <p><strong>LED:</strong> 9W - Vida útil: 25,000 horas - $0.27/mes</p>
        </div>

        <h3>🏠 Estrategia de Iluminación por Áreas</h3>

        <h4>Sala y Comedores</h4>
        <ul>
          <li><strong>LEDs regulables:</strong> Ajusta intensidad según la actividad</li>
          <li><strong>Temperatura de color:</strong> 2700K-3000K para ambiente cálido</li>
          <li><strong>Múltiples fuentes:</strong> Combina iluminación general y de acento</li>
        </ul>

        <h4>Cocina</h4>
        <img src="https://www.spaciosintegrales.com/wp-content/uploads/iluminacion-led-carril-spacios-integrales-bogota.png" alt="Cocina moderna con iluminación LED bajo gabinetes y general" class="article-image">
        <ul>
          <li><strong>Iluminación de tarea:</strong> LEDs bajo gabinetes para área de trabajo</li>
          <li><strong>Luz brillante:</strong> 4000K-5000K para mejor visibilidad</li>
          <li><strong>Resistentes al calor:</strong> LEDs soportan mejor el ambiente de cocina</li>
        </ul>

        <h4>Recámaras</h4>
        <ul>
          <li><strong>Luz cálida:</strong> 2700K para relajación y descanso</li>
          <li><strong>Dimmers:</strong> Control de intensidad para diferentes momentos</li>
          <li><strong>Lámparas de lectura:</strong> LEDs focalizados de 3000K</li>
        </ul>

        <h3>🔧 Instalación y Tipos de LED</h3>

        <h4>LEDs de Rosca Estándar</h4>
        <p>Reemplazo directo de focos tradicionales. <strong>Instalación inmediata</strong> sin modificar instalación eléctrica.</p>

        <h4>Paneles LED</h4>
        <p>Ideales para oficinas y cocinas. <strong>Iluminación uniforme</strong> y consumo ultra-bajo.</p>

        <h4>Tiras LED</h4>
        <img src="https://algsa.es/images/content/news/2024021413135228845ventajas-de-la-iluminacion-con-tiras-led.webp" alt="Tiras LED instaladas como iluminación decorativa y funcional" class="article-image">
        <p>Perfectas para iluminación indirecta y decorativa. <strong>Consumo mínimo</strong> y efectos espectaculares.</p>

        <div class="action-box">
          <h4>🛠️ Instalación Paso a Paso</h4>
          <ol>
            <li><strong>Apaga el interruptor</strong> antes de cambiar cualquier foco</li>
            <li><strong>Desenrosca el foco viejo</strong> cuando esté frío</li>
            <li><strong>Enrosca el LED nuevo</strong> - mismo socket, diferente tecnología</li>
            <li><strong>Enciende y disfruta</strong> el ahorro inmediato</li>
          </ol>
        </div>

        <h3>🌅 Iluminación Natural + LED</h3>
        <p>Combina iluminación natural con LEDs para <strong>máxima eficiencia</strong>:</p>
        <ul>
          <li><strong>Sensores de movimiento:</strong> LEDs solo cuando necesites luz</li>
          <li><strong>Fotoceldas:</strong> Ajuste automático según luz natural</li>
          <li><strong>Temporizadores:</strong> Encendido/apagado programado</li>
        </ul>

        <h3>💡 Tecnologías Avanzadas</h3>

        <h4>LEDs Inteligentes</h4>
        <div class="tip-box">
          <h4>🏠 Smart Home</h4>
          <p>LEDs controlables por app pueden programarse para simular presencia cuando viajas, mejorando la seguridad.</p>
        </div>

        <h4>LEDs con Sensor</h4>
        <p>Perfectos para pasillos, baños y áreas de poco uso. <strong>Encendido automático</strong> solo cuando detectan movimiento.</p>

        <h3>💰 Retorno de Inversión</h3>
        <div class="impact-calculator">
          <p><strong>Inversión inicial:</strong> $200 MXN por foco LED de calidad</p>
          <p><strong>Ahorro mensual:</strong> $15 MXN por foco reemplazado</p>
          <p><strong>Tiempo de recuperación:</strong> 13 meses</p>
          <p><strong>Ahorro a 10 años:</strong> $1,600 MXN por foco</p>
          <p class="total"><strong>ROI: 800% en vida útil del LED</strong></p>
        </div>

        <div class="warning-box">
          <h4>⚠️ Cuidado con LEDs Baratos</h4>
          <p>LEDs de muy bajo costo suelen fallar rápido y dar luz de mala calidad. Invierte en marcas reconocidas para obtener los beneficios completos.</p>
        </div>

        <h3>🌟 Beneficios Adicionales</h3>
        <ul>
          <li><strong>Menos calor:</strong> LEDs no calientan como incandescentes</li>
          <li><strong>Encendido instantáneo:</strong> No necesitan calentarse</li>
          <li><strong>Resistentes:</strong> No se rompen fácilmente como fluorescentes</li>
          <li><strong>Sin mercurio:</strong> Ambientalmente seguros</li>
        </ul>

        <div class="action-box">
          <h4>🎯 Plan de Migración LED</h4>
          <p>Semana 1: Cambia focos más usados (sala, cocina). Semana 2: Recámaras principales. Semana 3: Baños y pasillos. Semana 4: Áreas exteriores y de poco uso.</p>
        </div>
      </div>
    `,
    category: 'electricidad',
    imageUrl: 'https://arqa.com/wp-content/uploads/2019/06/lamp-2-530x346.jpg',
    readingTime: 1,
    tags: ['LED', 'iluminación', 'ahorro energético', 'smart home'],
    publishDate: new Date('2025-01-15'),
    featured: true
  },

  {
    id: 'electricidad-003',
    slug: 'climatizacion-eficiente-aire-acondicionado-calefaccion',
    title: 'Climatización Inteligente: Confort Perfecto sin Quebrar tu Presupuesto',
    summary: 'Aprende las técnicas profesionales para usar aires acondicionados y calefacción de forma eficiente, reduciendo hasta 50% el consumo eléctrico.',
    content: `
      <div class="article-content">
        <img src="https://www.electricidadexpertos.com/wp-content/uploads/2024/11/Termostato-inteligente-moderno.webp" alt="Sistema de climatización moderno con control inteligente de temperatura" class="article-image-main">

        <h3>🌡️ El Secreto de la Climatización Eficiente</h3>
        <p>La climatización representa <strong>40-60% del consumo eléctrico total</strong> en hogares mexicanos. Una estrategia inteligente puede mantener el confort mientras <strong>reduces el consumo a la mitad</strong>.</p>

        <div class="alert-box">
          <h4>🔥 Dato Impactante</h4>
          <p>Cada grado de diferencia en el termostato puede aumentar o disminuir el consumo eléctrico entre 6-8%. ¡La temperatura correcta es oro!</p>
        </div>

        <h3>❄️ Aire Acondicionado: Estrategias de Eficiencia</h3>
        <img src="https://inverter.mx/wp-content/uploads/2021/05/tecnologia-ecologica-de-Inverter-3.jpg" alt="Aire acondicionado tipo inverter con display de temperatura" class="article-image">

        <h4>La Regla de Oro: 24-25°C</h4>
        <p>La temperatura ideal para aire acondicionado es <strong>24-25°C</strong>. Cada grado menos significa 8% más consumo:</p>

        <div class="savings-table">
          <p><strong>22°C:</strong> $1,500 MXN/mes (100% consumo)</p>
          <p><strong>24°C:</strong> $1,200 MXN/mes (20% ahorro)</p>
          <p><strong>25°C:</strong> $1,050 MXN/mes (30% ahorro)</p>
          <p><strong>26°C:</strong> $900 MXN/mes (40% ahorro)</p>
        </div>

        <h4>Tecnología Inverter vs. Convencional</h4>
        <ul>
          <li><strong>Inverter:</strong> Ajusta velocidad del compresor gradualmente</li>
          <li><strong>Convencional:</strong> Solo enciende/apaga a máxima potencia</li>
          <li><strong>Ahorro Inverter:</strong> 30-50% menos consumo</li>
          <li><strong>Recuperación de inversión:</strong> 2-3 años</li>
        </ul>

        <h3>🏠 Estrategias de Enfriamiento Inteligente</h3>

        <h4>Pre-enfriamiento Nocturno</h4>
        <div class="tip-box">
          <h4>💰 Truco de Tarifa Eléctrica</h4>
          <p>En tarifa DAC, pre-enfría tu casa de 22:00 a 6:00 (tarifa intermedia) para mantener frescura durante horas pico.</p>
        </div>

        <h4>Zonificación Inteligente</h4>
        <img src="https://static.casadomo.com/media/2016/12/20130218-airzone-cilmatizacion.jpg" alt="Plano de casa mostrando zonificación de climatización" class="article-image">
        <ul>
          <li><strong>Enfría solo áreas ocupadas:</strong> Cierra puertas de habitaciones vacías</li>
          <li><strong>Minisplits individuales:</strong> Control independiente por zona</li>
          <li><strong>Ventiladores de apoyo:</strong> Permiten subir 2-3°C el termostato</li>
        </ul>

        <h3>🌬️ Ventilación Natural Estratégica</h3>
        <p>Combinar ventilación natural con aire acondicionado <strong>multiplica la eficiencia</strong>:</p>

        <h4>Ventilación Cruzada</h4>
        <ol>
          <li><strong>Apaga A/C en la madrugada</strong> (3:00-6:00 AM)</li>
          <li><strong>Abre ventanas opuestas</strong> para crear corriente</li>
          <li><strong>Usa ventiladores</strong> para acelerar intercambio de aire</li>
          <li><strong>Cierra antes del amanecer</strong> para conservar frescura</li>
        </ol>

        <h4>Ventiladores de Techo Inteligentes</h4>
        <div class="action-box">
          <h4>⚡ Combinación Perfecta</h4>
          <p>Ventilador de techo (75W) + A/C a 26°C = mismo confort que A/C solo a 23°C, pero 40% menos consumo.</p>
        </div>

        <h3>🔧 Mantenimiento para Máxima Eficiencia</h3>

        <h4>Limpieza de Filtros</h4>
        <img src="https://blog.bauhaus.es/wp-content/uploads/2023/07/limpiar-filtros-aire-acondicionado2.jpg" alt="Proceso de limpieza de filtros de aire acondicionado" class="article-image">
        <ul>
          <li><strong>Frecuencia:</strong> Cada 2-4 semanas en temporada alta</li>
          <li><strong>Impacto:</strong> Filtros sucios aumentan consumo 15-25%</li>
          <li><strong>Proceso:</strong> Agua tibia + jabón neutro, secar completamente</li>
        </ul>

        <h4>Revisión del Condensador Exterior</h4>
        <ul>
          <li><strong>Limpieza:</strong> Retira hojas, polvo y obstrucciones</li>
          <li><strong>Sombra:</strong> Protege de sol directo si es posible</li>
          <li><strong>Espacio libre:</strong> Mantén 60cm mínimo alrededor</li>
        </ul>

        <h3>🏡 Aislamiento Térmico: La Base de la Eficiencia</h3>

        <h4>Puntos Críticos de Pérdida de Frío</h4>
        <div class="inspection-grid">
          <div class="zone">
            <strong>🚪 Puertas y Ventanas:</strong> 30-40% de pérdidas. Revisa sellos y empaques.
          </div>
          <div class="zone">
            <strong>🏠 Techo:</strong> 25% de pérdidas. Aislamiento térmico o pintura reflectiva.
          </div>
          <div class="zone">
            <strong>🧱 Paredes:</strong> 20% de pérdidas. Cortinas térmicas en ventanas principales.
          </div>
        </div>

        <h4>Soluciones de Bajo Costo</h4>
        <ul>
          <li><strong>Película reflectiva en ventanas:</strong> $200 MXN, 20% menos calor</li>
          <li><strong>Cortinas térmicas:</strong> $500 MXN, 15% menos consumo</li>
          <li><strong>Selladores de puertas:</strong> $100 MXN, 10% ahorro</li>
          <li><strong>Plantas en exterior:</strong> Gratis, 5-8% reducción de temperatura</li>
        </ul>

        <h3>🌞 Calefacción Eficiente (Temporada Fría)</h3>

        <h4>Bomba de Calor vs. Resistencias Eléctricas</h4>
        <img src="https://www.geinor.com/wp-content/uploads/2021/12/bombas-de-calor-aerotermia.jpg" alt="Sistema de bomba de calor para calefacción eficiente" class="article-image">
        <div class="savings-table">
          <p><strong>Resistencia eléctrica:</strong> Eficiencia 95% - $2,000 MXN/mes</p>
          <p><strong>Bomba de calor:</strong> Eficiencia 300% - $700 MXN/mes</p>
          <p class="total"><strong>Ahorro con bomba de calor: 65%</strong></p>
        </div>

        <h4>Estrategias de Calefacción Inteligente</h4>
        <ul>
          <li><strong>Calefacción por zonas:</strong> Solo calienta áreas ocupadas</li>
          <li><strong>Programación:</strong> Reduce temperatura 3-5°C cuando no estés</li>
          <li><strong>Ropa apropiada:</strong> Vestirse bien permite 2°C menos en termostato</li>
        </ul>

        <h3>📱 Tecnología Inteligente</h3>

        <h4>Termostatos Programables</h4>
        <div class="tip-box">
          <h4>🤖 Automatización Inteligente</h4>
          <p>Termostatos WiFi aprenden tus horarios y ajustan temperatura automáticamente. Ahorro promedio: 15-20%.</p>
        </div>

        <h4>Sensores de Ocupación</h4>
        <ul>
          <li><strong>Detección de presencia:</strong> A/C se ajusta según ocupación</li>
          <li><strong>Apagado automático:</strong> Sin desperdicio en áreas vacías</li>
          <li><strong>ROI:</strong> Se paga solo en 1-2 años</li>
        </ul>

        <h3>💰 Plan de Ahorro Gradual</h3>
        <div class="impact-calculator">
          <p><strong>Mes 1 - Optimización básica:</strong> $300 MXN ahorro</p>
          <p><strong>Mes 2 - Mantenimiento:</strong> $450 MXN ahorro</p>
          <p><strong>Mes 3 - Aislamiento básico:</strong> $600 MXN ahorro</p>
          <p><strong>Mes 6 - Ventiladores apoyo:</strong> $750 MXN ahorro</p>
          <p class="total"><strong>Ahorro anual proyectado: $7,200 MXN</strong></p>
        </div>

        <div class="action-box">
          <h4>🎯 Plan de Acción Inmediata</h4>
          <p>Esta semana: Ajusta termostato a 25°C, limpia filtros, cierra habitaciones no usadas. El próximo mes: Evalúa aislamiento térmico y ventilación natural.</p>
        </div>
      </div>
    `,
    category: 'electricidad',
    imageUrl: 'https://img.construnario.com/notiweb/noticias_imagenes/42000/42940_1.jpg?tr=w-1000,h-1000,c-at_max',
    readingTime: 1,
    tags: ['aire acondicionado', 'climatización', 'eficiencia térmica', 'ahorro energético'],
    publishDate: new Date('2025-01-10'),
    featured: true
  }
];

// Exportar también una función helper para obtener artículos por categoría
export const getElectricityArticles = (): EducationArticle[] => {
  return electricityEducationArticles;
};

// Función para obtener un artículo específico por slug
export const getElectricityArticleBySlug = (slug: string): EducationArticle | undefined => {
  return electricityEducationArticles.find(article => article.slug === slug);
};
