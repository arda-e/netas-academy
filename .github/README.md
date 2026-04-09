GitHub Actions deploy secrets expected by `deploy-ec2.yml`:

- `EC2_HOST`: public IP or DNS of the EC2 instance
- `EC2_USERNAME`: SSH user, for example `ubuntu`
- `EC2_SSH_KEY`: private key content for SSH access
- `EC2_APP_DIR`: absolute path of the repo on the EC2 instance
