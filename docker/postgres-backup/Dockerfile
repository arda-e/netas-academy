FROM postgres:17-alpine

RUN apk add --no-cache bash ca-certificates python3 py3-pip \
  && pip3 install --break-system-packages --no-cache-dir b2

WORKDIR /usr/local/bin
RUN mkdir -p /usr/local/lib/postgres-backup

COPY backup.sh /usr/local/bin/backup.sh
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY config.sh /usr/local/lib/postgres-backup/config.sh

RUN chmod +x /usr/local/bin/backup.sh /usr/local/bin/entrypoint.sh /usr/local/lib/postgres-backup/config.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
