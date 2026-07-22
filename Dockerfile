# syntax=docker/dockerfile:1

# ---- Builder stage ----
FROM rust:1.97.1-bookworm AS builder

# aws-lc-sys (via rustls/reqwest) needs cmake + go + a C compiler
RUN apt-get update && apt-get install -y --no-install-recommends \
        cmake \
        golang-go \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Build binary
COPY Cargo.toml Cargo.lock ./
COPY . .
RUN cargo build --release --locked

# ---- Runtime stage ----
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/bwg-data-stuff /usr/local/bin/bwg-data-stuff

# Persistent storage for the downloaded SQLite database
RUN mkdir -p /app/data
VOLUME ["/app/data"]

ENV DATA_DIR=/app/data

EXPOSE 8362

CMD ["bwg-data-stuff"]