// =============================================================
// src/data/seedProducts.js
// Catálogo inicial con las 8 categorías reales de Ibéricos Macarena.
//
// Categorías:
//   jamon | paleta | quesos | embutidos |
//   loncheados | bacalao | conservas | otros
// =============================================================

export const seedProducts = [
  // ─── JAMÓN ───
  {
    slug: "jamon-iberico-bellota",
    name: "Jamón Ibérico de Bellota",
    description:
      "Pieza entera curada en secadero natural. Sabor profundo, paseo dulce y vetas de grasa infiltrada características del cerdo ibérico criado en montanera.",
    category: "jamon",
    price: 34.0,
    priceUnit: "kg",
    image: null,
    tag: "Estrella",
    featured: true,
    stock: 12,
    active: true,
  },
  {
    slug: "jamon-iberico-cebo",
    name: "Jamón Ibérico de Cebo",
    description:
      "Curación tradicional, sabor equilibrado y precio accesible. Ideal para uso diario o tablas familiares.",
    category: "jamon",
    price: 22.0,
    priceUnit: "kg",
    image: null,
    tag: null,
    stock: 15,
    active: true,
  },

  // ─── PALETA ───
  {
    slug: "paleta-iberica-bellota",
    name: "Paleta Ibérica de Bellota",
    description:
      "Curación más corta que el jamón pero con personalidad propia. Formato manejable, ideal para casa o como regalo.",
    category: "paleta",
    price: 28.0,
    priceUnit: "kg",
    image: null,
    tag: "Bellota",
    featured: true,
    stock: 18,
    active: true,
  },
  {
    slug: "paleta-iberica-cebo",
    name: "Paleta Ibérica de Cebo",
    description:
      "Sabor pronunciado y precio asequible. Excelente opción de iniciación al ibérico.",
    category: "paleta",
    price: 18.0,
    priceUnit: "kg",
    image: null,
    tag: null,
    stock: 20,
    active: true,
  },

  // ─── QUESOS ───
  {
    slug: "queso-curado-oveja",
    name: "Queso Curado de Oveja",
    description:
      "Queso de leche cruda de oveja con curación de 9-12 meses. Notas a frutos secos y final largo.",
    category: "quesos",
    price: 24.0,
    priceUnit: "kg",
    image: null,
    tag: "Curado",
    featured: true,
    stock: 14,
    active: true,
  },
  {
    slug: "queso-cabra-semicurado",
    name: "Queso de Cabra Semicurado",
    description:
      "Pasta firme, intensidad media y aroma fresco. Perfecto para tablas y aperitivos.",
    category: "quesos",
    price: 19.0,
    priceUnit: "kg",
    image: null,
    tag: null,
    stock: 16,
    active: true,
  },

  // ─── EMBUTIDOS ───
  {
    slug: "cana-de-lomo-iberico",
    name: "Caña de Lomo Ibérico",
    description:
      "Lomo de cerdo ibérico adobado con pimentón, ajo y orégano, embuchado y curado en pieza. Aromático, fino y elegante al corte.",
    category: "embutidos",
    price: 26.0,
    priceUnit: "pieza",
    image: null,
    tag: "Artesanal",
    featured: true,
    stock: 24,
    active: true,
  },
  {
    slug: "chorizo-iberico",
    name: "Chorizo Ibérico",
    description:
      "Carne ibérica magra, pimentón de la Vera y ajo. Curado lento, bocado redondo y aroma característico.",
    category: "embutidos",
    price: 12.0,
    priceUnit: "pieza",
    image: null,
    tag: "Pimentón",
    stock: 32,
    active: true,
  },
  {
    slug: "salchichon-iberico",
    name: "Salchichón Ibérico",
    description:
      "Mezcla equilibrada de pimienta y especias. Textura suave, perfil aromático y curación tradicional.",
    category: "embutidos",
    price: 12.0,
    priceUnit: "pieza",
    image: null,
    tag: "Tradición",
    stock: 28,
    active: true,
  },
  {
    slug: "morcilla-de-arroz",
    name: "Morcilla de Arroz",
    description:
      "Receta clásica con cebolla y arroz. Para cocinar a la plancha, en estofados o frita.",
    category: "embutidos",
    price: 9.0,
    priceUnit: "pieza",
    image: null,
    tag: null,
    stock: 36,
    active: true,
  },

  // ─── LONCHEADOS ───
  {
    slug: "sobre-jamon-loncheado",
    name: "Sobre de Jamón Loncheado",
    description:
      "Cortado a cuchillo y envasado al vacío. Listo para tabla, tostada o bocadillo.",
    category: "loncheados",
    price: 6.5,
    priceUnit: "100g",
    image: null,
    tag: "Al vacío",
    featured: true,
    stock: 60,
    active: true,
  },
  {
    slug: "sobre-paleta-loncheada",
    name: "Sobre de Paleta Loncheada",
    description:
      "Loncheada al momento, conserva todo el aroma. Ideal para llevar.",
    category: "loncheados",
    price: 5.0,
    priceUnit: "100g",
    image: null,
    tag: null,
    stock: 50,
    active: true,
  },
  {
    slug: "tabla-iberica-degustacion",
    name: "Tabla Ibérica de Degustación",
    description:
      "Selección de jamón, paleta, lomo y chorizo, todo loncheado y al vacío. Perfecta para regalo o evento en casa.",
    category: "loncheados",
    price: 14.5,
    priceUnit: "pack",
    image: null,
    tag: "Regalo",
    featured: true,
    stock: 18,
    active: true,
  },

  // ─── BACALAO SUPERIOR ───
  {
    slug: "bacalao-lomo-superior",
    name: "Lomo de Bacalao Superior",
    description:
      "Lomos gruesos, salazón al punto y carne blanca y limpia. Para confitar, al pil-pil o a la vizcaína.",
    category: "bacalao",
    price: 32.0,
    priceUnit: "kg",
    image: null,
    tag: "Selección",
    featured: true,
    stock: 10,
    active: true,
  },
  {
    slug: "bacalao-desmigado",
    name: "Bacalao Desmigado",
    description:
      "Migas listas para ensaladas, croquetas o tortilla de bacalao. Punto de sal preciso.",
    category: "bacalao",
    price: 22.0,
    priceUnit: "kg",
    image: null,
    tag: null,
    stock: 14,
    active: true,
  },

  // ─── CONSERVAS DEL CANTÁBRICO ───
  {
    slug: "anchoas-cantabrico",
    name: "Anchoas del Cantábrico",
    description:
      "Selección premium en aceite de oliva virgen extra. Filetes limpios, textura mantecosa y sabor intenso.",
    category: "conservas",
    price: 12.0,
    priceUnit: "pack",
    image: null,
    tag: "Premium",
    featured: true,
    stock: 24,
    active: true,
  },
  {
    slug: "bonito-norte-aceite",
    name: "Bonito del Norte en Aceite",
    description:
      "Pesca artesanal del Cantábrico. Lomos enteros en aceite de oliva.",
    category: "conservas",
    price: 9.5,
    priceUnit: "pack",
    image: null,
    tag: null,
    stock: 30,
    active: true,
  },
  {
    slug: "mejillones-escabeche",
    name: "Mejillones en Escabeche",
    description:
      "Receta clásica gallega. Carnosos, con punto justo de vinagre y pimentón.",
    category: "conservas",
    price: 6.5,
    priceUnit: "pack",
    image: null,
    tag: null,
    stock: 28,
    active: true,
  },

  // ─── OTROS ───
  {
    slug: "aceite-oliva-virgen-extra",
    name: "Aceite de Oliva Virgen Extra",
    description:
      "AOVE de la zona, primera presión en frío. Frutado, equilibrado y de uso diario.",
    category: "otros",
    price: 14.0,
    priceUnit: "pack",
    image: null,
    tag: "Local",
    featured: true,
    stock: 22,
    active: true,
  },
  {
    slug: "miel-mil-flores",
    name: "Miel de Mil Flores",
    description:
      "Miel cruda artesanal del Condado de Huelva. Aroma floral y textura cremosa.",
    category: "otros",
    price: 8.5,
    priceUnit: "pack",
    image: null,
    tag: null,
    stock: 26,
    active: true,
  },
  {
    slug: "hornazo-tradicional",
    name: "Hornazo Tradicional",
    description:
      "Pan artesano relleno de chorizo y huevo. Receta de toda la vida del Condado.",
    category: "otros",
    price: 11.0,
    priceUnit: "pieza",
    image: null,
    tag: "Casero",
    stock: 14,
    active: true,
  },
];
