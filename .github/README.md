GitHub Actions deploy secrets expected by `deploy-ec2.yml`:

- `EC2_HOST`: public IP or DNS of the EC2 instance
- `EC2_USERNAME`: SSH user, for example `ubuntu`
- `EC2_SSH_KEY`: private key content for SSH access
- `EC2_APP_DIR`: absolute path of the deploy directory on the EC2 instance

Additional secrets for GHCR deploy:

- `GHCR_OWNER`: GitHub owner or org name used in image paths
- `GHCR_USERNAME`: GitHub username used to log in on EC2
- `GHCR_TOKEN`: a GitHub token or PAT with package read access on EC2

Preview/deploy secrets used by `deploy-ec2.yml`:

- `NEXT_PUBLIC_SITE_URL`: public frontend origin, usually `https://new.netasacademy.com`
- `CLIENT_URL`: public frontend origin used by Strapi preview, usually `https://new.netasacademy.com`
- `FRONTEND_URL`: frontend origin for Strapi revalidation; defaults to `http://127.0.0.1:3000`
- `STRAPI_PUBLIC_URL`: public Strapi origin, usually `https://new.netasacademy.com:1337`
- `PREVIEW_SECRET`: shared draft-mode token for preview routes
- `NEXT_PUBLIC_API_URL`: public Strapi/admin origin used by the frontend CSP, usually `https://new.netasacademy.com:1337`
- `APP_KEYS`: four comma-separated Strapi app keys
- `ADMIN_JWT_SECRET`: Strapi admin JWT secret
- `API_TOKEN_SALT`: Strapi API token salt
- `TRANSFER_TOKEN_SALT`: Strapi transfer token salt
- `ENCRYPTION_KEY`: Strapi encryption key
- `JWT_SECRET`: Strapi users-permissions JWT secret

The current pipeline publishes the combined app image with both mutable and immutable tags:

- `ghcr.io/<owner>/netas-academy:latest`
- `ghcr.io/<owner>/netas-academy:<commit-sha>`

The deploy workflow uploads `docker-compose.deploy.yml` plus the Nginx config under `docker/nginx/conf.d/` to the server and does not require a Git checkout on EC2.
The EC2 host must already have a Let's Encrypt certificate at `/etc/letsencrypt/live/new.netasacademy.com/`; install and renew it with host-level `certbot`, not through Docker Compose.
Because deploys use immutable commit tags, the workflow prunes unused containers and images before pulling and again after a successful recreate. This keeps small EC2 root volumes from filling `/var/lib/containerd` with old tagged images.
