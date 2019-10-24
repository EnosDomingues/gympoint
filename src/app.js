import express from 'express';
import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  // Aqui será cadastrado todos os middlewares da nossa aplicação
  middlewares() {
    // habilita nossa aplicação para receber requisições no formato JSON
    this.server.use(express.json());
  }

  // Aqui será cadastrada todas as rotas da nossa aplicação
  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
