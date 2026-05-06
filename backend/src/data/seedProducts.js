// =============================================================
// src/data/seedProducts.js
// Catálogo inicial. Se usa como fallback en memoria y como semilla
// inicial de la base de datos.
// =============================================================

export const seedProducts = [
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
    slug: "cana-de-lomo-iberico",
    name: "Caña de Lomo Ibérico",
    description:
      "Lomo de cerdo ibérico adobado con pimentón, ajo y orégano, embuchado y curado en pieza. Aromático, fino y elegante al corte.",
    category: "embutido",
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
    category: "embutido",
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
    category: "embutido",
    price: 12.0,
    priceUnit: "pieza",
    image: null,
    tag: "Tradición",
    stock: 28,
    active: true,
  },
  {
    slug: "sobre-jamon-loncheado",
    name: "Sobre de Jamón Loncheado",
    description:
      "Cortado a cuchillo y envasado al vacío. Listo para tabla, tostada o bocadillo.",
    category: "loncheado",
    price: 6.5,
    priceUnit: "100g",
    image: null,
    tag: "Listo",
    stock: 60,
    active: true,
  },
  {
    slug: "tabla-iberica-loncheada",
    name: "Tabla Ibérica Loncheada",
    description:
      "Selección de jamón, lomo, chorizo y salchichón. El plato perfecto para compartir sin esfuerzo.",
    category: "loncheado",
    price: 12.0,
    priceUnit: "pack",
    image: null,
    tag: "Para compartir",
    featured: true,
    stock: 40,
    active: true,
  },
  {
    slug: "jamon-iberico-cebo",
    name: "Jamón Ibérico de Cebo",
    description:
      "Curación más corta, sabor accesible y aroma característico del ibérico. Excelente relación calidad-precio.",
    category: "jamon",
    price: 22.0,
    priceUnit: "kg",
    image: null,
    tag: "Cebo",
    stock: 14,
    active: true,
  },
];
