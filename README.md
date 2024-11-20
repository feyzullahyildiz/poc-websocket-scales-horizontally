# What is this Repo for
- This app proofs that websocket server scales horizontally.
- Every backend connects to a Redis (PUB/SUB)
- Backend has only 2 files.
    - [websocket/main.ts](./websocket/main.ts)
    - [websocket/Group.ts](./websocket/Group.ts)
# Techs
- The backend is a native [Deno](https://deno.land/) app without a library. It just needs a [Redis client library](https://www.npmjs.com/package/ioredis).
    - The main file is [websocket/main.ts](./websocket/main.ts)
- The frontend app is a web framework written in [Deno](https://deno.land/) called [fresh](https://fresh.deno.dev/)

# Run in you PC with Docker
- Install [Docker](https://www.docker.com/) to you PC
- Then execute these comments by one one
    - `docker swarm init`
    - `docker compose build`
    - `docker stack deploy -c docker-compose.yaml ws-app`
- Open this URL in your browser with a couple tabs http://localhost:8000

### To Scale up
- `docker service update --replicas 1 ws-app_backend`
- `docker service update --replicas 10 ws-app_backend`

## To Delete App
- `docker stack rm ws-app`