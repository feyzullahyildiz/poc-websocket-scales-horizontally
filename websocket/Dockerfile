FROM denoland/deno:2.0.6

EXPOSE 4000
WORKDIR /app

# Prefer not to run as root.
USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
COPY . .

RUN deno cache main.ts

CMD ["run", "--allow-net", "--allow-env", "main.ts"]
