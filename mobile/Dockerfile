# Builds the real Flutter app for the web and serves it statically — lets
# Andrea try the actual mobile UI (not the web-dashboard) from a public URL.
# API_BASE_URL is baked in at build time (see infra/DEPLOY.md): Render passes
# it in automatically from the matching envVar in render.yaml.
FROM ghcr.io/cirruslabs/flutter:stable AS build
WORKDIR /app
COPY . .
ARG API_BASE_URL
RUN flutter pub get \
  && flutter build web --release --no-web-resources-cdn --dart-define=API_BASE_URL=${API_BASE_URL}

FROM nginx:alpine
COPY --from=build /app/build/web /usr/share/nginx/html
EXPOSE 80
