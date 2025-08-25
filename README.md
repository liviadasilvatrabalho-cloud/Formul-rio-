# Cadastro de Parceiros Comerciais

Projeto web desenvolvido com **React + Vite + TypeScript**, utilizando **Tailwind CSS** e **Shadcn UI**, com suporte ao **Lovable.dev** para criação de interfaces.

O objetivo é criar um **formulário de cadastro de parceiros comerciais** com:
- Validações de campos
- Máscaras (CNPJ/CPF, CEP, Telefone)
- Consumo de APIs externas (ViaCEP e ReceitaWS)
- Persistência em banco de dados **MySQL** via procedure
- Feedback visual ao usuário (erros e sucesso)

## 🚀 Tecnologias utilizadas

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Lovable.dev](https://lovable.dev/) (para prototipação)

## 📂 Estrutura do projeto

├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── src
│ ├── main.tsx
│ ├── App.tsx
│ ├── components
│ │ ├── FormParceiro.tsx # formulário principal
│ │ └── ...outros componentes
│ └── styles
│ └── index.css

## ⚙️ Como rodar o projeto

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou 20)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

Verifique se está instalado:
```bash
node -v
npm -v

Instalar dependências
npm install

Rodar em ambiente de desenvolvimento
npm run dev
