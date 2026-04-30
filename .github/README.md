GitHub Actions deploy secrets expected by `deploy-ec2.yml`:

- `EC2_HOST`: public IP or DNS of the EC2 instance
- `EC2_USERNAME`: SSH user, for example `ubuntu`
- `EC2_SSH_KEY`: private key content for SSH access
- `EC2_APP_DIR`: absolute path of the deploy directory on the EC2 instance

Additional secrets for GHCR deploy:

- `GHCR_OWNER`: GitHub owner or org name used in image paths
- `GHCR_USERNAME`: GitHub username used to log in on EC2
- `GHCR_TOKEN`: a GitHub token or PAT with package read access on EC2

The current pipeline publishes the combined app image with both mutable and immutable tags:

- `ghcr.io/<owner>/netas-academy:latest`
- `ghcr.io/<owner>/netas-academy:<commit-sha>`

The deploy workflow uploads `docker-compose.deploy.yml` to the server and does not require a Git checkout on EC2.
Because deploys use immutable commit tags, the workflow prunes unused containers and images before pulling and again after a successful recreate. This keeps small EC2 root volumes from filling `/var/lib/containerd` with old tagged images.
