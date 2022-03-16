# FROM rust:1.58.1-alpine3.14 as prisma
# ENV RUSTFLAGS="-C target-feature=-crt-static"
# RUN apk --no-cache add openssl direnv git musl-dev openssl-dev build-base perl protoc
# RUN git clone --depth=1 --branch=3.9.0 https://github.com/prisma/prisma-engines.git /prisma
# WORKDIR /prisma
# RUN cargo build --release --jobs 1

# FROM node:16.14.0-alpine3.14
# WORKDIR /app
# ENV PRISMA_QUERY_ENGINE_BINARY=/prisma-engines/query-engine \
#   PRISMA_MIGRATION_ENGINE_BINARY=/prisma-engines/migration-engine \
#   PRISMA_INTROSPECTION_ENGINE_BINARY=/prisma-engines/introspection-engine \
#   PRISMA_FMT_BINARY=/prisma-engines/prisma-fmt \
#   PRISMA_CLI_QUERY_ENGINE_TYPE=binary \
#   PRISMA_CLIENT_ENGINE_TYPE=binary
# COPY --from=prisma /prisma/target/release/query-engine /prisma/target/release/migration-engine /prisma/target/release/introspection-engine /prisma/target/release/prisma-fmt /prisma-engines/

# Install dependencies only when needed
FROM amd64/node:16-alpine
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# COPY package.json yarn.lock ./
# RUN yarn install --frozen-lockfile

# If using npm with a `package-lock.json` comment out above and use below instead
COPY package.json package-lock.json ./ 
# Removes node_modules and install all dependencies at once
RUN npm ci

# Copy the rest of our Next.js folder into /app
COPY . /app

# Ensure port 3000 is accessible to our system
EXPOSE 3000

RUN npx prisma generate

# Run yarn dev, as we would via the command line 
CMD ["npm", "run", "dev"]