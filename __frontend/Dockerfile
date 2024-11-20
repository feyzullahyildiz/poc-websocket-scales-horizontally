FROM denoland/deno:2.0.6 as builder


WORKDIR /app
ENV VITE_WEBSOCKET_HOST="ws://localhost:8080"
COPY package.json .
COPY deno.lock .
RUN deno install
COPY . .
RUN deno run build

FROM nginx:stable-alpine3.20
COPY ./docker/nginx.conf /etc/nginx/nginx.conf

# React build çıktısını nginx'e kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Nginx başlat
CMD ["nginx", "-g", "daemon off;"]
