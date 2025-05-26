// front/src/app/data/water-education-articles.ts

import { EducationArticle } from '../models/education.model';

export const waterEducationArticles: EducationArticle[] = [
  {
    id: 'agua-001',
    slug: 'dispositivos-ahorradores-agua',
    title: 'Dispositivos Ahorradores: Tu Primer Paso hacia el Consumo Inteligente',
    summary: 'Descubre los dispositivos simples y económicos que pueden reducir tu consumo de agua hasta un 50% sin sacrificar comodidad.',
    content: `
      <div class="article-content">
        <img src="https://lh6.googleusercontent.com/proxy/PDCseVBgGIbeXnCVNKrk3kM0wBr5UJewYBGBmAKgQR05We1K3YaPPoqjLgfKZLyYZFQ88_iW7gliX8PQm5wOR0LvGtPx" alt="Dispositivos ahorradores de agua instalados en grifos y duchas" class="article-image-main">

        <h3>🚿 Aireadores para Grifos y Duchas</h3>
        <p>Los aireadores son pequeños dispositivos que se instalan en grifos y regaderas. <strong>Reducen el flujo de agua hasta un 50%</strong> mezclándola con aire, manteniendo la presión y sensación de abundante agua.</p>

        <div class="tip-box">
          <h4>💡 Tip Práctico</h4>
          <p>Costo: $50-150 MXN por pieza. Se instalan en 2 minutos sin herramientas especiales.</p>
        </div>

        <h3>🚽 Dispositivos para Inodoros</h3>
        <img src="https://www.mndelgolfo.com/blog/wp-content/uploads/2017/10/como-funciona-un-inodoro-doble-descarga.jpg" alt="Inodoro con sistema de descarga dual" class="article-image">
        <p>Las <strong>válvulas de descarga dual</strong> permiten elegir entre descarga completa (6L) o parcial (3L). Los <strong>tanques con bolsas de agua</strong> reducen la capacidad del depósito sin afectar la funcionalidad.</p>

        <h3>📊 Impacto Real</h3>
        <ul>
          <li><strong>Aireadores:</strong> Ahorro de 40-60% en grifos</li>
          <li><strong>Regaderas eficientes:</strong> De 20L/min a 8L/min</li>
          <li><strong>Inodoros duales:</strong> Ahorro de 30-40% por descarga</li>
        </ul>

        <div class="action-box">
          <h4>🎯 Acción Inmediata</h4>
          <p>Comienza instalando aireadores en tus grifos más usados: cocina y baño principal. La inversión se recupera en el primer mes.</p>
        </div>
      </div>
    `,
    category: 'agua',
    imageUrl: 'https://propiedades.com/blog/wp-content/uploads/2022/07/co--mo-ahorrar-agua-2.jpg',
    readingTime: 1,
    tags: ['dispositivos', 'ahorro', 'tecnología', 'instalación'],
    publishDate: new Date('2025-01-15'),
    featured: true
  },

  {
    id: 'agua-002',
    slug: 'habitos-consumo-consciente-agua',
    title: 'Hábitos de Consumo Consciente: Pequeños Cambios, Grandes Resultados',
    summary: 'Transforma tu rutina diaria con hábitos simples que pueden reducir tu consumo de agua hasta un 30% de forma inmediata.',
    content: `
      <div class="article-content">
        <img src="https://askthescientists.com/wp-content/uploads/2019/09/Child-washing-hands-AdobeStock_152403075.jpg" alt="Familia practicando hábitos de ahorro de agua en el hogar" class="article-image-main">

        <h3>🚿 En el Baño (60% del consumo doméstico)</h3>
        <div class="habit-grid">
          <div class="habit-item">
            <strong>Duchas eficientes:</strong> Reduce de 10 a 5 minutos = <span class="savings">50L menos por ducha</span>
          </div>
          <div class="habit-item">
            <strong>Cierra el grifo:</strong> Al enjabonarte o cepillarte = <span class="savings">12L ahorrados</span>
          </div>
        </div>

        <img src="https://suinbasa.com/wp-content/uploads/2016/07/water-kitchen-black-design.jpg" alt="Prácticas de ahorro de agua en la cocina" class="article-image">

        <h3>🍽️ En la Cocina (15% del consumo)</h3>
        <ul>
          <li><strong>Lava platos en tina:</strong> No bajo el chorro directo (-70% agua)</li>
          <li><strong>Reutiliza agua de cocción:</strong> Para regar plantas cuando esté fría</li>
          <li><strong>Llena completamente:</strong> Lavavajillas y lavadora antes de usarlos</li>
        </ul>

        <h3>🌱 Jardín y Limpieza</h3>
        <div class="tip-box">
          <h4>🌧️ Aprovecha la lluvia</h4>
          <p>Coloca recipientes para recolectar agua de lluvia. Ideal para plantas y limpieza exterior.</p>
        </div>

        <h3>📈 Tu Impacto Mensual</h3>
        <div class="impact-calculator">
          <p><strong>Duchas más cortas:</strong> 1,500L ahorrados</p>
          <p><strong>Grifo cerrado al lavarse:</strong> 360L ahorrados</p>
          <p><strong>Lavado eficiente de platos:</strong> 840L ahorrados</p>
          <p class="total"><strong>Total mensual: ~2,700L = $65 MXN menos en tu recibo</strong></p>
        </div>

        <div class="action-box">
          <h4>🎯 Reto de 7 Días</h4>
          <p>Elige un hábito cada día esta semana. Al final, habrás creado una rutina completa de ahorro.</p>
        </div>
      </div>
    `,
    category: 'agua',
    imageUrl: 'https://care.org.pe/wp-content/uploads/2021/03/Portada_WEB-3.png',
    readingTime: 1,
    tags: ['hábitos', 'rutina', 'ahorro diario', 'familia'],
    publishDate: new Date('2025-01-10'),
    featured: true
  },

  {
    id: 'agua-003',
    slug: 'deteccion-reparacion-fugas-agua',
    title: 'Detective de Fugas: Encuentra y Repara el Desperdicio Oculto',
    summary: 'Una fuga pequeña puede desperdiciar hasta 34,000 litros al año. Aprende a detectarlas y repararlas tú mismo.',
    content: `
      <div class="article-content">
        <img src="https://es.statefarm.com/content/dam/sf-library/en-us/secure/legacy/simple-insights/136-home-plumbing-checkup-wide.jpg" alt="Técnico revisando medidor de agua para detectar fugas" class="article-image-main">

        <div class="alert-box">
          <h4>⚠️ Dato Impactante</h4>
          <p>Una gota por segundo = 19L diarios = 6,935L anuales = $167 MXN extra en tu recibo</p>
        </div>

        <h3>🔍 Detección Rápida en 5 Minutos</h3>

        <h4>1. Test del Medidor</h4>
        <img src="https://i.ytimg.com/vi/LBOiyVYb-hc/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AHUBoAC4AOKAgwIABABGF0gXShdMA8=&rs=AOn4CLDiRFHvvaBzaMhL29H9JMkxkiVOHQ" alt="Lectura de medidor de agua para detectar fugas" class="article-image">
        <ol>
          <li>Cierra todas las llaves de agua en casa</li>
          <li>Revisa tu medidor: si se mueve, ¡hay fuga!</li>
          <li>Anota la lectura, espera 1 hora sin usar agua</li>
          <li>Si cambió la lectura, tienes una fuga activa</li>
        </ol>

        <h4>2. Inspección Visual</h4>
        <div class="inspection-grid">
          <div class="zone">
            <strong>🚽 Inodoros:</strong> Agrega colorante al tanque. Si aparece color en la taza sin jalar, hay fuga.
          </div>
          <div class="zone">
            <strong>🚿 Grifos:</strong> Busca goteo en llaves y conexiones.
          </div>
          <div class="zone">
            <strong>📍 Paredes:</strong> Manchas de humedad o pintura descascarada.
          </div>
        </div>

        <img src="https://rotoplas.com.mx/wp-content/uploads/2020/04/black-and-white-close-up-equipment-210881.jpg" alt="Herramientas básicas para reparar fugas menores" class="article-image">

        <h3>🔧 Reparaciones Básicas</h3>

        <h4>Fuga en Grifo (90% de los casos)</h4>
        <ul>
          <li><strong>Problema:</strong> Empaques gastados o rosca suelta</li>
          <li><strong>Solución:</strong> Cambiar empaques ($15 MXN) o ajustar conexiones</li>
          <li><strong>Tiempo:</strong> 15-30 minutos</li>
        </ul>

        <h4>Fuga en Inodoro</h4>
        <ul>
          <li><strong>Cadena rota:</strong> Reemplazar ($25 MXN)</li>
          <li><strong>Válvula de descarga:</strong> Ajustar o cambiar ($80 MXN)</li>
        </ul>

        <div class="warning-box">
          <h4>🚨 Cuándo Llamar al Plomero</h4>
          <ul>
            <li>Fugas en paredes o pisos</li>
            <li>Presión de agua muy baja en toda la casa</li>
            <li>Sonidos extraños en tuberías</li>
          </ul>
        </div>

        <h3>💰 Ahorro Potencial</h3>
        <div class="savings-table">
          <p><strong>Reparar 1 grifo que gotea:</strong> $167 MXN/año</p>
          <p><strong>Arreglar inodoro con fuga:</strong> $600 MXN/año</p>
          <p><strong>Mantenimiento preventivo:</strong> $1,200 MXN/año</p>
        </div>

        <div class="action-box">
          <h4>🎯 Plan de Acción</h4>
          <p>Haz la prueba del medidor este fin de semana. Si detectas fuga, programa 1 hora para reparaciones básicas.</p>
        </div>
      </div>
    `,
    category: 'agua',
    imageUrl: 'https://grupohidraulica.com/wp-content/uploads/2023/07/fuga-de-agua-tuberias-1024x683-1.jpg',
    readingTime: 1,
    tags: ['detección', 'reparación', 'mantenimiento', 'DIY'],
    publishDate: new Date('2025-01-05'),
    featured: true
  }
];

// Exportar también una función helper para obtener artículos por categoría
export const getWaterArticles = (): EducationArticle[] => {
  return waterEducationArticles;
};

// Función para obtener un artículo específico por slug
export const getWaterArticleBySlug = (slug: string): EducationArticle | undefined => {
  return waterEducationArticles.find(article => article.slug === slug);
};

