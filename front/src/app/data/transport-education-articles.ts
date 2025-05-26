// front/src/app/data/transport-education-articles.ts

import { EducationArticle } from '../models/education.model';

export const transportEducationArticles: EducationArticle[] = [
  {
    id: 'transporte-001',
    slug: 'transporte-publico-movilidad-sostenible-mexico',
    title: 'Transporte Público: Tu Aliado para una Movilidad Sostenible y Económica',
    summary: 'Descubre cómo el transporte público puede reducir tu huella de carbono hasta 90% mientras ahorras miles de pesos al año.',
    content: `
      <div class="article-content">
        <img src="https://www.capital21.cdmx.gob.mx/noticias/wp-content/uploads/2023/01/Linea12-MetroCDMX-001.jpg" alt="Sistema de metro CDMX" class="article-image-main">

        <h3>🌍 El Impacto Real del Transporte Público</h3>
        <p>Un autobús puede transportar <strong>40 veces más personas que un auto</strong> usando solo 2.5 veces más combustible. Elegir transporte público en lugar de auto particular <strong>reduce tu huella de carbono personal hasta 90%</strong> en desplazamientos urbanos.</p>

        <div class="alert-box">
          <h4>📊 Dato Impactante</h4>
          <p>En Ciudad de México, el Metro transporta 5.5 millones de personas diarias con emisiones per cápita 95% menores que el auto particular.</p>
        </div>

        <h3>💰 Ahorro Económico Dramático</h3>
        <img src="https://preview.redd.it/s85hd18klt061.png?auto=webp&s=772b0e66828bd7755298570f5fe945e395f3faf6" alt="Comparativa entre auto particular y transporte público" class="article-image">

        <div class="savings-table">
          <h4>Costo mensual de movilidad (30 km diarios promedio):</h4>
          <p><strong>Auto particular:</strong> $4,500 MXN (gasolina + mantenimiento + seguros)</p>
          <p><strong>Transporte público mixto:</strong> $800 MXN (Metro + autobús + ocasional Uber)</p>
          <p><strong>Solo transporte público:</strong> $400 MXN (Metro + autobús + Metrobús)</p>
          <p class="total"><strong>Ahorro anual: hasta $49,200 MXN</strong></p>
        </div>

        <h3>🚇 Sistemas de Transporte Masivo en México</h3>

        <h4>Metro y Tren Ligero</h4>
        <ul>
          <li><strong>Eficiencia energética:</strong> 95% menos emisiones por pasajero vs. auto</li>
          <li><strong>Velocidad:</strong> Evita tráfico, tiempos predecibles</li>
          <li><strong>Costo:</strong> $5 MXN por viaje, distancia ilimitada</li>
          <li><strong>Cobertura:</strong> 226 estaciones en CDMX, expansión constante</li>
        </ul>

        <h4>Metrobús y BRT</h4>
        <img src="https://www.metrobus.cdmx.gob.mx/storage/app/media/L5%20buses%20electricos/IMG-20230629-WA0006.jpg" alt="Estación de Metrobús con autobuses articulados" class="article-image">
        <ul>
          <li><strong>Carriles exclusivos:</strong> Velocidad promedio 18 km/h vs. 8 km/h en tráfico</li>
          <li><strong>Autobuses articulados:</strong> Capacidad de 160 pasajeros</li>
          <li><strong>Integración:</strong> Conexión con Metro y otros sistemas</li>
          <li><strong>Cobertura:</strong> 7 líneas, 600+ estaciones</li>
        </ul>

        <h4>Autobuses Urbanos</h4>
        <ul>
          <li><strong>Red Integral de Transporte (RIT):</strong> Rutas optimizadas</li>
          <li><strong>Tecnología GPS:</strong> Apps para tiempo real de llegadas</li>
          <li><strong>Modernización:</strong> Flotilla con tecnología Euro VI</li>
          <li><strong>Costo:</strong> $2-6 MXN según ciudad y distancia</li>
        </ul>

        <h3>📱 Tecnología para Optimizar tu Experiencia</h3>

        <h4>Apps Esenciales de Transporte</h4>
        <div class="tip-box">
          <h4>📲 Apps Recomendadas</h4>
          <ul>
            <li><strong>Moovit:</strong> Rutas multimodales en tiempo real</li>
            <li><strong>Citymapper:</strong> Navegación inteligente urbana</li>
            <li><strong>Mi Transporte:</strong> Info oficial de sistemas locales</li>
          </ul>
        </div>

        <h4>Sistemas de Pago Digital</h4>
        <ul>
          <li><strong>Tarjetas inteligentes:</strong> CDMX Movilidad Integrada</li>
          <li><strong>Pago móvil:</strong> QR codes y NFC en nuevos sistemas</li>
          <li><strong>Recarga automática:</strong> Evita filas y quedarte sin saldo</li>
        </ul>

        <h3>🚴 Integración con Movilidad Activa</h3>

        <h4>Bicicleta + Transporte Público</h4>
        <img src="https://gobierno.cdmx.gob.mx/biciestaciona/" alt="Estacionamiento de bicicletas en estación de metro" class="article-image">
        <p>La combinación <strong>bicicleta + transporte público</strong> es la forma más eficiente de movilidad urbana:</p>

        <ul>
          <li><strong>Primeros/últimos kilómetros:</strong> Bici para llegar a estaciones</li>
          <li><strong>Biciestacionamientos:</strong> Seguros en estaciones principales</li>
          <li><strong>Sistemas integrados:</strong> EcoBici conecta con Metro/Metrobús</li>
          <li><strong>Flexibilidad total:</strong> Combina según necesidades diarias</li>
        </ul>

        <h4>Estrategia de Movilidad Multimodal</h4>
        <div class="action-box">
          <h4>🎯 Plan Semanal Inteligente</h4>
          <ul>
            <li><strong>Lunes-Viernes:</strong> Metro/Metrobús para trabajo (rutas fijas)</li>
            <li><strong>Distancias cortas:</strong> Caminar o bicicleta (menos de 2 km)</li>
            <li><strong>Fines de semana:</strong> Combinar transporte público + bicicleta</li>
            <li><strong>Emergencias:</strong> Uber/taxi solo cuando sea necesario</li>
          </ul>
        </div>

        <h3>🌟 Beneficios Adicionales del Transporte Público</h3>

        <h4>Tiempo Productivo</h4>
        <ul>
          <li><strong>Lectura y estudio:</strong> 2 horas diarias de tiempo "recuperado"</li>
          <li><strong>Trabajo remoto:</strong> WiFi en sistemas modernos</li>
          <li><strong>Descanso:</strong> Menos estrés que manejar en tráfico</li>
          <li><strong>Socialización:</strong> Interacción humana vs. aislamiento vehicular</li>
        </ul>

        <h4>Salud y Bienestar</h4>
        <div class="tip-box">
          <h4>💪 Beneficio Oculto</h4>
          <p>Usuarios de transporte público caminan promedio 8,000 pasos más al día que usuarios de auto particular.</p>
        </div>

        <h4>Desarrollo Urbano Sostenible</h4>
        <ul>
          <li><strong>Menos congestión:</strong> Cada usuario reduce tráfico para todos</li>
          <li><strong>Aire más limpio:</strong> Menos emisiones urbanas</li>
          <li><strong>Espacios verdes:</strong> Menos estacionamientos = más parques</li>
          <li><strong>Comunidades conectadas:</strong> Desarrollo orientado al transporte</li>
        </ul>

        <h3>🚶 Caminabilidad y Conectividad</h3>

        <h4>Diseño de Rutas Inteligentes</h4>
        <img src="https://www.metrobus.cdmx.gob.mx/storage/app/media/uploaded-files/foto_AccesoEstacion_2.jpg" alt="Estación de transporte con accesos peatonales seguros y señalización" class="article-image">

        <div class="inspection-grid">
          <div class="zone">
            <strong>🚶 Primera/Última Milla:</strong> Planifica rutas caminables seguras hacia estaciones.
          </div>
          <div class="zone">
            <strong>🌦️ Protección Climática:</strong> Considera cubierta para lluvia y sombra.
          </div>
          <div class="zone">
            <strong>🔒 Seguridad:</strong> Elige rutas bien iluminadas y con vigilancia.
          </div>
        </div>

        <h3>📈 Planificación Estratégica Personal</h3>

        <h4>Análisis de Rutas Habituales</h4>
        <ol>
          <li><strong>Mapea tus destinos frecuentes</strong> (trabajo, escuela, compras)</li>
          <li><strong>Identifica estaciones cercanas</strong> usando apps de transporte</li>
          <li><strong>Calcula tiempos reales</strong> incluyendo caminatas y transbordos</li>
          <li><strong>Compara costos totales</strong> vs. auto particular mensualmente</li>
        </ol>

        <h4>Estrategias por Horario</h4>
        <div class="habit-grid">
          <div class="habit-item">
            <strong>Horas Pico (7-9, 18-20):</strong> Usa rutas principales, evita transbordos complejos
          </div>
          <div class="habit-item">
            <strong>Horas Valle:</strong> Explora rutas alternativas, mayor comodidad y rapidez
          </div>
        </div>

        <h3>🔄 Transición Gradual del Auto</h3>

        <h4>Plan de Migración de 30 Días</h4>
        <div class="action-box">
          <h4>📅 Cronograma de Transición</h4>
          <p><strong>Semana 1:</strong> Usa transporte público 2 días/semana para rutas conocidas</p>
          <p><strong>Semana 2:</strong> Aumenta a 3 días, explora apps y rutas alternativas</p>
          <p><strong>Semana 3:</strong> 4 días usando transporte público, optimiza rutinas</p>
          <p><strong>Semana 4:</strong> 5 días completos, evalúa vender/compartir auto</p>
        </div>

        <h4>Manejo de Objeciones Comunes</h4>
        <ul>
          <li><strong>"Es muy lento":</strong> Cuenta tiempo de puerta a puerta, incluye estacionamiento</li>
          <li><strong>"Es incómodo":</strong> Prueba diferentes horarios y rutas</li>
          <li><strong>"No es seguro":</strong> Mantente alerta, evita mostrar objetos de valor</li>
          <li><strong>"No llega a mi destino":</strong> Combina con bicicleta o caminata corta</li>
        </ul>

        <h3>💰 Cálculo de Retorno de Inversión</h3>
        <div class="impact-calculator">
          <p><strong>Ahorro mensual promedio:</strong> $3,700 MXN</p>
          <p><strong>Ahorro anual:</strong> $44,400 MXN</p>
          <p><strong>Reducción CO2:</strong> 2.4 toneladas anuales</p>
          <p><strong>Tiempo productivo ganado:</strong> 500 horas anuales</p>
          <p class="total"><strong>Valor total del cambio: $100,000+ MXN anuales</strong></p>
        </div>

        <h3>🌱 Impacto Ambiental Positivo</h3>
        <ul>
          <li><strong>Reducción de emisiones:</strong> 2.4 ton CO2/año por persona</li>
          <li><strong>Menos contaminación del aire:</strong> Mejor calidad del aire urbano</li>
          <li><strong>Ruido reducido:</strong> Ciudades más silenciosas y vivibles</li>
          <li><strong>Eficiencia energética:</strong> 10x más eficiente que auto particular</li>
        </ul>

        <div class="action-box">
          <h4>🎯 Plan de Acción Esta Semana</h4>
          <p>Descarga apps de transporte, identifica la estación más cercana a tu casa y trabajo. Prueba una ruta completa en transporte público este fin de semana.</p>
        </div>
      </div>
    `,
    category: 'transporte',
    imageUrl: 'https://periodicoelorigen.com/wp-content/uploads/2021/03/TRANSPORTE-PUBLCO.jpg',
    readingTime: 1,
    tags: ['transporte público', 'movilidad sostenible', 'ahorro económico', 'metro'],
    publishDate: new Date('2025-01-18'),
    featured: true
  },

  {
    id: 'transporte-002',
    slug: 'bicicleta-movilidad-activa-ciudades-sustentables',
    title: 'Revolución sobre Ruedas: La Bicicleta como Motor del Cambio Urbano',
    summary: 'La bicicleta no solo es transporte ecológico, es una revolución urbana que mejora tu salud, economía y calidad de vida.',
    content: `
      <div class="article-content">
        <img src="https://img.lajornadamaya.mx/69331616890440vb1.jpeg" alt="Ciclistas en ciclovía moderna con infraestructura segura" class="article-image-main">

        <h3>🚴 La Bicicleta: Más que Transporte, una Revolución</h3>
        <p>La bicicleta es <strong>el vehículo más eficiente jamás inventado</strong>. Con solo 100 calorías puedes recorrer 5 kilómetros, equivalente a la energía de una cucharada de azúcar. <strong>Es 50 veces más eficiente</strong> energéticamente que un auto.</p>

        <div class="tip-box">
          <h4>⚡ Eficiencia Asombrosa</h4>
          <p>Un ciclista promedio consume 35 calorías por kilómetro. Un auto consume el equivalente energético de 1,800 calorías por kilómetro transportando una persona.</p>
        </div>

        <h3>💪 Beneficios para la Salud</h3>
        <img src="https://blog.parquedelapaz.com/hubfs/pexels-daniel-frank-2248713.jpg" alt="Persona en bicicleta con indicadores de beneficios para la salud" class="article-image">

        <h4>Transformación Física Comprobada</h4>
        <ul>
          <li><strong>Ejercicio cardiovascular:</strong> 30 min diarios = 150 min semanales recomendados OMS</li>
          <li><strong>Quema calórica:</strong> 400-600 calorías/hora según intensidad</li>
          <li><strong>Fortalecimiento muscular:</strong> Piernas, core y glúteos sin impacto</li>
          <li><strong>Mejora respiratoria:</strong> Aumento de capacidad pulmonar 15-20%</li>
        </ul>

        <h4>Beneficios Mentales y Cognitivos</h4>
        <div class="action-box">
          <h4>🧠 Ciencia del Bienestar</h4>
          <p>Estudios muestran que ciclistas urbanos reportan 40% menos estrés y 25% mejor estado de ánimo que conductores de auto.</p>
        </div>

        <ul>
          <li><strong>Reducción del estrés:</strong> Liberación de endorfinas naturales</li>
          <li><strong>Mejor concentración:</strong> Oxigenación cerebral mejorada</li>
          <li><strong>Calidad de sueño:</strong> Ejercicio regular mejora descanso nocturno</li>
          <li><strong>Autoestima:</strong> Logros físicos y autonomía de movilidad</li>
        </ul>

        <h3>💰 Impacto Económico Personal</h3>

        <h4>Costo Total de Propiedad: Bicicleta vs. Auto</h4>
        <div class="savings-table">
          <p><strong>Bicicleta de calidad (10 años):</strong></p>
          <p>• Compra inicial: $8,000 MXN</p>
          <p>• Mantenimiento anual: $500 MXN</p>
          <p>• Accesorios y mejoras: $2,000 MXN total</p>
          <p>• <strong>Costo total 10 años: $15,000 MXN</strong></p>

          <p><strong>Auto económico (10 años):</strong></p>
          <p>• Compra inicial: $250,000 MXN</p>
          <p>• Combustible anual: $18,000 MXN</p>
          <p>• Mantenimiento anual: $8,000 MXN</p>
          <p>• Seguros anuales: $6,000 MXN</p>
          <p>• Depreciación: $150,000 MXN</p>
          <p>• <strong>Costo total 10 años: $720,000 MXN</strong></p>

          <p class="total"><strong>Ahorro con bicicleta: $705,000 MXN en 10 años</strong></p>
        </div>

        <h3>🚲 Tipos de Bicicletas para Ciudad</h3>

        <h4>Bicicleta Urbana/Holandesa</h4>
        <img src="https://cdn.shopify.com/s/files/1/0023/2190/7785/files/bicicleta_urbana_rodada_24_7_velocidades_magenta_loving_monk_lateral_1_480x480.jpg?v=1608239333" alt="Bicicleta urbana estilo holandés con canasta y guardabarros" class="article-image">
        <ul>
          <li><strong>Características:</strong> Posición erguida, guardabarros, canasta</li>
          <li><strong>Ideal para:</strong> Trayectos cortos, vestimenta formal, compras</li>
          <li><strong>Ventajas:</strong> Comodidad, bajo mantenimiento, elegante</li>
          <li><strong>Precio:</strong> $4,000-12,000 MXN</li>
        </ul>

        <h4>Bicicleta Híbrida</h4>
        <ul>
          <li><strong>Características:</strong> Mezcla de urbana y deportiva</li>
          <li><strong>Ideal para:</strong> Distancias medias (5-15 km), versatilidad</li>
          <li><strong>Ventajas:</strong> Velocidad + comodidad, múltiples usos</li>
          <li><strong>Precio:</strong> $6,000-20,000 MXN</li>
        </ul>

        <h4>Bicicleta Eléctrica</h4>
        <ul>
          <li><strong>Características:</strong> Motor eléctrico de asistencia</li>
          <li><strong>Ideal para:</strong> Distancias largas, pendientes, cualquier edad</li>
          <li><strong>Ventajas:</strong> Llegar sin sudar, superar limitaciones físicas</li>
          <li><strong>Precio:</strong> $15,000-50,000 MXN</li>
        </ul>

        <h3>🛡️ Seguridad y Equipamiento Esencial</h3>

        <h4>Equipo de Protección Básico</h4>
        <div class="inspection-grid">
          <div class="zone">
            <strong>🪖 Casco:</strong> Reduce riesgo de lesión grave en 70%. Obligatorio para tu seguridad.
          </div>
          <div class="zone">
            <strong>💡 Luces:</strong> Frontal blanca y trasera roja. Esenciales para visibilidad nocturna.
          </div>
          <div class="zone">
            <strong>🔒 Candado:</strong> U-lock de calidad. Invierte 10% del valor de tu bici en seguridad.
          </div>
        </div>

        <h4>Vestimenta y Accesorios</h4>
        <ul>
          <li><strong>Ropa reflectante:</strong> Chaleco o banda reflectiva para mayor visibilidad</li>
          <li><strong>Guantes:</strong> Mejor agarre y protección en caídas</li>
          <li><strong>Gafas de protección:</strong> Contra polvo, insectos y viento</li>
          <li><strong>Alforjas/canasta:</strong> Para transportar objetos sin afectar equilibrio</li>
        </ul>

        <h3>🗺️ Navegación y Rutas Inteligentes</h3>

        <h4>Apps Especializadas para Ciclistas</h4>
        <div class="tip-box">
          <h4>📱 Apps Recomendadas</h4>
          <ul>
            <li><strong>Strava:</strong> Tracking, rutas populares, comunidad</li>
            <li><strong>Komoot:</strong> Planificación de rutas detallada</li>
            <li><strong>Google Maps:</strong> Modo bicicleta con ciclovías</li>
            <li><strong>EcoBici (CDMX):</strong> Sistema de bicicletas públicas</li>
          </ul>
        </div>

        <h4>Estrategias de Ruta Urbana</h4>
        <img src="https://multisenal.com.mx/wp-content/uploads/2024/05/segregada-1024x462.webp" alt="Ciclovía protegida con separación física del tráfico vehicular" class="article-image">
        <ul>
          <li><strong>Prioriza ciclovías:</strong> Aunque sea ruta más larga, es más segura</li>
          <li><strong>Calles secundarias:</strong> Menos tráfico = mayor seguridad</li>
          <li><strong>Evita horas pico:</strong> Sal 15 min antes para rutas tranquilas</li>
          <li><strong>Ruta de respaldo:</strong> Siempre ten plan B por clima o cierre</li>
        </ul>

        <h3>🔧 Mantenimiento Básico</h3>

        <h4>Revisión Semanal (5 minutos)</h4>
        <ol>
          <li><strong>Presión de llantas:</strong> Revisa con medidor, infla según especificación</li>
          <li><strong>Frenos:</strong> Prueba que respondan antes de cada salida</li>
          <li><strong>Cadena:</strong> Debe estar lubricada y sin óxido</li>
          <li><strong>Luces:</strong> Verifica que funcionen y tengan batería</li>
        </ol>

        <h4>Mantenimiento Mensual</h4>
        <ul>
          <li><strong>Limpieza general:</strong> Agua, jabón y cepillo suave</li>
          <li><strong>Lubricación de cadena:</strong> Aceite específico para bicicletas</li>
          <li><strong>Ajuste de frenos:</strong> Asegurar respuesta óptima</li>
          <li><strong>Revisión de tornillos:</strong> Verificar que estén apretados</li>
        </ul>

        <div class="action-box">
          <h4>🛠️ Kit de Herramientas Básico</h4>
          <p>Llaves allen, bomba portátil, kit de parches, lubricante de cadena. Inversión: $800 MXN, ahorro en mecánico: $3,000+ MXN anuales.</p>
        </div>

        <h3>🌆 Integración con Sistemas Urbanos</h3>

        <h4>Bicicletas Públicas</h4>
        <ul>
          <li><strong>EcoBici (CDMX):</strong> 480+ estaciones, $461 MXN anuales</li>
          <li><strong>MiBici (Guadalajara):</strong> 242 estaciones, $365 MXN anuales</li>
          <li><strong>Pobla Bike (Puebla):</strong> 80 estaciones integradas con transporte</li>
        </ul>

        <h4>Intermodalidad Inteligente</h4>
        <div class="habit-grid">
          <div class="habit-item">
            <strong>Bici + Metro:</strong> Bicicleta plegable en vagones permitidos (horarios específicos)
          </div>
          <div class="habit-item">
            <strong>Bici + Oficina:</strong> Estacionamientos seguros, vestidores, duchas disponibles
          </div>
        </div>

        <h3>🌍 Impacto Ambiental Transformador</h3>

        <h4>Huella de Carbono</h4>
        <div class="impact-calculator">
          <p><strong>Auto 10 km diarios:</strong> 1.2 ton CO2/año</p>
          <p><strong>Bicicleta 10 km diarios:</strong> 0.05 ton CO2/año (fabricación)</p>
          <p><strong>Reducción neta:</strong> 1.15 ton CO2/año = 95% menos emisiones</p>
          <p class="total"><strong>Equivale a plantar 26 árboles anuales</strong></p>
        </div>

        <h4>Beneficios Urbanos Colectivos</h4>
        <ul>
          <li><strong>Menos congestión:</strong> Una bici ocupa espacio de 0.1 autos</li>
          <li><strong>Aire más limpio:</strong> Cero emisiones locales</li>
          <li><strong>Menos ruido:</strong> Ciudades más silenciosas y vivibles</li>
          <li><strong>Espacios liberados:</strong> Menos estacionamientos = más áreas verdes</li>
        </ul>

        <h3>👥 Construyendo Comunidad Ciclista</h3>

        <h4>Grupos y Eventos</h4>
        <img src="https://almomento.mx/wp-content/uploads/2022/09/Paseo-dominical-CDMX.jpeg" alt="Grupo de ciclistas urbanos en rodada dominical" class="article-image">
        <ul>
          <li><strong>Rodadas familiares:</strong> Domingos sin coches, eventos masivos</li>
          <li><strong>Grupos de trabajo:</strong> Organiza con compañeros para ir juntos</li>
          <li><strong>Clubes locales:</strong> Conecta con comunidad ciclista de tu zona</li>
          <li><strong>Advocacy:</strong> Participa en promover infraestructura ciclista</li>
        </ul>

        <div class="action-box">
          <h4>🎯 Tu Primer Mes en Bicicleta</h4>
          <p>Semana 1: Compra/renta bici y equipo básico. Semana 2: Practica rutas cortas fin de semana. Semana 3: Un día laboral en bici. Semana 4: Tres días semanales, evalúa rutina.</p>
        </div>
      </div>
    `,
    category: 'transporte',
    imageUrl: 'https://media.gq.com.mx/photos/66258cfeea8c4e44c447b630/3:2/w_3000,h_2000,c_limit/hombre%20en%20bici%20en%20un%20parque.jpg',
    readingTime: 1,
    tags: ['bicicleta', 'ciclismo urbano', 'movilidad activa', 'salud'],
    publishDate: new Date('2025-01-12'),
    featured: true
  },

  {
    id: 'transporte-003',
    slug: 'vehiculos-electricos-hibridos-futuro-movilidad-limpia',
    title: 'Revolución Eléctrica: Vehículos del Futuro que Puedes Tener Hoy',
    summary: 'Los vehículos eléctricos e híbridos no son el futuro, son el presente. Descubre cómo pueden transformar tu movilidad y economía.',
    content: `
      <div class="article-content">
        <img src="https://cdn.shortpixel.ai/spai/w_840+q_lossy+ret_img+to_webp/zacua.com/wp-content/uploads/2025/03/ZB67-estaciones-de-carga-zacua.jpg" alt="Estación de carga para vehículos eléctricos con autos modernos" class="article-image-main">

        <h3>⚡ La Revolución Eléctrica ya Llegó</h3>
        <p>Los vehículos eléctricos (VE) han alcanzado <strong>paridad de costos con vehículos convencionales</strong> en muchos mercados. En 2024, el costo por kilómetro de un VE es <strong>70% menor</strong> que un auto de gasolina en México.</p>

        <div class="alert-box">
          <h4>🔋 Punto de Inflexión</h4>
          <p>En 2024, los VE representan 15% de ventas globales. Para 2030, se proyecta que será 50%. México ya tiene más de 100,000 vehículos eléctricos circulando.</p>
        </div>

        <h3>💡 Tipos de Vehículos de Nueva Generación</h3>

        <h4>Vehículos Eléctricos Puros (BEV)</h4>
        <img src="https://s1.elespanol.com/2022/09/21/omicrono/tecnologia/704940211_227372882_1024x576.jpg" alt="Vehículo eléctrico puro conectado a estación de carga" class="article-image">
        <ul>
          <li><strong>Propulsión:</strong> 100% eléctrica, cero emisiones locales</li>
          <li><strong>Autonomía:</strong> 200-500 km por carga según modelo</li>
          <li><strong>Carga:</strong> Casa (6-8 horas) o rápida (30-60 min)</li>
          <li><strong>Ejemplos:</strong> Nissan Leaf, Tesla Model 3, BYD Dolphin</li>
          <li><strong>Precio:</strong> $450,000-1,200,000 MXN</li>
        </ul>

        <h4>Vehículos Híbridos (HEV)</h4>
        <ul>
          <li><strong>Propulsión:</strong> Motor gasolina + eléctrico, sin enchufe</li>
          <li><strong>Eficiencia:</strong> 40-50% menos combustible que convencional</li>
          <li><strong>Autonomía:</strong> 800-1000 km con tanque lleno</li>
          <li><strong>Ejemplos:</strong> Toyota Prius, Honda Insight, Ford Fusion Hybrid</li>
          <li><strong>Precio:</strong> $350,000-700,000 MXN</li>
        </ul>

        <h4>Híbridos Enchufables (PHEV)</h4>
        <ul>
          <li><strong>Propulsión:</strong> Eléctrico + gasolina, carga externa</li>
          <li><strong>Modo eléctrico:</strong> 30-80 km sin usar gasolina</li>
          <li><strong>Versatilidad:</strong> Eléctrico ciudad, gasolina carretera</li>
          <li><strong>Ejemplos:</strong> Toyota Prius Prime, Mitsubishi Outlander PHEV</li>
          <li><strong>Precio:</strong> $500,000-900,000 MXN</li>
        </ul>

        <h3>💰 Análisis Económico Real</h3>

        <h4>Costo Total de Propiedad (5 años)</h4>
        <div class="savings-table">
          <p><strong>Vehículo Gasolina Compacto:</strong></p>
          <p>• Precio inicial: $300,000 MXN</p>
          <p>• Combustible (20,000 km/año): $90,000 MXN</p>
          <p>• Mantenimiento: $45,000 MXN</p>
          <p>• Seguro: $30,000 MXN</p>
          <p>• <strong>Total 5 años: $465,000 MXN</strong></p>

          <p><strong>Vehículo Eléctrico Equivalente:</strong></p>
          <p>• Precio inicial: $450,000 MXN</p>
          <p>• Electricidad (20,000 km/año): $27,000 MXN</p>
          <p>• Mantenimiento: $15,000 MXN</p>
          <p>• Seguro: $25,000 MXN</p>
          <p>• <strong>Total 5 años: $517,000 MXN</strong></p>

          <p class="total"><strong>Diferencia: $52,000 MXN más costoso el VE</strong></p>
          <p><em>*Pero con incentivos fiscales, el VE puede ser más económico</em></p>
        </div>

        <h3>🔌 Infraestructura de Carga en México</h3>

        <h4>Red Nacional de Carga</h4>
        <img src="https://mexicoindustry.com/admin/images/notas/2024/11/SnLbNmv5jo61Ls5Lm2oLDsmFjZ07GTqbkecQXTqN.jpg" alt="Mapa de estaciones de carga para vehículos eléctricos en México" class="article-image">
        <ul>
          <li><strong>Estaciones públicas:</strong> 1,200+ puntos en todo el país</li>
          <li><strong>Carga rápida:</strong> 300+ estaciones DC de alta potencia</li>
          <li><strong>Centros comerciales:</strong> Walmart, Liverpool, Costco instalan cargadores</li>
          <li><strong>Hoteles:</strong> Cadenas premium ofrecen carga gratuita</li>
        </ul>

        <h4>Carga Domiciliaria</h4>
        <div class="tip-box">
          <h4>🏠 Carga en Casa</h4>
          <p>80% de cargas se realizan en casa. Una toma de 220V carga completamente un VE promedio en 6-8 horas durante la noche.</p>
        </div>

        <ul>
          <li><strong>Instalación básica:</strong> $8,000-15,000 MXN (toma 220V)</li>
          <li><strong>Cargador inteligente:</strong> $25,000-40,000 MXN</li>
          <li><strong>Costo por kWh:</strong> $2.50-4.50 MXN según tarifa CFE</li>
          <li><strong>Carga nocturna:</strong> Tarifas preferenciales disponibles</li>
        </ul>

        <h3>🌱 Impacto Ambiental Real</h3>

        <h4>Emisiones Ciclo de Vida Completo</h4>
        <div class="impact-calculator">
          <p><strong>Auto gasolina (fabricación + uso):</strong> 4.2 ton CO2/año</p>
          <p><strong>Auto eléctrico (fabricación + electricidad CFE):</strong> 1.8 ton CO2/año</p>
          <p><strong>Auto eléctrico + energía solar:</strong> 0.3 ton CO2/año</p>
          <p class="total"><strong>Reducción: 57-93% menos emisiones</strong></p>
        </div>

        <h4>Calidad del Aire Urbano</h4>
        <ul>
          <li><strong>Cero emisiones locales:</strong> No produce gases en punto de uso</li>
          <li><strong>Menor ruido:</strong> 50% menos contaminación acústica</li>
          <li><strong>Efecto multiplicador:</strong> Cada VE mejora aire para todos</li>
          <li><strong>Salud pública:</strong> Menos enfermedades respiratorias urbanas</li>
        </ul>

        <h3>🔧 Mantenimiento y Confiabilidad</h3>

        <h4>Ventajas de Mantenimiento VE</h4>
        <img src="https://media.licdn.com/dms/image/v2/C4D12AQEFnaQAoS7omg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1587369788505?e=2147483647&v=beta&t=QgbedwqK6VMKIPuWheeWJYdnsk6rumxiS-YbGjfVCXQ" alt="Comparación de componentes: motor eléctrico vs motor de combustión" class="article-image">
        <ul>
          <li><strong>Menos piezas móviles:</strong> Motor eléctrico tiene 20 piezas vs. 2,000 del motor gasolina</li>
          <li><strong>Sin cambios de aceite:</strong> Ahorro $3,000 MXN anuales</li>
          <li><strong>Frenos duran más:</strong> Frenado regenerativo reduce desgaste</li>
          <li><strong>Sin filtros:</strong> Aire, combustible, aceite no necesarios</li>
        </ul>

        <h4>Vida Útil de Baterías</h4>
        <div class="action-box">
          <h4>🔋 Realidad de las Baterías</h4>
          <p>Baterías modernas mantienen 80% capacidad después de 8 años/150,000 km. Garantías típicas: 8 años/160,000 km.</p>
        </div>

        <ul>
          <li><strong>Degradación normal:</strong> 2-3% anual en condiciones normales</li>
          <li><strong>Factores que afectan:</strong> Calor extremo, carga rápida constante</li>
          <li><strong>Reciclaje:</strong> 95% materiales recuperables</li>
          <li><strong>Segunda vida:</strong> Baterías usadas para almacenamiento estacionario</li>
        </ul>

        <h3>🚗 Consideraciones de Compra</h3>

        <h4>¿Estás Listo para un VE?</h4>
        <div class="inspection-grid">
          <div class="zone">
            <strong>🏠 Vivienda:</strong> ¿Tienes dónde instalar cargador domiciliario?
          </div>
          <div class="zone">
            <strong>🛣️ Uso Diario:</strong> ¿Recorres menos de 200 km diarios regularmente?
          </div>
          <div class="zone">
            <strong>🔌 Infraestructura:</strong> ¿Hay cargadores en tus rutas frecuentes?
          </div>
        </div>

        <h4>Perfil Ideal para VE</h4>
        <ul>
          <li><strong>Uso urbano/suburbano:</strong> 80% trayectos dentro de la ciudad</li>
          <li><strong>Rutinas predecibles:</strong> Casa-trabajo-casa con estacionamiento</li>
          <li><strong>Segundo auto:</strong> Para viajes largos ocasionales usar otro vehículo</li>
          <li><strong>Conciencia ambiental:</strong> Valorar beneficios más allá del económico</li>
        </ul>

        <h3>⚡ Vehículos Eléctricos Ligeros</h3>

        <h4>Scooters y Motocicletas Eléctricas</h4>
        <img src="https://i0.wp.com/kalot.com.mx/site/wp-content/uploads/2018/10/scooters-lime-mexico-cdmx.jpg?resize=800%2C500&ssl=1" alt="Scooter eléctrico moderno estacionado en área urbana" class="article-image">
        <ul>
          <li><strong>Precio accesible:</strong> $15,000-80,000 MXN</li>
          <li><strong>Autonomía:</strong> 50-150 km por carga</li>
          <li><strong>Carga fácil:</strong> Batería removible, carga en casa</li>
          <li><strong>Ideal para:</strong> Trayectos 5-30 km, entrega a domicilio</li>
        </ul>

        <h4>Patinetes y Bicicletas Eléctricas</h4>
        <ul>
          <li><strong>Micro-movilidad:</strong> Perfecta para últimos kilómetros</li>
          <li><strong>Sin licencia:</strong> Algunos modelos no requieren registro</li>
          <li><strong>Estacionamiento:</strong> Se guardan en casa u oficina</li>
          <li><strong>Combinación perfecta:</strong> Transporte público + VE ligero</li>
        </ul>

        <h3>🏛️ Incentivos y Políticas Públicas</h3>

        <h4>Beneficios Fiscales Actuales</h4>
        <div class="tip-box">
          <h4>💸 Incentivos Disponibles</h4>
          <ul>
            <li><strong>Deducción de impuestos:</strong> 100% deducible para empresas</li>
            <li><strong>No verificación:</strong> Exento en Ciudad de México</li>
            <li><strong>Hoy No Circula:</strong> Exento permanentemente</li>
            <li><strong>Estacionamiento:</strong> Gratuito en algunos centros comerciales</li>
          </ul>
        </div>

        <h4>Programas de Financiamiento</h4>
        <ul>
          <li><strong>Bancos especializados:</strong> Créditos preferenciales para VE</li>
          <li><strong>Leasing:</strong> Renta con opción a compra</li>
          <li><strong>Programas gubernamentales:</strong> Apoyos para taxis y fleets</li>
        </ul>

        <h3>🔮 Futuro de la Movilidad Eléctrica</h3>

        <h4>Tendencias 2025-2030</h4>
        <ul>
          <li><strong>Precios:</strong> Paridad total con gasolina para 2027</li>
          <li><strong>Autonomía:</strong> 600+ km estándar en nuevos modelos</li>
          <li><strong>Carga ultra-rápida:</strong> 10-80% en 10 minutos</li>
          <li><strong>Baterías sólidas:</strong> Mayor densidad, carga más rápida</li>
        </ul>

        <h4>Infraestructura Nacional</h4>
        <div class="action-box">
          <h4>📈 Proyección 2030</h4>
          <p>México planea 10,000+ estaciones de carga pública y 2 millones de VE circulando para 2030.</p>
        </div>

        <h3>🛣️ Planificación de Viajes con VE</h3>

        <h4>Apps Esenciales</h4>
        <ul>
          <li><strong>PlugShare:</strong> Mapa global de cargadores con reseñas</li>
          <li><strong>Electromaps:</strong> Navegación optimizada para VE</li>
          <li><strong>ChargePoint:</strong> Red de carga con reservación</li>
          <li><strong>Tesla Supercharger:</strong> Red exclusiva pero expandiéndose</li>
        </ul>

        <h4>Estrategias de Viaje Largo</h4>
        <ol>
          <li><strong>Planifica con buffer:</strong> 20% reserva de batería</li>
          <li><strong>Identifica cargadores backup:</strong> Alternativas en ruta</li>
          <li><strong>Aprovecha tiempos de carga:</strong> Comidas, descansos</li>
          <li><strong>Precarga en destino:</strong> Verifica disponibilidad antes</li>
        </ol>

        <h3>💡 Consejos para Maximizar Eficiencia</h3>

        <h4>Técnicas de Conducción Eficiente</h4>
        <ul>
          <li><strong>One-pedal driving:</strong> Usa frenado regenerativo máximo</li>
          <li><strong>Precalentamiento:</strong> Acondiciona batería antes de salir</li>
          <li><strong>Eco mode:</strong> Maximiza autonomía en ciudad</li>
          <li><strong>Planificación de ruta:</strong> Evita pendientes innecesarias</li>
        </ul>

        <div class="impact-calculator">
          <p><strong>Ahorro anual vs. gasolina:</strong> $63,000 MXN</p>
          <p><strong>Reducción CO2:</strong> 2.4 toneladas anuales</p>
          <p><strong>Mantenimiento ahorrado:</strong> $8,000 MXN anuales</p>
          <p><strong>Tiempo en gasolineras:</strong> 0 horas (carga en casa)</p>
          <p class="total"><strong>Valor total del cambio: $71,000+ MXN anuales</strong></p>
        </div>

        <div class="action-box">
          <h4>🎯 Tu Ruta hacia la Movilidad Eléctrica</h4>
          <p>Evalúa tus patrones de manejo esta semana. Prueba manejo un VE en concesionaria. Calcula instalación de cargador en casa. Considera híbrido como transición.</p>
        </div>
      </div>
    `,
    category: 'transporte',
    imageUrl: 'https://wieck-nissanao-production.s3.amazonaws.com/photos/50c8ec09fd1760b72a1296024674ee837d95e207/preview-928x522.jpg',
    readingTime: 1,
    tags: ['vehículos eléctricos', 'movilidad limpia', 'tecnología', 'sostenibilidad'],
    publishDate: new Date('2025-01-08'),
    featured: true
  }
];

// Exportar también una función helper para obtener artículos por categoría
export const getTransportArticles = (): EducationArticle[] => {
  return transportEducationArticles;
};

// Función para obtener un artículo específico por slug
export const getTransportArticleBySlug = (slug: string): EducationArticle | undefined => {
  return transportEducationArticles.find(article => article.slug === slug);
};
