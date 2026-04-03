FROM node:20-alpine AS builder

WORKDIR /app
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_db?schema=public

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

EXPOSE 5000

CMD ["npm", "run", "start"]
