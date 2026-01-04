// backend/routes/seoRoutes.js
// 🗺️ Routes pour générer les sitemaps dynamiques

import { Product } from '../models/Product.js'

export default async function seoRoutes(fastify, options) {
  
  // ============================================
  // 1. SITEMAP INDEX (Point d'entrée principal)
  // ============================================
  fastify.get('/sitemap.xml', async (request, reply) => {
    reply.type('application/xml; charset=utf-8')
    
    const now = new Date().toISOString()
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://monshop.com/sitemap-main.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://monshop.com/sitemap-products.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://monshop.com/sitemap-categories.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`
    
    return sitemap
  })

  // ============================================
  // 2. SITEMAP PAGES PRINCIPALES
  // ============================================
  fastify.get('/sitemap-main.xml', async (request, reply) => {
    reply.type('application/xml; charset=utf-8')
    
    const pages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: 'products', priority: '0.9', changefreq: 'daily' },
      { url: 'about', priority: '0.7', changefreq: 'monthly' },
      { url: 'contact', priority: '0.6', changefreq: 'monthly' },
      { url: 'cgv', priority: '0.5', changefreq: 'yearly' },
      { url: 'politique-confidentialite', priority: '0.5', changefreq: 'yearly' }
    ]

    const now = new Date().toISOString()

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(page => `
  <url>
    <loc>https://monshop.com/${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="fr-BE" href="https://monshop.com/${page.url}"/>
    <xhtml:link rel="alternate" hreflang="nl-BE" href="https://monshop.com/nl/${page.url}"/>
  </url>`).join('')}
</urlset>`
    
    return sitemap
  })

  // ============================================
  // 3. SITEMAP PRODUITS (Dynamique depuis BD)
  // ============================================
  fastify.get('/sitemap-products.xml', async (request, reply) => {
    reply.type('application/xml; charset=utf-8')
    
    try {
      // Récupérer tous les produits actifs
      const products = await Product.findAll({
        attributes: ['id', 'name', 'img', 'price', 'description', 'updatedAt'],
        where: {
          // Si vous avez un champ 'active' ou 'published'
          // active: true
        },
        order: [['updatedAt', 'DESC']]
      })

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${products.map(product => {
  const imageUrl = product.img?.startsWith('http') 
    ? product.img 
    : `https://monshop.com/images/${product.img}`
  
  return `
  <url>
    <loc>https://monshop.com/product/${product.id}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${product.img ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(product.name)}</image:title>
      <image:caption>${escapeXml(product.name)} - ${product.price}€</image:caption>
    </image:image>` : ''}
  </url>`
}).join('')}
</urlset>`
    
      return sitemap
      
    } catch (error) {
      fastify.log.error('Erreur génération sitemap produits:', error)
      reply.code(500).send({ error: 'Erreur génération sitemap' })
    }
  })

  // ============================================
  // 4. SITEMAP CATÉGORIES
  // ============================================
  fastify.get('/sitemap-categories.xml', async (request, reply) => {
    reply.type('application/xml; charset=utf-8')
    
    const categories = [
      { id: 1, name: 'Homme', priority: '0.9' },
      { id: 2, name: 'Femme', priority: '0.9' },
      { id: 3, name: 'Enfants', priority: '0.9' }
    ]

    const now = new Date().toISOString()

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories.map(cat => `
  <url>
    <loc>https://monshop.com/category/${cat.id}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${cat.priority}</priority>
  </url>`).join('')}
</urlset>`
    
    return sitemap
  })

  // ============================================
  // 5. ROBOTS.TXT (Dynamique)
  // ============================================
  fastify.get('/robots.txt', async (request, reply) => {
    reply.type('text/plain; charset=utf-8')
    
    const robotsTxt = `User-agent: *
Allow: /
Allow: /*.css$
Allow: /*.js$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.svg$

# Bloquer les zones privées
Disallow: /admin/
Disallow: /dashboard/
Disallow: /profil/
Disallow: /cart/
Disallow: /checkout/
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /password-reset

# Bloquer les paramètres inutiles
Disallow: /*?*
Disallow: /search

# Sitemaps
Sitemap: https://monshop.com/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Moteurs spécifiques
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2`
    
    return robotsTxt
  })

  fastify.log.info('✅ Routes SEO enregistrées (sitemaps + robots.txt)')
}

// Fonction helper pour échapper le XML
function escapeXml(unsafe) {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export { escapeXml }