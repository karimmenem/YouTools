# YouTools - E-commerce Platform

Uma plataforma de e-commerce especializada em ferramentas e equipamentos, desenvolvida com React e Node.js.

## 🛠️ Tecnologias

### Frontend
- React 18
- React Router DOM
- Styled Components / CSS Modules
- React Icons
- Axios

### Backend
- Node.js
- Express
- CORS
- dotenv

## 🚀 Como executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório
```bash
git clone <repository-url>
cd YouTools
```

2. Instale as dependências do backend
```bash
cd backend
npm install
```

3. Instale as dependências do frontend
```bash
cd ../client
npm install
```

4. Configure as variáveis de ambiente
```bash
cd ../backend
cp .env.example .env
```

### Executando o projeto

1. Inicie o backend
```bash
cd backend
npm run dev
```

2. Em outro terminal, inicie o frontend
```bash
cd client
npm start
```

O frontend estará disponível em `http://localhost:3000` e o backend em `http://localhost:5000`.

## 📁 Estrutura do Projeto

```
YouTools/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   └── Product/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🎯 Funcionalidades

- [x] Layout responsivo
- [x] Listagem de produtos
- [x] Catálogo de produtos
- [x] Sistema de navegação
- [ ] Autenticação de usuários
- [x] Integração WhatsApp
- [ ] Painel administrativo
- [ ] Sistema de pagamento

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
# YouTools
