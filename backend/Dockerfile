FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS test
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run lint && npm test

FROM node:22-alpine AS runner
ENV NODE_ENV=production \
    PORT=5000
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 --ingroup nodejs crm
COPY --from=dependencies --chown=crm:nodejs /app/node_modules ./node_modules
COPY --chown=crm:nodejs package.json ./
COPY --chown=crm:nodejs src ./src
COPY --chown=crm:nodejs seeders ./seeders
COPY --chown=crm:nodejs scripts ./scripts
USER crm
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/api/v1/health/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
