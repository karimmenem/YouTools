import { createServer, Model, Factory } from 'miragejs';
// productsData import removed
import { brands as brandsData } from '../data/brands';

export function makeServer({ environment = 'development' } = {}) {
  let server = createServer({
    environment,

    models: {
      // Mirage models not used for products; persistence via Dexie
      category: Model,
      poster: Model,
      brand: Model,
    },

    factories: {
      product: Factory.extend({
        name(i) { return `Product ${i}`; },
        price() { return Math.floor(Math.random() * 500) + 50; },
        description() { return 'A great product for your needs'; },
        category() { return 'ferramentas-manuais'; },
        in_stock() { return true; },
        is_special_offer() { return Math.random() > 0.5; },
      }),
    },

    seeds(server) {
      // No initial product seeding; Dexie store persists products

      // Seed categories
      server.create('category', { id: 1, name: 'Ferramentas Manuais', slug: 'ferramentas-manuais' });
      server.create('category', { id: 2, name: 'Máquinas Elétricas', slug: 'maquinas-eletricas' });
      server.create('category', { id: 3, name: 'Movimentação de Carga', slug: 'movimentacao-carga' });
      server.create('category', { id: 4, name: 'Construção Civil', slug: 'construcao-civil' });
      server.create('category', { id: 5, name: 'Jardim e Agricultura', slug: 'jardim-agricultura' });
      // Seed brands: load from localStorage if present, else from static data
      let storedBrands = [];
      try {
        const json = window.localStorage.getItem('brands');
        storedBrands = json ? JSON.parse(json) : [];
      } catch (e) {
        storedBrands = [];
      }
      if (storedBrands.length) {
        storedBrands.forEach(brand => {
          server.create('brand', {
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo
          });
        });
      } else {
        brandsData.forEach(brand => {
          server.create('brand', {
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo
          });
        });
      }
      // Seed initial posters from localStorage if available
      let storedPosters = [];
      try {
        const json = window.localStorage.getItem('posters');
        storedPosters = json ? JSON.parse(json) : [];
      } catch (e) {
        storedPosters = [];
      }
      if (storedPosters.length) {
        storedPosters.forEach(poster => server.create('poster', poster));
      }
    },

    routes() {
      this.namespace = 'api';

      // Products routes
      this.get('/products', (schema) => {
        return schema.products.all();
      });

      this.get('/products/:id', (schema, request) => {
        let id = request.params.id;
        return schema.products.find(id);
      });

      this.post('/products', (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        // Ensure proper data types
        attrs.price = parseFloat(attrs.price);
        attrs.original_price = attrs.original_price ? parseFloat(attrs.original_price) : null;
        attrs.is_special_offer = Boolean(attrs.is_special_offer);
        attrs.in_stock = Boolean(attrs.in_stock);
        const newProduct = schema.products.create(attrs);
        // Persist updated products to localStorage
        window.localStorage.setItem('products', JSON.stringify(schema.products.all().models));
        return newProduct;
      });

      this.put('/products/:id', (schema, request) => {
        let id = request.params.id;
        let attrs = JSON.parse(request.requestBody);
        // Ensure proper data types
        attrs.price = parseFloat(attrs.price);
        attrs.original_price = attrs.original_price ? parseFloat(attrs.original_price) : null;
        attrs.is_special_offer = Boolean(attrs.is_special_offer);
        attrs.in_stock = Boolean(attrs.in_stock);
        const updated = schema.products.find(id).update(attrs);
        // Persist updated products to localStorage
        window.localStorage.setItem('products', JSON.stringify(schema.products.all().models));
        return updated;
      });

      this.delete('/products/:id', (schema, request) => {
        let id = request.params.id;
        const deleted = schema.products.find(id).destroy();
        // Persist updated products to localStorage
        window.localStorage.setItem('products', JSON.stringify(schema.products.all().models));
        return deleted;
      });

      // Categories routes
      this.get('/categories', (schema) => {
        return schema.categories.all();
      });
      // Posters routes
      this.get('/posters', (schema) => {
        return schema.posters.all();
      });
      this.post('/posters', (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.posters.create(attrs);
      });
      this.put('/posters/:id', (schema, request) => {
        let id = request.params.id;
        let attrs = JSON.parse(request.requestBody);
        return schema.posters.find(id).update(attrs);
      });
      this.delete('/posters/:id', (schema, request) => {
        let id = request.params.id;
        return schema.posters.find(id).destroy();
      });
      // Brands routes
      this.get('/brands', (schema) => {
        return schema.brands.all();
      });
      this.post('/brands', (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.brands.create(attrs);
      });
      this.put('/brands/:id', (schema, request) => {
        let id = request.params.id;
        let attrs = JSON.parse(request.requestBody);
        return schema.brands.find(id).update(attrs);
      });
      this.delete('/brands/:id', (schema, request) => {
        let id = request.params.id;
        return schema.brands.find(id).destroy();
      });

      // Special offers endpoint
      this.get('/products/special-offers', (schema) => {
        return schema.products.where({ is_special_offer: true });
      });
    },
  });

  return server;
}
