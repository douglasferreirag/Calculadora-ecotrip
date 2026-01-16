// ⭐ Dados de rotas (objeto global)
const routesData = {
  routes: [
    {
      id: 1,
      origin: "São Paulo, SP",
      destination: "Rio de Janeiro, RJ",
      distance: 430
    },
    {
      id: 2,
      origin: "Foz do Iguaçu, PR",
      destination: "Juiz de Fora, MG",
      distance: 1000
    },
    {
      id: 3,
      origin: "Belo Horizonte, MG",
      destination: "Salvador, BA",
      distance: 850
    }
  ],
  getRoute(id) {
    return this.routes.find(r => r.id === id);
  },
  addRoute(origin, destination, distance) {
    const newId = Math.max(...this.routes.map(r => r.id)) + 1;
    this.routes.push({ id: newId, origin, destination, distance });
    return newId;
  }
};
