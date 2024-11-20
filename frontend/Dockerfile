FROM denoland/deno:2.0.6

ARG GIT_REVISION
# Detayını pek bilmiyourm ama ilginç bir şekilde bunu parametre olarak vermemizi istiyor
# Docker'ın build-cache ile bir alakası olmaması lazım. 
# 
# hatta örnekte git commitinin ID'sini veriyor. 
# docker build --build-arg GIT_REVISION=$(git rev-parse HEAD) -t my-fresh-app .
# https://fresh.deno.dev/docs/concepts/deployment

ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

ENV WEBSOCKET_URL="ws://localhost:4000"

WORKDIR /app

COPY . .
RUN deno task build
RUN deno cache main.ts

EXPOSE 8000

CMD ["run", "-A", "main.ts"]
