import{D as _,Fa as I,Ga as j,I as w,J as s,M as O,Na as R,Q as C,S,T as u,U as D,W as T,Y as c,Z as l,_ as A,ab as k,c as v,ca as x,da as f,ja as g,ka as E,la as M,s as P}from"./chunk-K5VQB3RE.js";var m={agua:{id:"agua",name:"Conservaci\xF3n del Agua",description:"Aprende t\xE9cnicas efectivas para reducir tu consumo de agua y proteger este recurso vital.",icon:"droplet",color:"var(--color-agua-primary, #0288D1)",lightColor:"var(--color-agua-light, #B3E5FC)",darkColor:"var(--color-agua-dark, #01579B)",articleCount:3},electricidad:{id:"electricidad",name:"Eficiencia Energ\xE9tica",description:"Descubre c\xF3mo optimizar tu consumo el\xE9ctrico y adoptar tecnolog\xEDas m\xE1s eficientes.",icon:"zap",color:"var(--color-electricidad-primary, #FFB300)",lightColor:"var(--color-electricidad-light, #FFECB3)",darkColor:"var(--color-electricidad-dark, #FF8F00)",articleCount:3},transporte:{id:"transporte",name:"Movilidad Sostenible",description:"Explora alternativas de transporte ecol\xF3gicas que reducen tu huella de carbono.",icon:"car",color:"var(--color-transporte-primary, #43A047)",lightColor:"var(--color-transporte-light, #C8E6C9)",darkColor:"var(--color-transporte-dark, #2E7D32)",articleCount:3}};function q(r,e){r&1&&(c(0,"div",20)(1,"span",21),g(2,"\u2B50"),l(),c(3,"span",22),g(4,"Destacado"),l()())}function F(r,e){if(r&1&&(c(0,"div",23)(1,"div",24)(2,"span",25),g(3),l(),c(4,"span",26),g(5),l()()()),r&2){let a=f();s(3),E(a.getCategoryIcon()),s(2),E(a.getCategoryName())}}function U(r,e){if(r&1&&(c(0,"div",27)(1,"span",28),g(2,"\u{1F552}"),l(),c(3,"span",29),g(4),l()()),r&2){let a=f();s(4),E(a.getReadingTimeText())}}function G(r,e){if(r&1&&(c(0,"div",30)(1,"span",31),g(2,"\u{1F4C5}"),l(),c(3,"span",32),g(4),l()()),r&2){let a=f();s(4),E(a.getFormattedDate())}}function H(r,e){if(r&1&&(c(0,"div",33),A(1,"span",34),c(2,"span",35),g(3),l()()),r&2){let a=f();s(),D("background-color",a.getCategoryColor()),s(2),E(a.getCategoryName())}}function K(r,e){if(r&1&&(c(0,"p",36),g(1),l()),r&2){let a=f();s(),M(" ",a.getTruncatedSummary(a.compact?80:120)," ")}}function W(r,e){if(r&1&&(c(0,"span",40),g(1),l()),r&2){let a=e.$implicit;s(),M(" #",a," ")}}function Y(r,e){if(r&1&&(c(0,"span",41),g(1),l()),r&2){let a=f(2);s(),M(" +",a.article.tags.length-(a.compact?2:3)," m\xE1s ")}}function Q(r,e){if(r&1&&(c(0,"div",37),C(1,W,2,1,"span",38)(2,Y,2,1,"span",39),l()),r&2){let a=f();s(),u("ngForOf",a.getLimitedTags(a.compact?2:3)),s(),u("ngIf",a.article.tags.length>(a.compact?2:3))}}function J(r,e){if(r&1&&(c(0,"span",42),g(1),l()),r&2){let a=f();s(),M(" \u{1F552} ",a.getReadingTimeText()," ")}}var L=class r{article;showCategory=!0;showReadingTime=!0;showSummary=!0;showPublishDate=!1;showTags=!1;featured=!1;compact=!1;articleClick=new _;categoryInfo;defaultImageUrl="https://concepto.de/wp-content/uploads/2013/08/ecolog%C3%ADa-e1551739090805.jpg";ngOnInit(){this.article&&(this.categoryInfo=m[this.article.category])}onArticleClick(){this.article&&this.articleClick.emit(this.article)}onKeyDown(e){(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),this.onArticleClick())}getArticleImage(){return this.article?.imageUrl||this.defaultImageUrl}getReadingTimeText(){if(!this.article?.readingTime)return"";let e=this.article.readingTime;return e===1?"1 min":`${e} min`}getCategoryName(){return this.categoryInfo?.name||this.article?.category||""}getCategoryColor(){return this.categoryInfo?.color||"#3498db"}getCategoryIcon(){return{agua:"\u{1F4A7}",electricidad:"\u26A1",transporte:"\u{1F697}"}[this.article?.category]||"\u{1F4D6}"}getFormattedDate(){return this.article?.publishDate?new Intl.DateTimeFormat("es-ES",{year:"numeric",month:"long",day:"numeric"}).format(new Date(this.article.publishDate)):""}getTruncatedSummary(e=120){return this.article?.summary?this.article.summary.length<=e?this.article.summary:this.article.summary.substring(0,e).trim()+"...":""}hasTags(){return this.article?.tags&&this.article.tags.length>0}getLimitedTags(e=3){return this.hasTags()?this.article.tags.slice(0,e):[]}onImageError(e){e.target.src=this.defaultImageUrl}getCardClasses(){let e=["article-card"];return this.article?.category&&e.push(`theme-${this.article.category}`),this.featured&&e.push("featured"),this.compact&&e.push("compact"),e.join(" ")}static \u0275fac=function(a){return new(a||r)};static \u0275cmp=O({type:r,selectors:[["app-article-card"]],inputs:{article:"article",showCategory:"showCategory",showReadingTime:"showReadingTime",showSummary:"showSummary",showPublishDate:"showPublishDate",showTags:"showTags",featured:"featured",compact:"compact"},outputs:{articleClick:"articleClick"},decls:23,vars:16,consts:[[3,"click","keydown"],["class","featured-badge",4,"ngIf"],[1,"article-image-container"],["loading","lazy",1,"article-image",3,"error","src","alt"],["class","category-overlay",4,"ngIf"],["class","reading-time-overlay",4,"ngIf"],[1,"article-content"],[1,"article-header"],["class","publish-date",4,"ngIf"],["class","category-inline",4,"ngIf"],[1,"article-title"],["class","article-summary",4,"ngIf"],["class","article-tags",4,"ngIf"],[1,"article-footer"],[1,"reading-info"],["class","reading-time-compact",4,"ngIf"],[1,"action-indicator"],[1,"action-text"],[1,"action-arrow"],[1,"hover-indicator"],[1,"featured-badge"],[1,"featured-icon"],[1,"featured-text"],[1,"category-overlay"],[1,"category-badge"],[1,"category-icon"],[1,"category-name"],[1,"reading-time-overlay"],[1,"reading-time-icon"],[1,"reading-time-text"],[1,"publish-date"],[1,"date-icon"],[1,"date-text"],[1,"category-inline"],[1,"category-dot"],[1,"category-text"],[1,"article-summary"],[1,"article-tags"],["class","tag",4,"ngFor","ngForOf"],["class","tag-more",4,"ngIf"],[1,"tag"],[1,"tag-more"],[1,"reading-time-compact"]],template:function(a,t){a&1&&(c(0,"article",0),x("click",function(){return t.onArticleClick()})("keydown",function(o){return t.onKeyDown(o)}),C(1,q,5,0,"div",1),c(2,"div",2)(3,"img",3),x("error",function(o){return t.onImageError(o)}),l(),C(4,F,6,2,"div",4)(5,U,5,1,"div",5),l(),c(6,"div",6)(7,"div",7),C(8,G,5,1,"div",8)(9,H,4,3,"div",9),l(),c(10,"h3",10),g(11),l(),C(12,K,2,1,"p",11)(13,Q,3,2,"div",12),c(14,"div",13)(15,"div",14),C(16,J,2,1,"span",15),l(),c(17,"div",16)(18,"span",17),g(19,"Leer m\xE1s"),l(),c(20,"span",18),g(21,"\u2192"),l()()()(),A(22,"div",19),l()),a&2&&(T(t.getCardClasses()),S("tabindex",0)("role","button")("aria-label","Leer art\xEDculo: "+(t.article==null?null:t.article.title)),s(),u("ngIf",t.featured),s(2),u("src",t.getArticleImage(),w)("alt",(t.article==null?null:t.article.title)||"Imagen del art\xEDculo"),s(),u("ngIf",t.showCategory),s(),u("ngIf",t.showReadingTime),s(3),u("ngIf",t.showPublishDate),s(),u("ngIf",t.showCategory&&t.compact),s(2),M(" ",t.article==null?null:t.article.title," "),s(),u("ngIf",t.showSummary),s(),u("ngIf",t.showTags&&t.hasTags()),s(3),u("ngIf",t.showReadingTime&&t.compact))},dependencies:[R,I,j,k],styles:['@charset "UTF-8";.article-card[_ngcontent-%COMP%]{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px #00000014;transition:all .3s ease;cursor:pointer;position:relative;border:2px solid transparent;height:100%;display:flex;flex-direction:column}.article-card[_ngcontent-%COMP%]:hover{transform:translateY(-8px);box-shadow:0 12px 32px #00000026}.article-card[_ngcontent-%COMP%]:hover   .article-image[_ngcontent-%COMP%]{transform:scale(1.05)}.article-card[_ngcontent-%COMP%]:hover   .action-arrow[_ngcontent-%COMP%]{transform:translate(4px)}.article-card[_ngcontent-%COMP%]:hover   .hover-indicator[_ngcontent-%COMP%]{opacity:1}.article-card[_ngcontent-%COMP%]:focus{outline:none;border-color:#3498db;box-shadow:0 0 0 3px #3498db33}.article-card.theme-agua[_ngcontent-%COMP%]:hover{border-color:var(--color-agua-primary)}.article-card.theme-agua[_ngcontent-%COMP%]   .category-badge[_ngcontent-%COMP%]{background:linear-gradient(135deg,var(--color-agua-primary),var(--color-agua-dark))}.article-card.theme-agua[_ngcontent-%COMP%]   .hover-indicator[_ngcontent-%COMP%]{background:linear-gradient(135deg,var(--color-agua-primary),var(--color-agua-accent))}.article-card.theme-agua[_ngcontent-%COMP%]   .article-title[_ngcontent-%COMP%]{color:var(--color-agua-dark)}.article-card.theme-electricidad[_ngcontent-%COMP%]:hover{border-color:var(--color-electricidad-primary)}.article-card.theme-electricidad[_ngcontent-%COMP%]   .category-badge[_ngcontent-%COMP%]{background:linear-gradient(135deg,var(--color-electricidad-primary),var(--color-electricidad-dark))}.article-card.theme-electricidad[_ngcontent-%COMP%]   .hover-indicator[_ngcontent-%COMP%]{background:linear-gradient(135deg,var(--color-electricidad-primary),var(--color-electricidad-accent))}.article-card.theme-electricidad[_ngcontent-%COMP%]   .article-title[_ngcontent-%COMP%]{color:var(--color-electricidad-dark)}.article-card.theme-transporte[_ngcontent-%COMP%]:hover{border-color:var(--color-transporte-primary)}.article-card.theme-transporte[_ngcontent-%COMP%]   .category-badge[_ngcontent-%COMP%]{background:linear-gradient(135deg,var(--color-transporte-primary),var(--color-transporte-dark))}.article-card.theme-transporte[_ngcontent-%COMP%]   .hover-indicator[_ngcontent-%COMP%]{background:linear-gradient(135deg,var(--color-transporte-primary),var(--color-transporte-accent))}.article-card.theme-transporte[_ngcontent-%COMP%]   .article-title[_ngcontent-%COMP%]{color:var(--color-transporte-dark)}.article-card.featured[_ngcontent-%COMP%]{border:2px solid #f39c12;position:relative}.article-card.featured[_ngcontent-%COMP%]:before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,#f39c121a,#e67e220d);pointer-events:none;z-index:0}.article-card.featured[_ngcontent-%COMP%]   .article-content[_ngcontent-%COMP%]{position:relative;z-index:1}.article-card.compact[_ngcontent-%COMP%]{flex-direction:row;height:auto;min-height:120px}.article-card.compact[_ngcontent-%COMP%]   .article-image-container[_ngcontent-%COMP%]{width:120px;height:120px;flex-shrink:0}.article-card.compact[_ngcontent-%COMP%]   .article-content[_ngcontent-%COMP%]{padding:16px}.article-card.compact[_ngcontent-%COMP%]   .article-title[_ngcontent-%COMP%]{font-size:1rem;margin-bottom:.5rem}.article-card.compact[_ngcontent-%COMP%]   .article-summary[_ngcontent-%COMP%]{font-size:.85rem;margin-bottom:.5rem}@media (max-width: 480px){.article-card.compact[_ngcontent-%COMP%]{flex-direction:column}.article-card.compact[_ngcontent-%COMP%]   .article-image-container[_ngcontent-%COMP%]{width:100%;height:160px}}.featured-badge[_ngcontent-%COMP%]{position:absolute;top:12px;right:12px;background:linear-gradient(135deg,#f39c12,#e67e22);color:#fff;padding:6px 12px;border-radius:20px;font-size:.75rem;font-weight:600;z-index:10;display:flex;align-items:center;gap:4px;box-shadow:0 2px 8px #0003}.featured-badge[_ngcontent-%COMP%]   .featured-icon[_ngcontent-%COMP%]{font-size:.8rem}.featured-badge[_ngcontent-%COMP%]   .featured-text[_ngcontent-%COMP%]{text-transform:uppercase;letter-spacing:.5px}.article-image-container[_ngcontent-%COMP%]{position:relative;width:100%;height:200px;overflow:hidden;background:#f8f9fa}.article-image[_ngcontent-%COMP%]{width:100%;height:100%;object-fit:cover;transition:transform .3s ease}.category-overlay[_ngcontent-%COMP%]{position:absolute;top:12px;left:12px;z-index:5}.category-badge[_ngcontent-%COMP%]{background:linear-gradient(135deg,#2c3e50,#34495e);color:#fff;padding:6px 12px;border-radius:20px;font-size:.75rem;font-weight:600;display:flex;align-items:center;gap:6px;box-shadow:0 2px 8px #0000004d;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}.category-badge[_ngcontent-%COMP%]   .category-icon[_ngcontent-%COMP%]{font-size:.9rem}.category-badge[_ngcontent-%COMP%]   .category-name[_ngcontent-%COMP%]{text-transform:uppercase;letter-spacing:.5px}.reading-time-overlay[_ngcontent-%COMP%]{position:absolute;bottom:12px;right:12px;background:#000000b3;color:#fff;padding:4px 10px;border-radius:12px;font-size:.75rem;font-weight:500;display:flex;align-items:center;gap:4px;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);z-index:5}.reading-time-overlay[_ngcontent-%COMP%]   .reading-time-icon[_ngcontent-%COMP%]{font-size:.8rem}.article-content[_ngcontent-%COMP%]{padding:20px;flex:1;display:flex;flex-direction:column}.article-header[_ngcontent-%COMP%]{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;min-height:20px}.publish-date[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;font-size:.8rem;color:#6c757d}.publish-date[_ngcontent-%COMP%]   .date-icon[_ngcontent-%COMP%]{font-size:.75rem}.category-inline[_ngcontent-%COMP%]{display:flex;align-items:center;gap:6px;font-size:.8rem;color:#495057}.category-inline[_ngcontent-%COMP%]   .category-dot[_ngcontent-%COMP%]{width:8px;height:8px;border-radius:50%}.category-inline[_ngcontent-%COMP%]   .category-text[_ngcontent-%COMP%]{font-weight:500;text-transform:capitalize}.article-title[_ngcontent-%COMP%]{font-size:1.25rem;font-weight:700;color:#2c3e50;margin-bottom:12px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis}.article-summary[_ngcontent-%COMP%]{color:#5a6c7d;font-size:.95rem;line-height:1.5;margin-bottom:16px;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis}.article-tags[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}.article-tags[_ngcontent-%COMP%]   .tag[_ngcontent-%COMP%]{background:#e9ecef;color:#495057;padding:3px 8px;border-radius:10px;font-size:.75rem;font-weight:500;transition:background-color .2s ease}.article-tags[_ngcontent-%COMP%]   .tag[_ngcontent-%COMP%]:hover{background:#dee2e6}.article-tags[_ngcontent-%COMP%]   .tag-more[_ngcontent-%COMP%]{color:#6c757d;font-size:.75rem;font-style:italic}.article-footer[_ngcontent-%COMP%]{display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:12px;border-top:1px solid #f1f3f4}.reading-info[_ngcontent-%COMP%]   .reading-time-compact[_ngcontent-%COMP%]{font-size:.8rem;color:#6c757d;display:flex;align-items:center;gap:4px}.action-indicator[_ngcontent-%COMP%]{display:flex;align-items:center;gap:6px;color:#3498db;font-size:.85rem;font-weight:600}.action-indicator[_ngcontent-%COMP%]   .action-text[_ngcontent-%COMP%]{transition:color .2s ease}.action-indicator[_ngcontent-%COMP%]   .action-arrow[_ngcontent-%COMP%]{transition:transform .2s ease;font-size:1rem}.hover-indicator[_ngcontent-%COMP%]{position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#3498db,#2ecc71);opacity:0;transition:opacity .3s ease}@media (max-width: 768px){.article-card[_ngcontent-%COMP%]   .article-content[_ngcontent-%COMP%]{padding:16px}.article-card[_ngcontent-%COMP%]   .article-title[_ngcontent-%COMP%]{font-size:1.1rem}.article-card[_ngcontent-%COMP%]   .article-summary[_ngcontent-%COMP%]{font-size:.9rem}.article-card.compact[_ngcontent-%COMP%]   .article-image-container[_ngcontent-%COMP%]{width:100px;height:100px}.article-card.compact[_ngcontent-%COMP%]   .article-content[_ngcontent-%COMP%]{padding:12px}.article-image-container[_ngcontent-%COMP%]{height:160px}.featured-badge[_ngcontent-%COMP%], .category-badge[_ngcontent-%COMP%], .reading-time-overlay[_ngcontent-%COMP%]{font-size:.7rem;padding:4px 8px}}@media (max-width: 480px){.article-card.compact[_ngcontent-%COMP%]{flex-direction:column}.article-card.compact[_ngcontent-%COMP%]   .article-image-container[_ngcontent-%COMP%]{width:100%;height:140px}.article-header[_ngcontent-%COMP%], .article-footer[_ngcontent-%COMP%]{flex-direction:column;align-items:flex-start;gap:8px}}@media (prefers-reduced-motion: reduce){.article-card[_ngcontent-%COMP%]{transition:none}.article-card[_ngcontent-%COMP%]:hover, .article-card[_ngcontent-%COMP%]:hover   .article-image[_ngcontent-%COMP%], .article-card[_ngcontent-%COMP%]:hover   .action-arrow[_ngcontent-%COMP%]{transform:none}}.article-image[_ngcontent-%COMP%]{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0,#f0f0f0 75%);background-size:200% 100%;animation:_ngcontent-%COMP%_loading 1.5s infinite}.article-image[src][_ngcontent-%COMP%]{animation:none;background:none}@keyframes _ngcontent-%COMP%_loading{0%{background-position:200% 0}to{background-position:-200% 0}}.article-image[src$="default-article.jpg"][_ngcontent-%COMP%]{background:linear-gradient(135deg,#f8f9fa,#e9ecef);display:flex;align-items:center;justify-content:center}.article-image[src$="default-article.jpg"][_ngcontent-%COMP%]:after{content:"\\1f4d6";font-size:3rem;opacity:.5}']})};var N=[{id:"agua-001",slug:"dispositivos-ahorradores-agua",title:"Dispositivos Ahorradores: Tu Primer Paso hacia el Consumo Inteligente",summary:"Descubre los dispositivos simples y econ\xF3micos que pueden reducir tu consumo de agua hasta un 50% sin sacrificar comodidad.",content:`
      <div class="article-content">
        <img src="https://lh6.googleusercontent.com/proxy/PDCseVBgGIbeXnCVNKrk3kM0wBr5UJewYBGBmAKgQR05We1K3YaPPoqjLgfKZLyYZFQ88_iW7gliX8PQm5wOR0LvGtPx" alt="Dispositivos ahorradores de agua instalados en grifos y duchas" class="article-image-main">

        <h3>\u{1F6BF} Aireadores para Grifos y Duchas</h3>
        <p>Los aireadores son peque\xF1os dispositivos que se instalan en grifos y regaderas. <strong>Reducen el flujo de agua hasta un 50%</strong> mezcl\xE1ndola con aire, manteniendo la presi\xF3n y sensaci\xF3n de abundante agua.</p>

        <div class="tip-box">
          <h4>\u{1F4A1} Tip Pr\xE1ctico</h4>
          <p>Costo: $50-150 MXN por pieza. Se instalan en 2 minutos sin herramientas especiales.</p>
        </div>

        <h3>\u{1F6BD} Dispositivos para Inodoros</h3>
        <img src="https://www.mndelgolfo.com/blog/wp-content/uploads/2017/10/como-funciona-un-inodoro-doble-descarga.jpg" alt="Inodoro con sistema de descarga dual" class="article-image">
        <p>Las <strong>v\xE1lvulas de descarga dual</strong> permiten elegir entre descarga completa (6L) o parcial (3L). Los <strong>tanques con bolsas de agua</strong> reducen la capacidad del dep\xF3sito sin afectar la funcionalidad.</p>

        <h3>\u{1F4CA} Impacto Real</h3>
        <ul>
          <li><strong>Aireadores:</strong> Ahorro de 40-60% en grifos</li>
          <li><strong>Regaderas eficientes:</strong> De 20L/min a 8L/min</li>
          <li><strong>Inodoros duales:</strong> Ahorro de 30-40% por descarga</li>
        </ul>

        <div class="action-box">
          <h4>\u{1F3AF} Acci\xF3n Inmediata</h4>
          <p>Comienza instalando aireadores en tus grifos m\xE1s usados: cocina y ba\xF1o principal. La inversi\xF3n se recupera en el primer mes.</p>
        </div>
      </div>
    `,category:"agua",imageUrl:"https://propiedades.com/blog/wp-content/uploads/2022/07/co--mo-ahorrar-agua-2.jpg",readingTime:1,tags:["dispositivos","ahorro","tecnolog\xEDa","instalaci\xF3n"],publishDate:new Date("2025-01-15"),featured:!0},{id:"agua-002",slug:"habitos-consumo-consciente-agua",title:"H\xE1bitos de Consumo Consciente: Peque\xF1os Cambios, Grandes Resultados",summary:"Transforma tu rutina diaria con h\xE1bitos simples que pueden reducir tu consumo de agua hasta un 30% de forma inmediata.",content:`
      <div class="article-content">
        <img src="https://askthescientists.com/wp-content/uploads/2019/09/Child-washing-hands-AdobeStock_152403075.jpg" alt="Familia practicando h\xE1bitos de ahorro de agua en el hogar" class="article-image-main">

        <h3>\u{1F6BF} En el Ba\xF1o (60% del consumo dom\xE9stico)</h3>
        <div class="habit-grid">
          <div class="habit-item">
            <strong>Duchas eficientes:</strong> Reduce de 10 a 5 minutos = <span class="savings">50L menos por ducha</span>
          </div>
          <div class="habit-item">
            <strong>Cierra el grifo:</strong> Al enjabonarte o cepillarte = <span class="savings">12L ahorrados</span>
          </div>
        </div>

        <img src="https://suinbasa.com/wp-content/uploads/2016/07/water-kitchen-black-design.jpg" alt="Pr\xE1cticas de ahorro de agua en la cocina" class="article-image">

        <h3>\u{1F37D}\uFE0F En la Cocina (15% del consumo)</h3>
        <ul>
          <li><strong>Lava platos en tina:</strong> No bajo el chorro directo (-70% agua)</li>
          <li><strong>Reutiliza agua de cocci\xF3n:</strong> Para regar plantas cuando est\xE9 fr\xEDa</li>
          <li><strong>Llena completamente:</strong> Lavavajillas y lavadora antes de usarlos</li>
        </ul>

        <h3>\u{1F331} Jard\xEDn y Limpieza</h3>
        <div class="tip-box">
          <h4>\u{1F327}\uFE0F Aprovecha la lluvia</h4>
          <p>Coloca recipientes para recolectar agua de lluvia. Ideal para plantas y limpieza exterior.</p>
        </div>

        <h3>\u{1F4C8} Tu Impacto Mensual</h3>
        <div class="impact-calculator">
          <p><strong>Duchas m\xE1s cortas:</strong> 1,500L ahorrados</p>
          <p><strong>Grifo cerrado al lavarse:</strong> 360L ahorrados</p>
          <p><strong>Lavado eficiente de platos:</strong> 840L ahorrados</p>
          <p class="total"><strong>Total mensual: ~2,700L = $65 MXN menos en tu recibo</strong></p>
        </div>

        <div class="action-box">
          <h4>\u{1F3AF} Reto de 7 D\xEDas</h4>
          <p>Elige un h\xE1bito cada d\xEDa esta semana. Al final, habr\xE1s creado una rutina completa de ahorro.</p>
        </div>
      </div>
    `,category:"agua",imageUrl:"https://care.org.pe/wp-content/uploads/2021/03/Portada_WEB-3.png",readingTime:1,tags:["h\xE1bitos","rutina","ahorro diario","familia"],publishDate:new Date("2025-01-10"),featured:!0},{id:"agua-003",slug:"deteccion-reparacion-fugas-agua",title:"Detective de Fugas: Encuentra y Repara el Desperdicio Oculto",summary:"Una fuga peque\xF1a puede desperdiciar hasta 34,000 litros al a\xF1o. Aprende a detectarlas y repararlas t\xFA mismo.",content:`
      <div class="article-content">
        <img src="https://es.statefarm.com/content/dam/sf-library/en-us/secure/legacy/simple-insights/136-home-plumbing-checkup-wide.jpg" alt="T\xE9cnico revisando medidor de agua para detectar fugas" class="article-image-main">

        <div class="alert-box">
          <h4>\u26A0\uFE0F Dato Impactante</h4>
          <p>Una gota por segundo = 19L diarios = 6,935L anuales = $167 MXN extra en tu recibo</p>
        </div>

        <h3>\u{1F50D} Detecci\xF3n R\xE1pida en 5 Minutos</h3>

        <h4>1. Test del Medidor</h4>
        <img src="https://i.ytimg.com/vi/LBOiyVYb-hc/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AHUBoAC4AOKAgwIABABGF0gXShdMA8=&rs=AOn4CLDiRFHvvaBzaMhL29H9JMkxkiVOHQ" alt="Lectura de medidor de agua para detectar fugas" class="article-image">
        <ol>
          <li>Cierra todas las llaves de agua en casa</li>
          <li>Revisa tu medidor: si se mueve, \xA1hay fuga!</li>
          <li>Anota la lectura, espera 1 hora sin usar agua</li>
          <li>Si cambi\xF3 la lectura, tienes una fuga activa</li>
        </ol>

        <h4>2. Inspecci\xF3n Visual</h4>
        <div class="inspection-grid">
          <div class="zone">
            <strong>\u{1F6BD} Inodoros:</strong> Agrega colorante al tanque. Si aparece color en la taza sin jalar, hay fuga.
          </div>
          <div class="zone">
            <strong>\u{1F6BF} Grifos:</strong> Busca goteo en llaves y conexiones.
          </div>
          <div class="zone">
            <strong>\u{1F4CD} Paredes:</strong> Manchas de humedad o pintura descascarada.
          </div>
        </div>

        <img src="https://rotoplas.com.mx/wp-content/uploads/2020/04/black-and-white-close-up-equipment-210881.jpg" alt="Herramientas b\xE1sicas para reparar fugas menores" class="article-image">

        <h3>\u{1F527} Reparaciones B\xE1sicas</h3>

        <h4>Fuga en Grifo (90% de los casos)</h4>
        <ul>
          <li><strong>Problema:</strong> Empaques gastados o rosca suelta</li>
          <li><strong>Soluci\xF3n:</strong> Cambiar empaques ($15 MXN) o ajustar conexiones</li>
          <li><strong>Tiempo:</strong> 15-30 minutos</li>
        </ul>

        <h4>Fuga en Inodoro</h4>
        <ul>
          <li><strong>Cadena rota:</strong> Reemplazar ($25 MXN)</li>
          <li><strong>V\xE1lvula de descarga:</strong> Ajustar o cambiar ($80 MXN)</li>
        </ul>

        <div class="warning-box">
          <h4>\u{1F6A8} Cu\xE1ndo Llamar al Plomero</h4>
          <ul>
            <li>Fugas en paredes o pisos</li>
            <li>Presi\xF3n de agua muy baja en toda la casa</li>
            <li>Sonidos extra\xF1os en tuber\xEDas</li>
          </ul>
        </div>

        <h3>\u{1F4B0} Ahorro Potencial</h3>
        <div class="savings-table">
          <p><strong>Reparar 1 grifo que gotea:</strong> $167 MXN/a\xF1o</p>
          <p><strong>Arreglar inodoro con fuga:</strong> $600 MXN/a\xF1o</p>
          <p><strong>Mantenimiento preventivo:</strong> $1,200 MXN/a\xF1o</p>
        </div>

        <div class="action-box">
          <h4>\u{1F3AF} Plan de Acci\xF3n</h4>
          <p>Haz la prueba del medidor este fin de semana. Si detectas fuga, programa 1 hora para reparaciones b\xE1sicas.</p>
        </div>
      </div>
    `,category:"agua",imageUrl:"https://grupohidraulica.com/wp-content/uploads/2023/07/fuga-de-agua-tuberias-1024x683-1.jpg",readingTime:1,tags:["detecci\xF3n","reparaci\xF3n","mantenimiento","DIY"],publishDate:new Date("2025-01-05"),featured:!0}];var z=[{id:"electricidad-001",slug:"electrodomesticos-eficientes-ahorro-energia",title:"Electrodom\xE9sticos Eficientes: La Clave del Ahorro Energ\xE9tico Inteligente",summary:"Descubre c\xF3mo elegir y usar electrodom\xE9sticos eficientes puede reducir tu consumo el\xE9ctrico hasta un 40% sin sacrificar comodidad.",content:`
      <div class="article-content">
        <img src="https://www.factorenergia.com/wp-content/uploads/2021/04/etiqueta-energ%C3%A9tica.png" alt="Electrodom\xE9sticos con etiqueta de eficiencia energ\xE9tica A+++" class="article-image-main">

        <h3>\u{1F3F7}\uFE0F Etiqueta de Eficiencia Energ\xE9tica: Tu Mejor Aliada</h3>
        <p>La etiqueta de eficiencia energ\xE9tica es <strong>obligatoria en M\xE9xico desde 2020</strong> y te permite identificar qu\xE9 tanto consume un electrodom\xE9stico. <strong>Un refrigerador A+++ consume 60% menos energ\xEDa</strong> que uno de clase D.</p>

        <div class="tip-box">
          <h4>\u{1F4A1} Tip de Compra Inteligente</h4>
          <p>Aunque un electrodom\xE9stico eficiente cueste m\xE1s inicialmente, el ahorro en electricidad recupera la inversi\xF3n en 2-3 a\xF1os.</p>
        </div>

        <h3>\u2744\uFE0F Refrigerador: El Rey del Consumo Dom\xE9stico</h3>
        <img src="https://sub-zeromx.com/wp-content/uploads/2023/12/Refrigerador-Sub-Zero-de-Gran-Capacidad.jpg" alt="Refrigerador moderno con clasificaci\xF3n energ\xE9tica A+++" class="article-image">
        <p>El refrigerador consume <strong>25-30% de la electricidad total</strong> de tu hogar. Un modelo eficiente puede ahorrarte hasta <strong>$2,400 MXN al a\xF1o</strong>.</p>

        <h4>Caracter\xEDsticas de un Refrigerador Eficiente:</h4>
        <ul>
          <li><strong>Clasificaci\xF3n A+++:</strong> M\xE1xima eficiencia disponible</li>
          <li><strong>Tecnolog\xEDa Inverter:</strong> Ajusta autom\xE1ticamente la potencia</li>
          <li><strong>Tama\xF1o adecuado:</strong> 150L por persona es la medida ideal</li>
          <li><strong>Aislamiento mejorado:</strong> Mantiene temperatura con menos energ\xEDa</li>
        </ul>

        <h3>\u{1F4A8} Aires Acondicionados y Climatizaci\xF3n</h3>
        <p>Los aires acondicionados pueden representar <strong>hasta el 50% del recibo de luz</strong> en temporada de calor. La diferencia entre un equipo eficiente y uno est\xE1ndar es dram\xE1tica.</p>

        <div class="action-box">
          <h4>\u{1F3AF} C\xE1lculo R\xE1pido de Ahorro</h4>
          <p>Minisplit Inverter 12,000 BTU clase A vs. convencional:</p>
          <p><strong>Ahorro mensual: $800-1,200 MXN</strong> (uso 8 horas diarias)</p>
        </div>

        <h3>\u{1F50C} Otros Electrodom\xE9sticos Clave</h3>

        <h4>Lavadora</h4>
        <img src="https://news.samsung.com/co/wp-content/themes/sw_newsroom/download.php?id=OCBpbebVDzhWNNZhMM1Rp7itXa%2B8xRko9OzCnT8j0zI%3D" alt="Lavadora de carga frontal con certificaci\xF3n energ\xE9tica" class="article-image">
        <ul>
          <li><strong>Carga frontal vs. superior:</strong> 40% menos consumo de agua y electricidad</li>
          <li><strong>Programas eco:</strong> Reducen consumo hasta 30%</li>
          <li><strong>Carga completa:</strong> Maximiza eficiencia por ciclo</li>
        </ul>

        <h4>Televisor</h4>
        <ul>
          <li><strong>LED vs. LCD tradicional:</strong> 50% menos consumo</li>
          <li><strong>Tama\xF1o inteligente:</strong> 32" consume 60W, 55" consume 150W</li>
          <li><strong>Modo standby:</strong> Ap\xE1galo completamente, no en standby</li>
        </ul>

        <h3>\u{1F4CA} Impacto Real en tu Recibo</h3>
        <div class="impact-calculator">
          <p><strong>Refrigerador eficiente:</strong> -$200 MXN/mes</p>
          <p><strong>Aire acondicionado Inverter:</strong> -$800 MXN/mes</p>
          <p><strong>Lavadora eficiente:</strong> -$150 MXN/mes</p>
          <p><strong>Iluminaci\xF3n LED:</strong> -$120 MXN/mes</p>
          <p class="total"><strong>Ahorro total mensual: ~$1,270 MXN</strong></p>
        </div>

        <div class="warning-box">
          <h4>\u26A0\uFE0F Cuidado con las Falsas Ofertas</h4>
          <p>Electrodom\xE9sticos muy baratos suelen ser ineficientes. Verifica siempre la etiqueta de eficiencia energ\xE9tica antes de comprar.</p>
        </div>

        <h3>\u{1F6D2} Gu\xEDa de Compra Inteligente</h3>
        <ol>
          <li><strong>Revisa la etiqueta energ\xE9tica</strong> - Busca clase A++ o A+++</li>
          <li><strong>Calcula el consumo anual</strong> - Multiplica kWh/a\xF1o \xD7 $3.5 MXN</li>
          <li><strong>Compara costo total</strong> - Precio inicial + 10 a\xF1os de consumo</li>
          <li><strong>Verifica garant\xEDa</strong> - Equipos eficientes suelen tener mejor garant\xEDa</li>
        </ol>

        <div class="action-box">
          <h4>\u{1F3AF} Plan de Reemplazo Estrat\xE9gico</h4>
          <p>No reemplaces todo a la vez. Prioriza: 1) Refrigerador viejo, 2) Aire acondicionado ineficiente, 3) Lavadora, 4) Otros electrodom\xE9sticos.</p>
        </div>
      </div>
    `,category:"electricidad",imageUrl:"https://blogs.unsw.edu.au/nowideas/files/2019/03/electrodomesticos-eficientes.jpg",readingTime:1,tags:["electrodom\xE9sticos","eficiencia","ahorro","etiqueta energ\xE9tica"],publishDate:new Date("2025-01-20"),featured:!0},{id:"electricidad-002",slug:"iluminacion-led-ahorro-energia-hogar",title:"Revoluci\xF3n LED: C\xF3mo la Iluminaci\xF3n Inteligente Transforma tu Hogar",summary:"Cambiar a iluminaci\xF3n LED puede reducir el consumo de iluminaci\xF3n hasta 80% y durar 25 veces m\xE1s que los focos tradicionales.",content:`
      <div class="article-content">
        <img src="https://iluminet.com/newpress/wp-content/uploads/2014/09/comparativa-lamps.jpg" alt="Comparaci\xF3n entre bombillas LED, fluorescentes y incandescentes" class="article-image-main">

        <h3>\u{1F4A1} La Revoluci\xF3n de la Iluminaci\xF3n LED</h3>
        <p>Los LEDs (Light Emitting Diodes) han revolucionado la iluminaci\xF3n dom\xE9stica. <strong>Un LED de 9W ilumina igual que un foco incandescente de 60W</strong>, consumiendo 85% menos energ\xEDa.</p>

        <div class="tip-box">
          <h4>\u{1F4B0} C\xE1lculo de Ahorro Inmediato</h4>
          <p>Reemplazar 10 focos incandescentes por LED ahorra aproximadamente <strong>$150 MXN mensuales</strong> en electricidad.</p>
        </div>

        <h3>\u{1F4CA} Comparativa de Tecnolog\xEDas de Iluminaci\xF3n</h3>
        <img src="https://ledslamparascastellon.wordpress.com/wp-content/uploads/2015/01/150106183100_led_bombillos_y_led_624x351_thinkstock.jpg" alt="Tabla comparativa de consumo entre diferentes tipos de iluminaci\xF3n" class="article-image">

        <div class="savings-table">
          <h4>Consumo para 800 l\xFAmenes (equivalente a foco de 60W):</h4>
          <p><strong>Incandescente:</strong> 60W - Vida \xFAtil: 1,000 horas - $1.80/mes</p>
          <p><strong>Fluorescente compacto:</strong> 13W - Vida \xFAtil: 8,000 horas - $0.39/mes</p>
          <p><strong>LED:</strong> 9W - Vida \xFAtil: 25,000 horas - $0.27/mes</p>
        </div>

        <h3>\u{1F3E0} Estrategia de Iluminaci\xF3n por \xC1reas</h3>

        <h4>Sala y Comedores</h4>
        <ul>
          <li><strong>LEDs regulables:</strong> Ajusta intensidad seg\xFAn la actividad</li>
          <li><strong>Temperatura de color:</strong> 2700K-3000K para ambiente c\xE1lido</li>
          <li><strong>M\xFAltiples fuentes:</strong> Combina iluminaci\xF3n general y de acento</li>
        </ul>

        <h4>Cocina</h4>
        <img src="https://www.spaciosintegrales.com/wp-content/uploads/iluminacion-led-carril-spacios-integrales-bogota.png" alt="Cocina moderna con iluminaci\xF3n LED bajo gabinetes y general" class="article-image">
        <ul>
          <li><strong>Iluminaci\xF3n de tarea:</strong> LEDs bajo gabinetes para \xE1rea de trabajo</li>
          <li><strong>Luz brillante:</strong> 4000K-5000K para mejor visibilidad</li>
          <li><strong>Resistentes al calor:</strong> LEDs soportan mejor el ambiente de cocina</li>
        </ul>

        <h4>Rec\xE1maras</h4>
        <ul>
          <li><strong>Luz c\xE1lida:</strong> 2700K para relajaci\xF3n y descanso</li>
          <li><strong>Dimmers:</strong> Control de intensidad para diferentes momentos</li>
          <li><strong>L\xE1mparas de lectura:</strong> LEDs focalizados de 3000K</li>
        </ul>

        <h3>\u{1F527} Instalaci\xF3n y Tipos de LED</h3>

        <h4>LEDs de Rosca Est\xE1ndar</h4>
        <p>Reemplazo directo de focos tradicionales. <strong>Instalaci\xF3n inmediata</strong> sin modificar instalaci\xF3n el\xE9ctrica.</p>

        <h4>Paneles LED</h4>
        <p>Ideales para oficinas y cocinas. <strong>Iluminaci\xF3n uniforme</strong> y consumo ultra-bajo.</p>

        <h4>Tiras LED</h4>
        <img src="https://algsa.es/images/content/news/2024021413135228845ventajas-de-la-iluminacion-con-tiras-led.webp" alt="Tiras LED instaladas como iluminaci\xF3n decorativa y funcional" class="article-image">
        <p>Perfectas para iluminaci\xF3n indirecta y decorativa. <strong>Consumo m\xEDnimo</strong> y efectos espectaculares.</p>

        <div class="action-box">
          <h4>\u{1F6E0}\uFE0F Instalaci\xF3n Paso a Paso</h4>
          <ol>
            <li><strong>Apaga el interruptor</strong> antes de cambiar cualquier foco</li>
            <li><strong>Desenrosca el foco viejo</strong> cuando est\xE9 fr\xEDo</li>
            <li><strong>Enrosca el LED nuevo</strong> - mismo socket, diferente tecnolog\xEDa</li>
            <li><strong>Enciende y disfruta</strong> el ahorro inmediato</li>
          </ol>
        </div>

        <h3>\u{1F305} Iluminaci\xF3n Natural + LED</h3>
        <p>Combina iluminaci\xF3n natural con LEDs para <strong>m\xE1xima eficiencia</strong>:</p>
        <ul>
          <li><strong>Sensores de movimiento:</strong> LEDs solo cuando necesites luz</li>
          <li><strong>Fotoceldas:</strong> Ajuste autom\xE1tico seg\xFAn luz natural</li>
          <li><strong>Temporizadores:</strong> Encendido/apagado programado</li>
        </ul>

        <h3>\u{1F4A1} Tecnolog\xEDas Avanzadas</h3>

        <h4>LEDs Inteligentes</h4>
        <div class="tip-box">
          <h4>\u{1F3E0} Smart Home</h4>
          <p>LEDs controlables por app pueden programarse para simular presencia cuando viajas, mejorando la seguridad.</p>
        </div>

        <h4>LEDs con Sensor</h4>
        <p>Perfectos para pasillos, ba\xF1os y \xE1reas de poco uso. <strong>Encendido autom\xE1tico</strong> solo cuando detectan movimiento.</p>

        <h3>\u{1F4B0} Retorno de Inversi\xF3n</h3>
        <div class="impact-calculator">
          <p><strong>Inversi\xF3n inicial:</strong> $200 MXN por foco LED de calidad</p>
          <p><strong>Ahorro mensual:</strong> $15 MXN por foco reemplazado</p>
          <p><strong>Tiempo de recuperaci\xF3n:</strong> 13 meses</p>
          <p><strong>Ahorro a 10 a\xF1os:</strong> $1,600 MXN por foco</p>
          <p class="total"><strong>ROI: 800% en vida \xFAtil del LED</strong></p>
        </div>

        <div class="warning-box">
          <h4>\u26A0\uFE0F Cuidado con LEDs Baratos</h4>
          <p>LEDs de muy bajo costo suelen fallar r\xE1pido y dar luz de mala calidad. Invierte en marcas reconocidas para obtener los beneficios completos.</p>
        </div>

        <h3>\u{1F31F} Beneficios Adicionales</h3>
        <ul>
          <li><strong>Menos calor:</strong> LEDs no calientan como incandescentes</li>
          <li><strong>Encendido instant\xE1neo:</strong> No necesitan calentarse</li>
          <li><strong>Resistentes:</strong> No se rompen f\xE1cilmente como fluorescentes</li>
          <li><strong>Sin mercurio:</strong> Ambientalmente seguros</li>
        </ul>

        <div class="action-box">
          <h4>\u{1F3AF} Plan de Migraci\xF3n LED</h4>
          <p>Semana 1: Cambia focos m\xE1s usados (sala, cocina). Semana 2: Rec\xE1maras principales. Semana 3: Ba\xF1os y pasillos. Semana 4: \xC1reas exteriores y de poco uso.</p>
        </div>
      </div>
    `,category:"electricidad",imageUrl:"https://arqa.com/wp-content/uploads/2019/06/lamp-2-530x346.jpg",readingTime:1,tags:["LED","iluminaci\xF3n","ahorro energ\xE9tico","smart home"],publishDate:new Date("2025-01-15"),featured:!0},{id:"electricidad-003",slug:"climatizacion-eficiente-aire-acondicionado-calefaccion",title:"Climatizaci\xF3n Inteligente: Confort Perfecto sin Quebrar tu Presupuesto",summary:"Aprende las t\xE9cnicas profesionales para usar aires acondicionados y calefacci\xF3n de forma eficiente, reduciendo hasta 50% el consumo el\xE9ctrico.",content:`
      <div class="article-content">
        <img src="https://www.electricidadexpertos.com/wp-content/uploads/2024/11/Termostato-inteligente-moderno.webp" alt="Sistema de climatizaci\xF3n moderno con control inteligente de temperatura" class="article-image-main">

        <h3>\u{1F321}\uFE0F El Secreto de la Climatizaci\xF3n Eficiente</h3>
        <p>La climatizaci\xF3n representa <strong>40-60% del consumo el\xE9ctrico total</strong> en hogares mexicanos. Una estrategia inteligente puede mantener el confort mientras <strong>reduces el consumo a la mitad</strong>.</p>

        <div class="alert-box">
          <h4>\u{1F525} Dato Impactante</h4>
          <p>Cada grado de diferencia en el termostato puede aumentar o disminuir el consumo el\xE9ctrico entre 6-8%. \xA1La temperatura correcta es oro!</p>
        </div>

        <h3>\u2744\uFE0F Aire Acondicionado: Estrategias de Eficiencia</h3>
        <img src="https://inverter.mx/wp-content/uploads/2021/05/tecnologia-ecologica-de-Inverter-3.jpg" alt="Aire acondicionado tipo inverter con display de temperatura" class="article-image">

        <h4>La Regla de Oro: 24-25\xB0C</h4>
        <p>La temperatura ideal para aire acondicionado es <strong>24-25\xB0C</strong>. Cada grado menos significa 8% m\xE1s consumo:</p>

        <div class="savings-table">
          <p><strong>22\xB0C:</strong> $1,500 MXN/mes (100% consumo)</p>
          <p><strong>24\xB0C:</strong> $1,200 MXN/mes (20% ahorro)</p>
          <p><strong>25\xB0C:</strong> $1,050 MXN/mes (30% ahorro)</p>
          <p><strong>26\xB0C:</strong> $900 MXN/mes (40% ahorro)</p>
        </div>

        <h4>Tecnolog\xEDa Inverter vs. Convencional</h4>
        <ul>
          <li><strong>Inverter:</strong> Ajusta velocidad del compresor gradualmente</li>
          <li><strong>Convencional:</strong> Solo enciende/apaga a m\xE1xima potencia</li>
          <li><strong>Ahorro Inverter:</strong> 30-50% menos consumo</li>
          <li><strong>Recuperaci\xF3n de inversi\xF3n:</strong> 2-3 a\xF1os</li>
        </ul>

        <h3>\u{1F3E0} Estrategias de Enfriamiento Inteligente</h3>

        <h4>Pre-enfriamiento Nocturno</h4>
        <div class="tip-box">
          <h4>\u{1F4B0} Truco de Tarifa El\xE9ctrica</h4>
          <p>En tarifa DAC, pre-enfr\xEDa tu casa de 22:00 a 6:00 (tarifa intermedia) para mantener frescura durante horas pico.</p>
        </div>

        <h4>Zonificaci\xF3n Inteligente</h4>
        <img src="https://static.casadomo.com/media/2016/12/20130218-airzone-cilmatizacion.jpg" alt="Plano de casa mostrando zonificaci\xF3n de climatizaci\xF3n" class="article-image">
        <ul>
          <li><strong>Enfr\xEDa solo \xE1reas ocupadas:</strong> Cierra puertas de habitaciones vac\xEDas</li>
          <li><strong>Minisplits individuales:</strong> Control independiente por zona</li>
          <li><strong>Ventiladores de apoyo:</strong> Permiten subir 2-3\xB0C el termostato</li>
        </ul>

        <h3>\u{1F32C}\uFE0F Ventilaci\xF3n Natural Estrat\xE9gica</h3>
        <p>Combinar ventilaci\xF3n natural con aire acondicionado <strong>multiplica la eficiencia</strong>:</p>

        <h4>Ventilaci\xF3n Cruzada</h4>
        <ol>
          <li><strong>Apaga A/C en la madrugada</strong> (3:00-6:00 AM)</li>
          <li><strong>Abre ventanas opuestas</strong> para crear corriente</li>
          <li><strong>Usa ventiladores</strong> para acelerar intercambio de aire</li>
          <li><strong>Cierra antes del amanecer</strong> para conservar frescura</li>
        </ol>

        <h4>Ventiladores de Techo Inteligentes</h4>
        <div class="action-box">
          <h4>\u26A1 Combinaci\xF3n Perfecta</h4>
          <p>Ventilador de techo (75W) + A/C a 26\xB0C = mismo confort que A/C solo a 23\xB0C, pero 40% menos consumo.</p>
        </div>

        <h3>\u{1F527} Mantenimiento para M\xE1xima Eficiencia</h3>

        <h4>Limpieza de Filtros</h4>
        <img src="https://blog.bauhaus.es/wp-content/uploads/2023/07/limpiar-filtros-aire-acondicionado2.jpg" alt="Proceso de limpieza de filtros de aire acondicionado" class="article-image">
        <ul>
          <li><strong>Frecuencia:</strong> Cada 2-4 semanas en temporada alta</li>
          <li><strong>Impacto:</strong> Filtros sucios aumentan consumo 15-25%</li>
          <li><strong>Proceso:</strong> Agua tibia + jab\xF3n neutro, secar completamente</li>
        </ul>

        <h4>Revisi\xF3n del Condensador Exterior</h4>
        <ul>
          <li><strong>Limpieza:</strong> Retira hojas, polvo y obstrucciones</li>
          <li><strong>Sombra:</strong> Protege de sol directo si es posible</li>
          <li><strong>Espacio libre:</strong> Mant\xE9n 60cm m\xEDnimo alrededor</li>
        </ul>

        <h3>\u{1F3E1} Aislamiento T\xE9rmico: La Base de la Eficiencia</h3>

        <h4>Puntos Cr\xEDticos de P\xE9rdida de Fr\xEDo</h4>
        <div class="inspection-grid">
          <div class="zone">
            <strong>\u{1F6AA} Puertas y Ventanas:</strong> 30-40% de p\xE9rdidas. Revisa sellos y empaques.
          </div>
          <div class="zone">
            <strong>\u{1F3E0} Techo:</strong> 25% de p\xE9rdidas. Aislamiento t\xE9rmico o pintura reflectiva.
          </div>
          <div class="zone">
            <strong>\u{1F9F1} Paredes:</strong> 20% de p\xE9rdidas. Cortinas t\xE9rmicas en ventanas principales.
          </div>
        </div>

        <h4>Soluciones de Bajo Costo</h4>
        <ul>
          <li><strong>Pel\xEDcula reflectiva en ventanas:</strong> $200 MXN, 20% menos calor</li>
          <li><strong>Cortinas t\xE9rmicas:</strong> $500 MXN, 15% menos consumo</li>
          <li><strong>Selladores de puertas:</strong> $100 MXN, 10% ahorro</li>
          <li><strong>Plantas en exterior:</strong> Gratis, 5-8% reducci\xF3n de temperatura</li>
        </ul>

        <h3>\u{1F31E} Calefacci\xF3n Eficiente (Temporada Fr\xEDa)</h3>

        <h4>Bomba de Calor vs. Resistencias El\xE9ctricas</h4>
        <img src="https://www.geinor.com/wp-content/uploads/2021/12/bombas-de-calor-aerotermia.jpg" alt="Sistema de bomba de calor para calefacci\xF3n eficiente" class="article-image">
        <div class="savings-table">
          <p><strong>Resistencia el\xE9ctrica:</strong> Eficiencia 95% - $2,000 MXN/mes</p>
          <p><strong>Bomba de calor:</strong> Eficiencia 300% - $700 MXN/mes</p>
          <p class="total"><strong>Ahorro con bomba de calor: 65%</strong></p>
        </div>

        <h4>Estrategias de Calefacci\xF3n Inteligente</h4>
        <ul>
          <li><strong>Calefacci\xF3n por zonas:</strong> Solo calienta \xE1reas ocupadas</li>
          <li><strong>Programaci\xF3n:</strong> Reduce temperatura 3-5\xB0C cuando no est\xE9s</li>
          <li><strong>Ropa apropiada:</strong> Vestirse bien permite 2\xB0C menos en termostato</li>
        </ul>

        <h3>\u{1F4F1} Tecnolog\xEDa Inteligente</h3>

        <h4>Termostatos Programables</h4>
        <div class="tip-box">
          <h4>\u{1F916} Automatizaci\xF3n Inteligente</h4>
          <p>Termostatos WiFi aprenden tus horarios y ajustan temperatura autom\xE1ticamente. Ahorro promedio: 15-20%.</p>
        </div>

        <h4>Sensores de Ocupaci\xF3n</h4>
        <ul>
          <li><strong>Detecci\xF3n de presencia:</strong> A/C se ajusta seg\xFAn ocupaci\xF3n</li>
          <li><strong>Apagado autom\xE1tico:</strong> Sin desperdicio en \xE1reas vac\xEDas</li>
          <li><strong>ROI:</strong> Se paga solo en 1-2 a\xF1os</li>
        </ul>

        <h3>\u{1F4B0} Plan de Ahorro Gradual</h3>
        <div class="impact-calculator">
          <p><strong>Mes 1 - Optimizaci\xF3n b\xE1sica:</strong> $300 MXN ahorro</p>
          <p><strong>Mes 2 - Mantenimiento:</strong> $450 MXN ahorro</p>
          <p><strong>Mes 3 - Aislamiento b\xE1sico:</strong> $600 MXN ahorro</p>
          <p><strong>Mes 6 - Ventiladores apoyo:</strong> $750 MXN ahorro</p>
          <p class="total"><strong>Ahorro anual proyectado: $7,200 MXN</strong></p>
        </div>

        <div class="action-box">
          <h4>\u{1F3AF} Plan de Acci\xF3n Inmediata</h4>
          <p>Esta semana: Ajusta termostato a 25\xB0C, limpia filtros, cierra habitaciones no usadas. El pr\xF3ximo mes: Eval\xFAa aislamiento t\xE9rmico y ventilaci\xF3n natural.</p>
        </div>
      </div>
    `,category:"electricidad",imageUrl:"https://img.construnario.com/notiweb/noticias_imagenes/42000/42940_1.jpg?tr=w-1000,h-1000,c-at_max",readingTime:1,tags:["aire acondicionado","climatizaci\xF3n","eficiencia t\xE9rmica","ahorro energ\xE9tico"],publishDate:new Date("2025-01-10"),featured:!0}];var X=[{id:"transporte-001",slug:"transporte-publico-movilidad-sostenible-mexico",title:"Transporte P\xFAblico: Tu Aliado para una Movilidad Sostenible y Econ\xF3mica",summary:"Descubre c\xF3mo el transporte p\xFAblico puede reducir tu huella de carbono hasta 90% mientras ahorras miles de pesos al a\xF1o.",content:`
      <div class="article-content">
        <img src="https://www.capital21.cdmx.gob.mx/noticias/wp-content/uploads/2023/01/Linea12-MetroCDMX-001.jpg" alt="Sistema de metro CDMX" class="article-image-main">

        <h3>\u{1F30D} El Impacto Real del Transporte P\xFAblico</h3>
        <p>Un autob\xFAs puede transportar <strong>40 veces m\xE1s personas que un auto</strong> usando solo 2.5 veces m\xE1s combustible. Elegir transporte p\xFAblico en lugar de auto particular <strong>reduce tu huella de carbono personal hasta 90%</strong> en desplazamientos urbanos.</p>

        <div class="alert-box">
          <h4>\u{1F4CA} Dato Impactante</h4>
          <p>En Ciudad de M\xE9xico, el Metro transporta 5.5 millones de personas diarias con emisiones per c\xE1pita 95% menores que el auto particular.</p>
        </div>

        <h3>\u{1F4B0} Ahorro Econ\xF3mico Dram\xE1tico</h3>
        <img src="https://preview.redd.it/s85hd18klt061.png?auto=webp&s=772b0e66828bd7755298570f5fe945e395f3faf6" alt="Comparativa entre auto particular y transporte p\xFAblico" class="article-image">

        <div class="savings-table">
          <h4>Costo mensual de movilidad (30 km diarios promedio):</h4>
          <p><strong>Auto particular:</strong> $4,500 MXN (gasolina + mantenimiento + seguros)</p>
          <p><strong>Transporte p\xFAblico mixto:</strong> $800 MXN (Metro + autob\xFAs + ocasional Uber)</p>
          <p><strong>Solo transporte p\xFAblico:</strong> $400 MXN (Metro + autob\xFAs + Metrob\xFAs)</p>
          <p class="total"><strong>Ahorro anual: hasta $49,200 MXN</strong></p>
        </div>

        <h3>\u{1F687} Sistemas de Transporte Masivo en M\xE9xico</h3>

        <h4>Metro y Tren Ligero</h4>
        <ul>
          <li><strong>Eficiencia energ\xE9tica:</strong> 95% menos emisiones por pasajero vs. auto</li>
          <li><strong>Velocidad:</strong> Evita tr\xE1fico, tiempos predecibles</li>
          <li><strong>Costo:</strong> $5 MXN por viaje, distancia ilimitada</li>
          <li><strong>Cobertura:</strong> 226 estaciones en CDMX, expansi\xF3n constante</li>
        </ul>

        <h4>Metrob\xFAs y BRT</h4>
        <img src="https://www.metrobus.cdmx.gob.mx/storage/app/media/L5%20buses%20electricos/IMG-20230629-WA0006.jpg" alt="Estaci\xF3n de Metrob\xFAs con autobuses articulados" class="article-image">
        <ul>
          <li><strong>Carriles exclusivos:</strong> Velocidad promedio 18 km/h vs. 8 km/h en tr\xE1fico</li>
          <li><strong>Autobuses articulados:</strong> Capacidad de 160 pasajeros</li>
          <li><strong>Integraci\xF3n:</strong> Conexi\xF3n con Metro y otros sistemas</li>
          <li><strong>Cobertura:</strong> 7 l\xEDneas, 600+ estaciones</li>
        </ul>

        <h4>Autobuses Urbanos</h4>
        <ul>
          <li><strong>Red Integral de Transporte (RIT):</strong> Rutas optimizadas</li>
          <li><strong>Tecnolog\xEDa GPS:</strong> Apps para tiempo real de llegadas</li>
          <li><strong>Modernizaci\xF3n:</strong> Flotilla con tecnolog\xEDa Euro VI</li>
          <li><strong>Costo:</strong> $2-6 MXN seg\xFAn ciudad y distancia</li>
        </ul>

        <h3>\u{1F4F1} Tecnolog\xEDa para Optimizar tu Experiencia</h3>

        <h4>Apps Esenciales de Transporte</h4>
        <div class="tip-box">
          <h4>\u{1F4F2} Apps Recomendadas</h4>
          <ul>
            <li><strong>Moovit:</strong> Rutas multimodales en tiempo real</li>
            <li><strong>Citymapper:</strong> Navegaci\xF3n inteligente urbana</li>
            <li><strong>Mi Transporte:</strong> Info oficial de sistemas locales</li>
          </ul>
        </div>

        <h4>Sistemas de Pago Digital</h4>
        <ul>
          <li><strong>Tarjetas inteligentes:</strong> CDMX Movilidad Integrada</li>
          <li><strong>Pago m\xF3vil:</strong> QR codes y NFC en nuevos sistemas</li>
          <li><strong>Recarga autom\xE1tica:</strong> Evita filas y quedarte sin saldo</li>
        </ul>

        <h3>\u{1F6B4} Integraci\xF3n con Movilidad Activa</h3>

        <h4>Bicicleta + Transporte P\xFAblico</h4>
        <img src="https://gobierno.cdmx.gob.mx/biciestaciona/" alt="Estacionamiento de bicicletas en estaci\xF3n de metro" class="article-image">
        <p>La combinaci\xF3n <strong>bicicleta + transporte p\xFAblico</strong> es la forma m\xE1s eficiente de movilidad urbana:</p>

        <ul>
          <li><strong>Primeros/\xFAltimos kil\xF3metros:</strong> Bici para llegar a estaciones</li>
          <li><strong>Biciestacionamientos:</strong> Seguros en estaciones principales</li>
          <li><strong>Sistemas integrados:</strong> EcoBici conecta con Metro/Metrob\xFAs</li>
          <li><strong>Flexibilidad total:</strong> Combina seg\xFAn necesidades diarias</li>
        </ul>

        <h4>Estrategia de Movilidad Multimodal</h4>
        <div class="action-box">
          <h4>\u{1F3AF} Plan Semanal Inteligente</h4>
          <ul>
            <li><strong>Lunes-Viernes:</strong> Metro/Metrob\xFAs para trabajo (rutas fijas)</li>
            <li><strong>Distancias cortas:</strong> Caminar o bicicleta (menos de 2 km)</li>
            <li><strong>Fines de semana:</strong> Combinar transporte p\xFAblico + bicicleta</li>
            <li><strong>Emergencias:</strong> Uber/taxi solo cuando sea necesario</li>
          </ul>
        </div>

        <h3>\u{1F31F} Beneficios Adicionales del Transporte P\xFAblico</h3>

        <h4>Tiempo Productivo</h4>
        <ul>
          <li><strong>Lectura y estudio:</strong> 2 horas diarias de tiempo "recuperado"</li>
          <li><strong>Trabajo remoto:</strong> WiFi en sistemas modernos</li>
          <li><strong>Descanso:</strong> Menos estr\xE9s que manejar en tr\xE1fico</li>
          <li><strong>Socializaci\xF3n:</strong> Interacci\xF3n humana vs. aislamiento vehicular</li>
        </ul>

        <h4>Salud y Bienestar</h4>
        <div class="tip-box">
          <h4>\u{1F4AA} Beneficio Oculto</h4>
          <p>Usuarios de transporte p\xFAblico caminan promedio 8,000 pasos m\xE1s al d\xEDa que usuarios de auto particular.</p>
        </div>

        <h4>Desarrollo Urbano Sostenible</h4>
        <ul>
          <li><strong>Menos congesti\xF3n:</strong> Cada usuario reduce tr\xE1fico para todos</li>
          <li><strong>Aire m\xE1s limpio:</strong> Menos emisiones urbanas</li>
          <li><strong>Espacios verdes:</strong> Menos estacionamientos = m\xE1s parques</li>
          <li><strong>Comunidades conectadas:</strong> Desarrollo orientado al transporte</li>
        </ul>

        <h3>\u{1F6B6} Caminabilidad y Conectividad</h3>

        <h4>Dise\xF1o de Rutas Inteligentes</h4>
        <img src="https://www.metrobus.cdmx.gob.mx/storage/app/media/uploaded-files/foto_AccesoEstacion_2.jpg" alt="Estaci\xF3n de transporte con accesos peatonales seguros y se\xF1alizaci\xF3n" class="article-image">

        <div class="inspection-grid">
          <div class="zone">
            <strong>\u{1F6B6} Primera/\xDAltima Milla:</strong> Planifica rutas caminables seguras hacia estaciones.
          </div>
          <div class="zone">
            <strong>\u{1F326}\uFE0F Protecci\xF3n Clim\xE1tica:</strong> Considera cubierta para lluvia y sombra.
          </div>
          <div class="zone">
            <strong>\u{1F512} Seguridad:</strong> Elige rutas bien iluminadas y con vigilancia.
          </div>
        </div>

        <h3>\u{1F4C8} Planificaci\xF3n Estrat\xE9gica Personal</h3>

        <h4>An\xE1lisis de Rutas Habituales</h4>
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

        <h3>\u{1F504} Transici\xF3n Gradual del Auto</h3>

        <h4>Plan de Migraci\xF3n de 30 D\xEDas</h4>
        <div class="action-box">
          <h4>\u{1F4C5} Cronograma de Transici\xF3n</h4>
          <p><strong>Semana 1:</strong> Usa transporte p\xFAblico 2 d\xEDas/semana para rutas conocidas</p>
          <p><strong>Semana 2:</strong> Aumenta a 3 d\xEDas, explora apps y rutas alternativas</p>
          <p><strong>Semana 3:</strong> 4 d\xEDas usando transporte p\xFAblico, optimiza rutinas</p>
          <p><strong>Semana 4:</strong> 5 d\xEDas completos, eval\xFAa vender/compartir auto</p>
        </div>

        <h4>Manejo de Objeciones Comunes</h4>
        <ul>
          <li><strong>"Es muy lento":</strong> Cuenta tiempo de puerta a puerta, incluye estacionamiento</li>
          <li><strong>"Es inc\xF3modo":</strong> Prueba diferentes horarios y rutas</li>
          <li><strong>"No es seguro":</strong> Mantente alerta, evita mostrar objetos de valor</li>
          <li><strong>"No llega a mi destino":</strong> Combina con bicicleta o caminata corta</li>
        </ul>

        <h3>\u{1F4B0} C\xE1lculo de Retorno de Inversi\xF3n</h3>
        <div class="impact-calculator">
          <p><strong>Ahorro mensual promedio:</strong> $3,700 MXN</p>
          <p><strong>Ahorro anual:</strong> $44,400 MXN</p>
          <p><strong>Reducci\xF3n CO2:</strong> 2.4 toneladas anuales</p>
          <p><strong>Tiempo productivo ganado:</strong> 500 horas anuales</p>
          <p class="total"><strong>Valor total del cambio: $100,000+ MXN anuales</strong></p>
        </div>

        <h3>\u{1F331} Impacto Ambiental Positivo</h3>
        <ul>
          <li><strong>Reducci\xF3n de emisiones:</strong> 2.4 ton CO2/a\xF1o por persona</li>
          <li><strong>Menos contaminaci\xF3n del aire:</strong> Mejor calidad del aire urbano</li>
          <li><strong>Ruido reducido:</strong> Ciudades m\xE1s silenciosas y vivibles</li>
          <li><strong>Eficiencia energ\xE9tica:</strong> 10x m\xE1s eficiente que auto particular</li>
        </ul>

        <div class="action-box">
          <h4>\u{1F3AF} Plan de Acci\xF3n Esta Semana</h4>
          <p>Descarga apps de transporte, identifica la estaci\xF3n m\xE1s cercana a tu casa y trabajo. Prueba una ruta completa en transporte p\xFAblico este fin de semana.</p>
        </div>
      </div>
    `,category:"transporte",imageUrl:"https://periodicoelorigen.com/wp-content/uploads/2021/03/TRANSPORTE-PUBLCO.jpg",readingTime:1,tags:["transporte p\xFAblico","movilidad sostenible","ahorro econ\xF3mico","metro"],publishDate:new Date("2025-01-18"),featured:!0},{id:"transporte-002",slug:"bicicleta-movilidad-activa-ciudades-sustentables",title:"Revoluci\xF3n sobre Ruedas: La Bicicleta como Motor del Cambio Urbano",summary:"La bicicleta no solo es transporte ecol\xF3gico, es una revoluci\xF3n urbana que mejora tu salud, econom\xEDa y calidad de vida.",content:`
      <div class="article-content">
        <img src="https://img.lajornadamaya.mx/69331616890440vb1.jpeg" alt="Ciclistas en ciclov\xEDa moderna con infraestructura segura" class="article-image-main">

        <h3>\u{1F6B4} La Bicicleta: M\xE1s que Transporte, una Revoluci\xF3n</h3>
        <p>La bicicleta es <strong>el veh\xEDculo m\xE1s eficiente jam\xE1s inventado</strong>. Con solo 100 calor\xEDas puedes recorrer 5 kil\xF3metros, equivalente a la energ\xEDa de una cucharada de az\xFAcar. <strong>Es 50 veces m\xE1s eficiente</strong> energ\xE9ticamente que un auto.</p>

        <div class="tip-box">
          <h4>\u26A1 Eficiencia Asombrosa</h4>
          <p>Un ciclista promedio consume 35 calor\xEDas por kil\xF3metro. Un auto consume el equivalente energ\xE9tico de 1,800 calor\xEDas por kil\xF3metro transportando una persona.</p>
        </div>

        <h3>\u{1F4AA} Beneficios para la Salud</h3>
        <img src="https://blog.parquedelapaz.com/hubfs/pexels-daniel-frank-2248713.jpg" alt="Persona en bicicleta con indicadores de beneficios para la salud" class="article-image">

        <h4>Transformaci\xF3n F\xEDsica Comprobada</h4>
        <ul>
          <li><strong>Ejercicio cardiovascular:</strong> 30 min diarios = 150 min semanales recomendados OMS</li>
          <li><strong>Quema cal\xF3rica:</strong> 400-600 calor\xEDas/hora seg\xFAn intensidad</li>
          <li><strong>Fortalecimiento muscular:</strong> Piernas, core y gl\xFAteos sin impacto</li>
          <li><strong>Mejora respiratoria:</strong> Aumento de capacidad pulmonar 15-20%</li>
        </ul>

        <h4>Beneficios Mentales y Cognitivos</h4>
        <div class="action-box">
          <h4>\u{1F9E0} Ciencia del Bienestar</h4>
          <p>Estudios muestran que ciclistas urbanos reportan 40% menos estr\xE9s y 25% mejor estado de \xE1nimo que conductores de auto.</p>
        </div>

        <ul>
          <li><strong>Reducci\xF3n del estr\xE9s:</strong> Liberaci\xF3n de endorfinas naturales</li>
          <li><strong>Mejor concentraci\xF3n:</strong> Oxigenaci\xF3n cerebral mejorada</li>
          <li><strong>Calidad de sue\xF1o:</strong> Ejercicio regular mejora descanso nocturno</li>
          <li><strong>Autoestima:</strong> Logros f\xEDsicos y autonom\xEDa de movilidad</li>
        </ul>

        <h3>\u{1F4B0} Impacto Econ\xF3mico Personal</h3>

        <h4>Costo Total de Propiedad: Bicicleta vs. Auto</h4>
        <div class="savings-table">
          <p><strong>Bicicleta de calidad (10 a\xF1os):</strong></p>
          <p>\u2022 Compra inicial: $8,000 MXN</p>
          <p>\u2022 Mantenimiento anual: $500 MXN</p>
          <p>\u2022 Accesorios y mejoras: $2,000 MXN total</p>
          <p>\u2022 <strong>Costo total 10 a\xF1os: $15,000 MXN</strong></p>

          <p><strong>Auto econ\xF3mico (10 a\xF1os):</strong></p>
          <p>\u2022 Compra inicial: $250,000 MXN</p>
          <p>\u2022 Combustible anual: $18,000 MXN</p>
          <p>\u2022 Mantenimiento anual: $8,000 MXN</p>
          <p>\u2022 Seguros anuales: $6,000 MXN</p>
          <p>\u2022 Depreciaci\xF3n: $150,000 MXN</p>
          <p>\u2022 <strong>Costo total 10 a\xF1os: $720,000 MXN</strong></p>

          <p class="total"><strong>Ahorro con bicicleta: $705,000 MXN en 10 a\xF1os</strong></p>
        </div>

        <h3>\u{1F6B2} Tipos de Bicicletas para Ciudad</h3>

        <h4>Bicicleta Urbana/Holandesa</h4>
        <img src="https://cdn.shopify.com/s/files/1/0023/2190/7785/files/bicicleta_urbana_rodada_24_7_velocidades_magenta_loving_monk_lateral_1_480x480.jpg?v=1608239333" alt="Bicicleta urbana estilo holand\xE9s con canasta y guardabarros" class="article-image">
        <ul>
          <li><strong>Caracter\xEDsticas:</strong> Posici\xF3n erguida, guardabarros, canasta</li>
          <li><strong>Ideal para:</strong> Trayectos cortos, vestimenta formal, compras</li>
          <li><strong>Ventajas:</strong> Comodidad, bajo mantenimiento, elegante</li>
          <li><strong>Precio:</strong> $4,000-12,000 MXN</li>
        </ul>

        <h4>Bicicleta H\xEDbrida</h4>
        <ul>
          <li><strong>Caracter\xEDsticas:</strong> Mezcla de urbana y deportiva</li>
          <li><strong>Ideal para:</strong> Distancias medias (5-15 km), versatilidad</li>
          <li><strong>Ventajas:</strong> Velocidad + comodidad, m\xFAltiples usos</li>
          <li><strong>Precio:</strong> $6,000-20,000 MXN</li>
        </ul>

        <h4>Bicicleta El\xE9ctrica</h4>
        <ul>
          <li><strong>Caracter\xEDsticas:</strong> Motor el\xE9ctrico de asistencia</li>
          <li><strong>Ideal para:</strong> Distancias largas, pendientes, cualquier edad</li>
          <li><strong>Ventajas:</strong> Llegar sin sudar, superar limitaciones f\xEDsicas</li>
          <li><strong>Precio:</strong> $15,000-50,000 MXN</li>
        </ul>

        <h3>\u{1F6E1}\uFE0F Seguridad y Equipamiento Esencial</h3>

        <h4>Equipo de Protecci\xF3n B\xE1sico</h4>
        <div class="inspection-grid">
          <div class="zone">
            <strong>\u{1FA96} Casco:</strong> Reduce riesgo de lesi\xF3n grave en 70%. Obligatorio para tu seguridad.
          </div>
          <div class="zone">
            <strong>\u{1F4A1} Luces:</strong> Frontal blanca y trasera roja. Esenciales para visibilidad nocturna.
          </div>
          <div class="zone">
            <strong>\u{1F512} Candado:</strong> U-lock de calidad. Invierte 10% del valor de tu bici en seguridad.
          </div>
        </div>

        <h4>Vestimenta y Accesorios</h4>
        <ul>
          <li><strong>Ropa reflectante:</strong> Chaleco o banda reflectiva para mayor visibilidad</li>
          <li><strong>Guantes:</strong> Mejor agarre y protecci\xF3n en ca\xEDdas</li>
          <li><strong>Gafas de protecci\xF3n:</strong> Contra polvo, insectos y viento</li>
          <li><strong>Alforjas/canasta:</strong> Para transportar objetos sin afectar equilibrio</li>
        </ul>

        <h3>\u{1F5FA}\uFE0F Navegaci\xF3n y Rutas Inteligentes</h3>

        <h4>Apps Especializadas para Ciclistas</h4>
        <div class="tip-box">
          <h4>\u{1F4F1} Apps Recomendadas</h4>
          <ul>
            <li><strong>Strava:</strong> Tracking, rutas populares, comunidad</li>
            <li><strong>Komoot:</strong> Planificaci\xF3n de rutas detallada</li>
            <li><strong>Google Maps:</strong> Modo bicicleta con ciclov\xEDas</li>
            <li><strong>EcoBici (CDMX):</strong> Sistema de bicicletas p\xFAblicas</li>
          </ul>
        </div>

        <h4>Estrategias de Ruta Urbana</h4>
        <img src="https://multisenal.com.mx/wp-content/uploads/2024/05/segregada-1024x462.webp" alt="Ciclov\xEDa protegida con separaci\xF3n f\xEDsica del tr\xE1fico vehicular" class="article-image">
        <ul>
          <li><strong>Prioriza ciclov\xEDas:</strong> Aunque sea ruta m\xE1s larga, es m\xE1s segura</li>
          <li><strong>Calles secundarias:</strong> Menos tr\xE1fico = mayor seguridad</li>
          <li><strong>Evita horas pico:</strong> Sal 15 min antes para rutas tranquilas</li>
          <li><strong>Ruta de respaldo:</strong> Siempre ten plan B por clima o cierre</li>
        </ul>

        <h3>\u{1F527} Mantenimiento B\xE1sico</h3>

        <h4>Revisi\xF3n Semanal (5 minutos)</h4>
        <ol>
          <li><strong>Presi\xF3n de llantas:</strong> Revisa con medidor, infla seg\xFAn especificaci\xF3n</li>
          <li><strong>Frenos:</strong> Prueba que respondan antes de cada salida</li>
          <li><strong>Cadena:</strong> Debe estar lubricada y sin \xF3xido</li>
          <li><strong>Luces:</strong> Verifica que funcionen y tengan bater\xEDa</li>
        </ol>

        <h4>Mantenimiento Mensual</h4>
        <ul>
          <li><strong>Limpieza general:</strong> Agua, jab\xF3n y cepillo suave</li>
          <li><strong>Lubricaci\xF3n de cadena:</strong> Aceite espec\xEDfico para bicicletas</li>
          <li><strong>Ajuste de frenos:</strong> Asegurar respuesta \xF3ptima</li>
          <li><strong>Revisi\xF3n de tornillos:</strong> Verificar que est\xE9n apretados</li>
        </ul>

        <div class="action-box">
          <h4>\u{1F6E0}\uFE0F Kit de Herramientas B\xE1sico</h4>
          <p>Llaves allen, bomba port\xE1til, kit de parches, lubricante de cadena. Inversi\xF3n: $800 MXN, ahorro en mec\xE1nico: $3,000+ MXN anuales.</p>
        </div>

        <h3>\u{1F306} Integraci\xF3n con Sistemas Urbanos</h3>

        <h4>Bicicletas P\xFAblicas</h4>
        <ul>
          <li><strong>EcoBici (CDMX):</strong> 480+ estaciones, $461 MXN anuales</li>
          <li><strong>MiBici (Guadalajara):</strong> 242 estaciones, $365 MXN anuales</li>
          <li><strong>Pobla Bike (Puebla):</strong> 80 estaciones integradas con transporte</li>
        </ul>

        <h4>Intermodalidad Inteligente</h4>
        <div class="habit-grid">
          <div class="habit-item">
            <strong>Bici + Metro:</strong> Bicicleta plegable en vagones permitidos (horarios espec\xEDficos)
          </div>
          <div class="habit-item">
            <strong>Bici + Oficina:</strong> Estacionamientos seguros, vestidores, duchas disponibles
          </div>
        </div>

        <h3>\u{1F30D} Impacto Ambiental Transformador</h3>

        <h4>Huella de Carbono</h4>
        <div class="impact-calculator">
          <p><strong>Auto 10 km diarios:</strong> 1.2 ton CO2/a\xF1o</p>
          <p><strong>Bicicleta 10 km diarios:</strong> 0.05 ton CO2/a\xF1o (fabricaci\xF3n)</p>
          <p><strong>Reducci\xF3n neta:</strong> 1.15 ton CO2/a\xF1o = 95% menos emisiones</p>
          <p class="total"><strong>Equivale a plantar 26 \xE1rboles anuales</strong></p>
        </div>

        <h4>Beneficios Urbanos Colectivos</h4>
        <ul>
          <li><strong>Menos congesti\xF3n:</strong> Una bici ocupa espacio de 0.1 autos</li>
          <li><strong>Aire m\xE1s limpio:</strong> Cero emisiones locales</li>
          <li><strong>Menos ruido:</strong> Ciudades m\xE1s silenciosas y vivibles</li>
          <li><strong>Espacios liberados:</strong> Menos estacionamientos = m\xE1s \xE1reas verdes</li>
        </ul>

        <h3>\u{1F465} Construyendo Comunidad Ciclista</h3>

        <h4>Grupos y Eventos</h4>
        <img src="https://almomento.mx/wp-content/uploads/2022/09/Paseo-dominical-CDMX.jpeg" alt="Grupo de ciclistas urbanos en rodada dominical" class="article-image">
        <ul>
          <li><strong>Rodadas familiares:</strong> Domingos sin coches, eventos masivos</li>
          <li><strong>Grupos de trabajo:</strong> Organiza con compa\xF1eros para ir juntos</li>
          <li><strong>Clubes locales:</strong> Conecta con comunidad ciclista de tu zona</li>
          <li><strong>Advocacy:</strong> Participa en promover infraestructura ciclista</li>
        </ul>

        <div class="action-box">
          <h4>\u{1F3AF} Tu Primer Mes en Bicicleta</h4>
          <p>Semana 1: Compra/renta bici y equipo b\xE1sico. Semana 2: Practica rutas cortas fin de semana. Semana 3: Un d\xEDa laboral en bici. Semana 4: Tres d\xEDas semanales, eval\xFAa rutina.</p>
        </div>
      </div>
    `,category:"transporte",imageUrl:"https://media.gq.com.mx/photos/66258cfeea8c4e44c447b630/3:2/w_3000,h_2000,c_limit/hombre%20en%20bici%20en%20un%20parque.jpg",readingTime:1,tags:["bicicleta","ciclismo urbano","movilidad activa","salud"],publishDate:new Date("2025-01-12"),featured:!0},{id:"transporte-003",slug:"vehiculos-electricos-hibridos-futuro-movilidad-limpia",title:"Revoluci\xF3n El\xE9ctrica: Veh\xEDculos del Futuro que Puedes Tener Hoy",summary:"Los veh\xEDculos el\xE9ctricos e h\xEDbridos no son el futuro, son el presente. Descubre c\xF3mo pueden transformar tu movilidad y econom\xEDa.",content:`
      <div class="article-content">
        <img src="https://cdn.shortpixel.ai/spai/w_840+q_lossy+ret_img+to_webp/zacua.com/wp-content/uploads/2025/03/ZB67-estaciones-de-carga-zacua.jpg" alt="Estaci\xF3n de carga para veh\xEDculos el\xE9ctricos con autos modernos" class="article-image-main">

        <h3>\u26A1 La Revoluci\xF3n El\xE9ctrica ya Lleg\xF3</h3>
        <p>Los veh\xEDculos el\xE9ctricos (VE) han alcanzado <strong>paridad de costos con veh\xEDculos convencionales</strong> en muchos mercados. En 2024, el costo por kil\xF3metro de un VE es <strong>70% menor</strong> que un auto de gasolina en M\xE9xico.</p>

        <div class="alert-box">
          <h4>\u{1F50B} Punto de Inflexi\xF3n</h4>
          <p>En 2024, los VE representan 15% de ventas globales. Para 2030, se proyecta que ser\xE1 50%. M\xE9xico ya tiene m\xE1s de 100,000 veh\xEDculos el\xE9ctricos circulando.</p>
        </div>

        <h3>\u{1F4A1} Tipos de Veh\xEDculos de Nueva Generaci\xF3n</h3>

        <h4>Veh\xEDculos El\xE9ctricos Puros (BEV)</h4>
        <img src="https://s1.elespanol.com/2022/09/21/omicrono/tecnologia/704940211_227372882_1024x576.jpg" alt="Veh\xEDculo el\xE9ctrico puro conectado a estaci\xF3n de carga" class="article-image">
        <ul>
          <li><strong>Propulsi\xF3n:</strong> 100% el\xE9ctrica, cero emisiones locales</li>
          <li><strong>Autonom\xEDa:</strong> 200-500 km por carga seg\xFAn modelo</li>
          <li><strong>Carga:</strong> Casa (6-8 horas) o r\xE1pida (30-60 min)</li>
          <li><strong>Ejemplos:</strong> Nissan Leaf, Tesla Model 3, BYD Dolphin</li>
          <li><strong>Precio:</strong> $450,000-1,200,000 MXN</li>
        </ul>

        <h4>Veh\xEDculos H\xEDbridos (HEV)</h4>
        <ul>
          <li><strong>Propulsi\xF3n:</strong> Motor gasolina + el\xE9ctrico, sin enchufe</li>
          <li><strong>Eficiencia:</strong> 40-50% menos combustible que convencional</li>
          <li><strong>Autonom\xEDa:</strong> 800-1000 km con tanque lleno</li>
          <li><strong>Ejemplos:</strong> Toyota Prius, Honda Insight, Ford Fusion Hybrid</li>
          <li><strong>Precio:</strong> $350,000-700,000 MXN</li>
        </ul>

        <h4>H\xEDbridos Enchufables (PHEV)</h4>
        <ul>
          <li><strong>Propulsi\xF3n:</strong> El\xE9ctrico + gasolina, carga externa</li>
          <li><strong>Modo el\xE9ctrico:</strong> 30-80 km sin usar gasolina</li>
          <li><strong>Versatilidad:</strong> El\xE9ctrico ciudad, gasolina carretera</li>
          <li><strong>Ejemplos:</strong> Toyota Prius Prime, Mitsubishi Outlander PHEV</li>
          <li><strong>Precio:</strong> $500,000-900,000 MXN</li>
        </ul>

        <h3>\u{1F4B0} An\xE1lisis Econ\xF3mico Real</h3>

        <h4>Costo Total de Propiedad (5 a\xF1os)</h4>
        <div class="savings-table">
          <p><strong>Veh\xEDculo Gasolina Compacto:</strong></p>
          <p>\u2022 Precio inicial: $300,000 MXN</p>
          <p>\u2022 Combustible (20,000 km/a\xF1o): $90,000 MXN</p>
          <p>\u2022 Mantenimiento: $45,000 MXN</p>
          <p>\u2022 Seguro: $30,000 MXN</p>
          <p>\u2022 <strong>Total 5 a\xF1os: $465,000 MXN</strong></p>

          <p><strong>Veh\xEDculo El\xE9ctrico Equivalente:</strong></p>
          <p>\u2022 Precio inicial: $450,000 MXN</p>
          <p>\u2022 Electricidad (20,000 km/a\xF1o): $27,000 MXN</p>
          <p>\u2022 Mantenimiento: $15,000 MXN</p>
          <p>\u2022 Seguro: $25,000 MXN</p>
          <p>\u2022 <strong>Total 5 a\xF1os: $517,000 MXN</strong></p>

          <p class="total"><strong>Diferencia: $52,000 MXN m\xE1s costoso el VE</strong></p>
          <p><em>*Pero con incentivos fiscales, el VE puede ser m\xE1s econ\xF3mico</em></p>
        </div>

        <h3>\u{1F50C} Infraestructura de Carga en M\xE9xico</h3>

        <h4>Red Nacional de Carga</h4>
        <img src="https://mexicoindustry.com/admin/images/notas/2024/11/SnLbNmv5jo61Ls5Lm2oLDsmFjZ07GTqbkecQXTqN.jpg" alt="Mapa de estaciones de carga para veh\xEDculos el\xE9ctricos en M\xE9xico" class="article-image">
        <ul>
          <li><strong>Estaciones p\xFAblicas:</strong> 1,200+ puntos en todo el pa\xEDs</li>
          <li><strong>Carga r\xE1pida:</strong> 300+ estaciones DC de alta potencia</li>
          <li><strong>Centros comerciales:</strong> Walmart, Liverpool, Costco instalan cargadores</li>
          <li><strong>Hoteles:</strong> Cadenas premium ofrecen carga gratuita</li>
        </ul>

        <h4>Carga Domiciliaria</h4>
        <div class="tip-box">
          <h4>\u{1F3E0} Carga en Casa</h4>
          <p>80% de cargas se realizan en casa. Una toma de 220V carga completamente un VE promedio en 6-8 horas durante la noche.</p>
        </div>

        <ul>
          <li><strong>Instalaci\xF3n b\xE1sica:</strong> $8,000-15,000 MXN (toma 220V)</li>
          <li><strong>Cargador inteligente:</strong> $25,000-40,000 MXN</li>
          <li><strong>Costo por kWh:</strong> $2.50-4.50 MXN seg\xFAn tarifa CFE</li>
          <li><strong>Carga nocturna:</strong> Tarifas preferenciales disponibles</li>
        </ul>

        <h3>\u{1F331} Impacto Ambiental Real</h3>

        <h4>Emisiones Ciclo de Vida Completo</h4>
        <div class="impact-calculator">
          <p><strong>Auto gasolina (fabricaci\xF3n + uso):</strong> 4.2 ton CO2/a\xF1o</p>
          <p><strong>Auto el\xE9ctrico (fabricaci\xF3n + electricidad CFE):</strong> 1.8 ton CO2/a\xF1o</p>
          <p><strong>Auto el\xE9ctrico + energ\xEDa solar:</strong> 0.3 ton CO2/a\xF1o</p>
          <p class="total"><strong>Reducci\xF3n: 57-93% menos emisiones</strong></p>
        </div>

        <h4>Calidad del Aire Urbano</h4>
        <ul>
          <li><strong>Cero emisiones locales:</strong> No produce gases en punto de uso</li>
          <li><strong>Menor ruido:</strong> 50% menos contaminaci\xF3n ac\xFAstica</li>
          <li><strong>Efecto multiplicador:</strong> Cada VE mejora aire para todos</li>
          <li><strong>Salud p\xFAblica:</strong> Menos enfermedades respiratorias urbanas</li>
        </ul>

        <h3>\u{1F527} Mantenimiento y Confiabilidad</h3>

        <h4>Ventajas de Mantenimiento VE</h4>
        <img src="https://media.licdn.com/dms/image/v2/C4D12AQEFnaQAoS7omg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1587369788505?e=2147483647&v=beta&t=QgbedwqK6VMKIPuWheeWJYdnsk6rumxiS-YbGjfVCXQ" alt="Comparaci\xF3n de componentes: motor el\xE9ctrico vs motor de combusti\xF3n" class="article-image">
        <ul>
          <li><strong>Menos piezas m\xF3viles:</strong> Motor el\xE9ctrico tiene 20 piezas vs. 2,000 del motor gasolina</li>
          <li><strong>Sin cambios de aceite:</strong> Ahorro $3,000 MXN anuales</li>
          <li><strong>Frenos duran m\xE1s:</strong> Frenado regenerativo reduce desgaste</li>
          <li><strong>Sin filtros:</strong> Aire, combustible, aceite no necesarios</li>
        </ul>

        <h4>Vida \xDAtil de Bater\xEDas</h4>
        <div class="action-box">
          <h4>\u{1F50B} Realidad de las Bater\xEDas</h4>
          <p>Bater\xEDas modernas mantienen 80% capacidad despu\xE9s de 8 a\xF1os/150,000 km. Garant\xEDas t\xEDpicas: 8 a\xF1os/160,000 km.</p>
        </div>

        <ul>
          <li><strong>Degradaci\xF3n normal:</strong> 2-3% anual en condiciones normales</li>
          <li><strong>Factores que afectan:</strong> Calor extremo, carga r\xE1pida constante</li>
          <li><strong>Reciclaje:</strong> 95% materiales recuperables</li>
          <li><strong>Segunda vida:</strong> Bater\xEDas usadas para almacenamiento estacionario</li>
        </ul>

        <h3>\u{1F697} Consideraciones de Compra</h3>

        <h4>\xBFEst\xE1s Listo para un VE?</h4>
        <div class="inspection-grid">
          <div class="zone">
            <strong>\u{1F3E0} Vivienda:</strong> \xBFTienes d\xF3nde instalar cargador domiciliario?
          </div>
          <div class="zone">
            <strong>\u{1F6E3}\uFE0F Uso Diario:</strong> \xBFRecorres menos de 200 km diarios regularmente?
          </div>
          <div class="zone">
            <strong>\u{1F50C} Infraestructura:</strong> \xBFHay cargadores en tus rutas frecuentes?
          </div>
        </div>

        <h4>Perfil Ideal para VE</h4>
        <ul>
          <li><strong>Uso urbano/suburbano:</strong> 80% trayectos dentro de la ciudad</li>
          <li><strong>Rutinas predecibles:</strong> Casa-trabajo-casa con estacionamiento</li>
          <li><strong>Segundo auto:</strong> Para viajes largos ocasionales usar otro veh\xEDculo</li>
          <li><strong>Conciencia ambiental:</strong> Valorar beneficios m\xE1s all\xE1 del econ\xF3mico</li>
        </ul>

        <h3>\u26A1 Veh\xEDculos El\xE9ctricos Ligeros</h3>

        <h4>Scooters y Motocicletas El\xE9ctricas</h4>
        <img src="https://i0.wp.com/kalot.com.mx/site/wp-content/uploads/2018/10/scooters-lime-mexico-cdmx.jpg?resize=800%2C500&ssl=1" alt="Scooter el\xE9ctrico moderno estacionado en \xE1rea urbana" class="article-image">
        <ul>
          <li><strong>Precio accesible:</strong> $15,000-80,000 MXN</li>
          <li><strong>Autonom\xEDa:</strong> 50-150 km por carga</li>
          <li><strong>Carga f\xE1cil:</strong> Bater\xEDa removible, carga en casa</li>
          <li><strong>Ideal para:</strong> Trayectos 5-30 km, entrega a domicilio</li>
        </ul>

        <h4>Patinetes y Bicicletas El\xE9ctricas</h4>
        <ul>
          <li><strong>Micro-movilidad:</strong> Perfecta para \xFAltimos kil\xF3metros</li>
          <li><strong>Sin licencia:</strong> Algunos modelos no requieren registro</li>
          <li><strong>Estacionamiento:</strong> Se guardan en casa u oficina</li>
          <li><strong>Combinaci\xF3n perfecta:</strong> Transporte p\xFAblico + VE ligero</li>
        </ul>

        <h3>\u{1F3DB}\uFE0F Incentivos y Pol\xEDticas P\xFAblicas</h3>

        <h4>Beneficios Fiscales Actuales</h4>
        <div class="tip-box">
          <h4>\u{1F4B8} Incentivos Disponibles</h4>
          <ul>
            <li><strong>Deducci\xF3n de impuestos:</strong> 100% deducible para empresas</li>
            <li><strong>No verificaci\xF3n:</strong> Exento en Ciudad de M\xE9xico</li>
            <li><strong>Hoy No Circula:</strong> Exento permanentemente</li>
            <li><strong>Estacionamiento:</strong> Gratuito en algunos centros comerciales</li>
          </ul>
        </div>

        <h4>Programas de Financiamiento</h4>
        <ul>
          <li><strong>Bancos especializados:</strong> Cr\xE9ditos preferenciales para VE</li>
          <li><strong>Leasing:</strong> Renta con opci\xF3n a compra</li>
          <li><strong>Programas gubernamentales:</strong> Apoyos para taxis y fleets</li>
        </ul>

        <h3>\u{1F52E} Futuro de la Movilidad El\xE9ctrica</h3>

        <h4>Tendencias 2025-2030</h4>
        <ul>
          <li><strong>Precios:</strong> Paridad total con gasolina para 2027</li>
          <li><strong>Autonom\xEDa:</strong> 600+ km est\xE1ndar en nuevos modelos</li>
          <li><strong>Carga ultra-r\xE1pida:</strong> 10-80% en 10 minutos</li>
          <li><strong>Bater\xEDas s\xF3lidas:</strong> Mayor densidad, carga m\xE1s r\xE1pida</li>
        </ul>

        <h4>Infraestructura Nacional</h4>
        <div class="action-box">
          <h4>\u{1F4C8} Proyecci\xF3n 2030</h4>
          <p>M\xE9xico planea 10,000+ estaciones de carga p\xFAblica y 2 millones de VE circulando para 2030.</p>
        </div>

        <h3>\u{1F6E3}\uFE0F Planificaci\xF3n de Viajes con VE</h3>

        <h4>Apps Esenciales</h4>
        <ul>
          <li><strong>PlugShare:</strong> Mapa global de cargadores con rese\xF1as</li>
          <li><strong>Electromaps:</strong> Navegaci\xF3n optimizada para VE</li>
          <li><strong>ChargePoint:</strong> Red de carga con reservaci\xF3n</li>
          <li><strong>Tesla Supercharger:</strong> Red exclusiva pero expandi\xE9ndose</li>
        </ul>

        <h4>Estrategias de Viaje Largo</h4>
        <ol>
          <li><strong>Planifica con buffer:</strong> 20% reserva de bater\xEDa</li>
          <li><strong>Identifica cargadores backup:</strong> Alternativas en ruta</li>
          <li><strong>Aprovecha tiempos de carga:</strong> Comidas, descansos</li>
          <li><strong>Precarga en destino:</strong> Verifica disponibilidad antes</li>
        </ol>

        <h3>\u{1F4A1} Consejos para Maximizar Eficiencia</h3>

        <h4>T\xE9cnicas de Conducci\xF3n Eficiente</h4>
        <ul>
          <li><strong>One-pedal driving:</strong> Usa frenado regenerativo m\xE1ximo</li>
          <li><strong>Precalentamiento:</strong> Acondiciona bater\xEDa antes de salir</li>
          <li><strong>Eco mode:</strong> Maximiza autonom\xEDa en ciudad</li>
          <li><strong>Planificaci\xF3n de ruta:</strong> Evita pendientes innecesarias</li>
        </ul>

        <div class="impact-calculator">
          <p><strong>Ahorro anual vs. gasolina:</strong> $63,000 MXN</p>
          <p><strong>Reducci\xF3n CO2:</strong> 2.4 toneladas anuales</p>
          <p><strong>Mantenimiento ahorrado:</strong> $8,000 MXN anuales</p>
          <p><strong>Tiempo en gasolineras:</strong> 0 horas (carga en casa)</p>
          <p class="total"><strong>Valor total del cambio: $71,000+ MXN anuales</strong></p>
        </div>

        <div class="action-box">
          <h4>\u{1F3AF} Tu Ruta hacia la Movilidad El\xE9ctrica</h4>
          <p>Eval\xFAa tus patrones de manejo esta semana. Prueba manejo un VE en concesionaria. Calcula instalaci\xF3n de cargador en casa. Considera h\xEDbrido como transici\xF3n.</p>
        </div>
      </div>
    `,category:"transporte",imageUrl:"https://wieck-nissanao-production.s3.amazonaws.com/photos/50c8ec09fd1760b72a1296024674ee837d95e207/preview-928x522.jpg",readingTime:1,tags:["veh\xEDculos el\xE9ctricos","movilidad limpia","tecnolog\xEDa","sostenibilidad"],publishDate:new Date("2025-01-08"),featured:!0}];var B=class r{STATS_STORAGE_KEY="ecotracker_education_stats";COMPLETED_STORAGE_KEY="ecotracker_completed_articles";articlesCache=new Map;constructor(){this.initializeArticlesCache()}initializeArticlesCache(){this.articlesCache.set("agua",N),this.articlesCache.set("electricidad",z),this.articlesCache.set("transporte",X),this.updateCategoryArticleCounts()}updateCategoryArticleCounts(){Object.keys(m).forEach(e=>{let a=e,t=this.articlesCache.get(a)||[];m[a].articleCount=t.length})}getArticlesByCategory(e){return v(this,null,function*(){let a=this.articlesCache.get(e)||[];return Promise.resolve([...a])})}getArticleBySlug(e,a){return v(this,null,function*(){let i=(yield this.getArticlesByCategory(e)).find(o=>o.slug===a);return Promise.resolve(i||null)})}getFeaturedArticles(e=6){return v(this,null,function*(){let a=[];for(let i of Object.keys(m)){let o=yield this.getArticlesByCategory(i);a.push(...o)}let t=a.filter(i=>i.featured).sort((i,o)=>new Date(o.publishDate).getTime()-new Date(i.publishDate).getTime()).slice(0,e);return Promise.resolve(t)})}getPopularArticles(e=5){return v(this,null,function*(){let a=[],t=this.getArticleStats();for(let o of Object.keys(m)){let n=yield this.getArticlesByCategory(o);a.push(...n)}let i=a.map(o=>({article:o,views:t[o.id]?.views||0,lastViewed:t[o.id]?.lastViewed||new Date(0)})).sort((o,n)=>o.views!==n.views?n.views-o.views:n.lastViewed.getTime()-o.lastViewed.getTime()).slice(0,e).map(o=>o.article);return Promise.resolve(i)})}getArticles(){return v(this,arguments,function*(e={}){let a=[];if(e.category)a=yield this.getArticlesByCategory(e.category);else for(let t of Object.keys(m)){let i=yield this.getArticlesByCategory(t);a.push(...i)}return e.featured!==void 0&&(a=a.filter(t=>t.featured===e.featured)),e.tags&&e.tags.length>0&&(a=a.filter(t=>e.tags.some(i=>t.tags.includes(i)))),a.sort((t,i)=>new Date(i.publishDate).getTime()-new Date(t.publishDate).getTime()),e.limit&&e.limit>0&&(a=a.slice(0,e.limit)),Promise.resolve({articles:a,totalCount:a.length,categories:Object.values(m)})})}getArticleNavigation(e){return v(this,null,function*(){let a=null,t=null;for(let d of Object.keys(m)){let y=(yield this.getArticlesByCategory(d)).find($=>$.id===e);if(y){a=y,t=d;break}}if(!a||!t)return Promise.resolve(null);let i=yield this.getArticlesByCategory(t),o=i.findIndex(d=>d.id===e),n=o>0?i[o-1]:void 0,h=o<i.length-1?i[o+1]:void 0,p=i.filter(d=>d.id!==e).slice(0,3);return Promise.resolve({current:a,previous:n,next:h,relatedArticles:p})})}recordArticleView(e){let a=this.getArticleStats();a[e]||(a[e]={articleId:e,views:0,lastViewed:new Date,timeSpent:0,completed:!1}),a[e].views+=1,a[e].lastViewed=new Date,this.saveArticleStats(a)}recordReadingTime(e,a,t=!1){let i=this.getArticleStats();i[e]||(i[e]={articleId:e,views:0,lastViewed:new Date,timeSpent:0,completed:!1}),i[e].timeSpent+=a,t&&(i[e].completed=!0),this.saveArticleStats(i)}markArticleAsCompleted(e){let a=this.getArticleStats();a[e]&&(a[e].completed=!0,this.saveArticleStats(a));let t=this.getCompletedArticles();t.includes(e)||(t.push(e),this.saveCompletedArticles(t))}getArticleStats(){try{let e=localStorage.getItem(this.STATS_STORAGE_KEY);if(e){let a=JSON.parse(e);return Object.values(a).forEach(t=>{t.lastViewed=new Date(t.lastViewed)}),a}}catch(e){console.warn("Error loading article stats from localStorage:",e)}return{}}saveArticleStats(e){try{localStorage.setItem(this.STATS_STORAGE_KEY,JSON.stringify(e))}catch(a){console.warn("Error saving article stats to localStorage:",a)}}getCompletedArticles(){try{let e=localStorage.getItem(this.COMPLETED_STORAGE_KEY);return e?JSON.parse(e):[]}catch(e){return console.warn("Error loading completed articles from localStorage:",e),[]}}saveCompletedArticles(e){try{localStorage.setItem(this.COMPLETED_STORAGE_KEY,JSON.stringify(e))}catch(a){console.warn("Error saving completed articles to localStorage:",a)}}isArticleCompleted(e){return this.getCompletedArticles().includes(e)}getReadingStatistics(){let e=this.getArticleStats(),a=this.getCompletedArticles(),t=Object.keys(e).length,i=Object.values(e).reduce((d,b)=>d+b.timeSpent,0),o=a.length,n={agua:{read:0,completed:0},electricidad:{read:0,completed:0},transporte:{read:0,completed:0}};for(let[d,b]of Object.entries(e)){let y=this.getArticleCategoryById(d);y&&(n[y].read++,b.completed&&n[y].completed++)}let h=null,p=0;return Object.entries(n).forEach(([d,b])=>{b.read>p&&(p=b.read,h=d)}),{totalArticlesRead:t,totalTimeSpent:i,completedArticles:o,favoriteCategory:h,categoryStats:n}}getArticleCategoryById(e){for(let[a,t]of this.articlesCache.entries())if(t.find(i=>i.id===e))return a;return null}searchArticles(e,a){return v(this,null,function*(){if(!e.trim())return[];let t=e.toLowerCase().trim(),i=[];if(a)i=yield this.getArticlesByCategory(a);else for(let o of Object.keys(m)){let n=yield this.getArticlesByCategory(o);i.push(...n)}return i.filter(o=>{let n=o.title.toLowerCase().includes(t),h=o.summary.toLowerCase().includes(t),p=o.tags.some(d=>d.toLowerCase().includes(t));return n||h||p})})}getRecommendedArticles(e=5){return v(this,null,function*(){let a=this.getArticleStats(),t=this.getReadingStatistics();if(t.totalArticlesRead===0)return this.getFeaturedArticles(e);let i=[];for(let p of Object.keys(m)){let d=yield this.getArticlesByCategory(p);i.push(...d)}let o=i.filter(p=>!a[p.id]),n=[];if(t.favoriteCategory){let p=o.filter(d=>d.category===t.favoriteCategory);n.push(...p.slice(0,Math.ceil(e*.6)))}let h=e-n.length;if(h>0){let p=o.filter(d=>!n.includes(d));n.push(...p.slice(0,h))}return n})}getCategoryProgress(){let e=this.getReadingStatistics(),a={agua:{read:0,total:0,percentage:0},electricidad:{read:0,total:0,percentage:0},transporte:{read:0,total:0,percentage:0}};return Object.keys(m).forEach(t=>{let i=t,o=this.articlesCache.get(i)||[],n=e.categoryStats[i];a[i]={read:n.read,total:o.length,percentage:o.length>0?Math.round(n.read/o.length*100):0}}),a}exportReadingData(){return{stats:this.getArticleStats(),completed:this.getCompletedArticles(),exportDate:new Date().toISOString()}}importReadingData(e){try{if(!e.stats||!e.completed||!Array.isArray(e.completed))throw new Error("Formato de datos inv\xE1lido");return this.saveArticleStats(e.stats),this.saveCompletedArticles(e.completed),!0}catch(a){return console.error("Error importing reading data:",a),!1}}clearAllStats(){try{localStorage.removeItem(this.STATS_STORAGE_KEY),localStorage.removeItem(this.COMPLETED_STORAGE_KEY)}catch(e){console.warn("Error clearing article stats:",e)}}static \u0275fac=function(a){return new(a||r)};static \u0275prov=P({token:r,factory:r.\u0275fac,providedIn:"root"})};export{m as a,L as b,B as c};
