import { createServer, Model, Factory } from 'miragejs';
import { brands as brandsData } from '../data/brands';
import { posters as postersData } from '../data/posters';

export function makeServer({ environment = 'development' } = {}) {
  let server = createServer({
    environment,
    models: { category: Model, poster: Model, brand: Model },
    factories: { product: Factory.extend({ name(i){ return `Product ${i}`; }, price(){ return Math.floor(Math.random()*500)+50; }, description(){ return 'A great product for your needs'; }, category(){ return 'ferramentas-manuais'; }, in_stock(){ return true; }, is_special_offer(){ return Math.random()>0.5; } }) },
    seeds(server) {
      // Categories
      server.create('category', { id: 1, name: 'Ferramentas Manuais', slug: 'ferramentas-manuais' });
      server.create('category', { id: 2, name: 'Máquinas Elétricas', slug: 'maquinas-eletricas' });
      server.create('category', { id: 3, name: 'Movimentação de Carga', slug: 'movimentacao-carga' });
      server.create('category', { id: 4, name: 'Construção Civil', slug: 'construcao-civil' });
      server.create('category', { id: 5, name: 'Jardim e Agricultura', slug: 'jardim-agricultura' });

      // Seed brands: production -> static dataset; development -> localStorage fallback
      let seedBrands = [];
      if (environment === 'production') {
        seedBrands = (brandsData && brandsData.length) ? brandsData : [];
      } else {
        try { const json = window.localStorage.getItem('brands'); seedBrands = json ? JSON.parse(json) : []; } catch { seedBrands = []; }
        if (!seedBrands.length) seedBrands = brandsData;
      }
      seedBrands.forEach(brand => { server.create('brand', { id: brand.id, name: brand.name, slug: brand.slug, logo: brand.logo }); });

      // Seed posters: production -> static dataset; development -> localStorage fallback
      let seedPosters = [];
      if (environment === 'production') {
        seedPosters = (postersData && postersData.length) ? postersData : [];
      } else {
        try { const json = window.localStorage.getItem('posters'); seedPosters = json ? JSON.parse(json) : []; } catch { seedPosters = []; }
      }
      seedPosters.forEach(poster => server.create('poster', poster));
    },
    routes() {
      this.namespace = 'api';
      this.get('/products', schema => schema.products.all());
      this.get('/products/:id', (schema, request) => schema.products.find(request.params.id));
      this.post('/products', (schema, request) => { let attrs = JSON.parse(request.requestBody); attrs.price = parseFloat(attrs.price); attrs.original_price = attrs.original_price ? parseFloat(attrs.original_price) : null; attrs.is_special_offer = Boolean(attrs.is_special_offer); attrs.in_stock = Boolean(attrs.in_stock); const created = schema.products.create(attrs); window.localStorage.setItem('products', JSON.stringify(schema.products.all().models)); return created; });
      this.put('/products/:id', (schema, request) => { let attrs = JSON.parse(request.requestBody); attrs.price = parseFloat(attrs.price); attrs.original_price = attrs.original_price ? parseFloat(attrs.original_price) : null; attrs.is_special_offer = Boolean(attrs.is_special_offer); attrs.in_stock = Boolean(attrs.in_stock); const updated = schema.products.find(request.params.id).update(attrs); window.localStorage.setItem('products', JSON.stringify(schema.products.all().models)); return updated; });
      this.delete('/products/:id', (schema, request) => { const deleted = schema.products.find(request.params.id).destroy(); window.localStorage.setItem('products', JSON.stringify(schema.products.all().models)); return deleted; });
      this.get('/categories', schema => schema.categories.all());
      this.get('/posters', schema => schema.posters.all());
      this.post('/posters', (schema, request) => { let attrs = JSON.parse(request.requestBody); return schema.posters.create(attrs); });
      this.put('/posters/:id', (schema, request) => { let attrs = JSON.parse(request.requestBody); return schema.posters.find(request.params.id).update(attrs); });
      this.delete('/posters/:id', (schema, request) => schema.posters.find(request.params.id).destroy());
      this.get('/brands', schema => schema.brands.all());
      this.post('/brands', (schema, request) => { let attrs = JSON.parse(request.requestBody); return schema.brands.create(attrs); });
      this.put('/brands/:id', (schema, request) => { let attrs = JSON.parse(request.requestBody); return schema.brands.find(request.params.id).update(attrs); });
      this.delete('/brands/:id', (schema, request) => schema.brands.find(request.params.id).destroy());
      this.get('/products/special-offers', schema => schema.products.where({ is_special_offer: true }));
    },
  });
  return server;
}
