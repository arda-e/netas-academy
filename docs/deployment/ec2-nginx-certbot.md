# EC2 Nginx Certbot Deployment

> Historical EC2/GitHub Actions runbook. The GitLab Ubuntu migration uses
> [`gitlab-ubuntu-runbook.md`](/Users/arda/Desktop/development/netas_academy/docs/deployment/gitlab-ubuntu-runbook.md)
> with host Nginx, host Certbot, GitLab Container Registry, and
> `deploy/ubuntu/docker-compose.production.yml`.

This runbook is for the `new.netasacademy.com` EC2 deployment that runs Docker Compose with Nginx in front of the combined Next.js and Strapi app.

## AWS Prerequisites

Confirm these before running Certbot:

- DNS `new.netasacademy.com` points to the EC2 public IP.
- EC2 security group allows inbound `80`, `443`, and `1337`.
- EC2 security group allows outbound internet access.
- The public subnet route table has `0.0.0.0/0 -> Internet Gateway`.

Quick network test from EC2:

```bash
curl -4 -I http://security.ubuntu.com
curl -4 -I http://us-east-1.ec2.archive.ubuntu.com
curl -4 -I https://google.com
```

## Install Certbot

Run on EC2:

```bash
sudo apt update
sudo apt install -y certbot
```

Confirm the renewal timer exists:

```bash
systemctl list-timers | grep certbot
```

## Issue The First Certificate

Port `80` must be free while Certbot runs. Stop the Docker stack first:

```bash
cd ~/netas_academy
docker compose down || true
```

Issue the certificate:

```bash
sudo certbot certonly --standalone \
  -d new.netasacademy.com \
  --email aeren@netas.com.tr \
  --agree-tos \
  --non-interactive
```

If Certbot says the certificate already exists and asks what to do, choose:

```text
1: Keep the existing certificate for now
```

Verify the files exist:

```bash
sudo ls -l /etc/letsencrypt/live/new.netasacademy.com/fullchain.pem
sudo ls -l /etc/letsencrypt/live/new.netasacademy.com/privkey.pem
```

## Deploy

Push the latest commits and rerun the GitHub deploy workflow.

Manual fallback on EC2:

```bash
cd ~/netas_academy
docker compose up -d --remove-orphans
docker compose ps
```

Test:

```bash
curl -I https://new.netasacademy.com
curl -I https://new.netasacademy.com:1337/admin
```

## Renewal

Certbot installs a system timer. Renewals should run automatically.

Manual renewal test:

```bash
sudo certbot renew --dry-run
```

Always use `sudo` for real renewals:

```bash
sudo certbot renew
```

## Reload Docker Nginx After Renewal

Create a Certbot deploy hook:

```bash
sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy
sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-netas-nginx.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
set -e
cd ~/netas_academy
docker compose exec -T nginx nginx -s reload || true
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-netas-nginx.sh
```

If `~` does not expand correctly in the hook, replace `~/netas_academy` with the absolute deploy path.

## Common Failure

If Certbot reports a timeout for:

```text
http://new.netasacademy.com/.well-known/acme-challenge/...
```

then Let's Encrypt cannot reach EC2 on port `80`. Check:

- EC2 security group inbound `80`.
- Public DNS points to the current EC2 public IP.
- Route table has `0.0.0.0/0 -> Internet Gateway`.
- No local firewall blocks port `80`.
- Docker/Nginx is stopped before `certbot certonly --standalone`.
