#!/bin/bash

# Helper script to manage PostgreSQL with podman-compose

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if podman machine is running
if ! podman machine list | grep -q "podman-machine.*running"; then
    echo "Starting podman machine..."
    podman machine start podman-machine
fi

# Check if podman-compose is installed
if ! command -v podman-compose &> /dev/null; then
    echo "Error: podman-compose is not installed."
    echo "Install it with: brew install podman-compose"
    exit 1
fi

# Execute the command
case "${1:-up}" in
    up)
        echo "Starting PostgreSQL with podman-compose..."
        podman-compose up -d
        echo ""
        echo "PostgreSQL is now running!"
        echo "Connection details:"
        echo "  Host: localhost"
        echo "  Port: 5432"
        echo "  Database: belajarshafa"
        echo "  User: postgres"
        echo "  Password: password"
        ;;
    down)
        echo "Stopping PostgreSQL..."
        podman-compose down
        ;;
    stop)
        echo "Stopping PostgreSQL (keeping volumes)..."
        podman-compose stop
        ;;
    start)
        echo "Starting PostgreSQL..."
        podman-compose start
        ;;
    restart)
        echo "Restarting PostgreSQL..."
        podman-compose restart
        ;;
    ps)
        echo "PostgreSQL container status:"
        podman-compose ps
        ;;
    logs)
        podman-compose logs -f postgres
        ;;
    shell)
        echo "Connecting to PostgreSQL container..."
        podman-compose exec postgres psql -U postgres -d belajarshafa
        ;;
    *)
        echo "Usage: $0 {up|down|stop|start|restart|ps|logs|shell}"
        echo ""
        echo "Commands:"
        echo "  up      - Start PostgreSQL (default)"
        echo "  down    - Stop and remove containers"
        echo "  stop    - Stop containers (keep volumes)"
        echo "  start   - Start stopped containers"
        echo "  restart - Restart containers"
        echo "  ps      - Show container status"
        echo "  logs    - Show PostgreSQL logs"
        echo "  shell   - Open PostgreSQL shell"
        exit 1
        ;;
esac

