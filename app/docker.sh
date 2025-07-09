#!/bin/bash

# Night of the Thirteenth (NotT) Docker Helper Script
# This script provides easy commands for managing the Docker environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev          Start development environment"
    echo "  dev:build    Build and start development environment"
    echo "  dev:logs     Show development logs"
    echo "  dev:down     Stop development environment"
    echo "  prod         Start production environment"
    echo "  prod:build   Build and start production environment"
    echo "  prod:logs    Show production logs"
    echo "  prod:down    Stop production environment"
    echo "  db           Start database services only"
    echo "  db:down      Stop database services"
    echo "  clean        Remove all containers and volumes"
    echo "  status       Show status of all services"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev       # Start development environment"
    echo "  $0 prod      # Start production environment"
    echo "  $0 status    # Check service status"
}

# Function to show service status
show_status() {
    print_status "Checking service status..."
    echo ""
    
    # Check development services
    if docker-compose -f docker-compose.dev.yml ps --services --filter "status=running" | grep -q .; then
        print_success "Development services are running:"
        docker-compose -f docker-compose.dev.yml ps
    else
        print_warning "Development services are not running"
    fi
    
    echo ""
    
    # Check production services
    if docker-compose ps --services --filter "status=running" | grep -q .; then
        print_success "Production services are running:"
        docker-compose ps
    else
        print_warning "Production services are not running"
    fi
    
    echo ""
    print_status "Port information:"
    echo "  Frontend:     http://localhost:3013"
    echo "  Backend API:  http://localhost:4013"
    echo "  Nginx Proxy:  http://localhost:8013"
    echo "  PostgreSQL:   localhost:5432"
    echo "  Redis:        localhost:6379"
    echo "  TURN Server:  localhost:3478"
}

# Function to clean up
clean_up() {
    print_warning "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker environment..."
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Main script logic
case "${1:-help}" in
    "dev")
        check_docker
        check_docker_compose
        print_status "Starting development environment..."
        docker-compose -f docker-compose.dev.yml up -d
        print_success "Development environment started!"
        print_status "Access the application at: http://localhost:8013"
        ;;
    "dev:build")
        check_docker
        check_docker_compose
        print_status "Building and starting development environment..."
        docker-compose -f docker-compose.dev.yml up -d --build
        print_success "Development environment built and started!"
        print_status "Access the application at: http://localhost:8013"
        ;;
    "dev:logs")
        check_docker_compose
        print_status "Showing development logs..."
        docker-compose -f docker-compose.dev.yml logs -f
        ;;
    "dev:down")
        check_docker_compose
        print_status "Stopping development environment..."
        docker-compose -f docker-compose.dev.yml down
        print_success "Development environment stopped!"
        ;;
    "prod")
        check_docker
        check_docker_compose
        print_status "Starting production environment..."
        docker-compose up -d
        print_success "Production environment started!"
        print_status "Access the application at: http://localhost:8013"
        ;;
    "prod:build")
        check_docker
        check_docker_compose
        print_status "Building and starting production environment..."
        docker-compose up -d --build
        print_success "Production environment built and started!"
        print_status "Access the application at: http://localhost:8013"
        ;;
    "prod:logs")
        check_docker_compose
        print_status "Showing production logs..."
        docker-compose logs -f
        ;;
    "prod:down")
        check_docker_compose
        print_status "Stopping production environment..."
        docker-compose down
        print_success "Production environment stopped!"
        ;;
    "db")
        check_docker
        check_docker_compose
        print_status "Starting database services..."
        docker-compose up -d postgres redis
        print_success "Database services started!"
        print_status "PostgreSQL: localhost:5432"
        print_status "Redis: localhost:6379"
        ;;
    "db:down")
        check_docker_compose
        print_status "Stopping database services..."
        docker-compose down postgres redis
        print_success "Database services stopped!"
        ;;
    "clean")
        check_docker
        clean_up
        ;;
    "status")
        check_docker
        check_docker_compose
        show_status
        ;;
    "help"|*)
        show_usage
        ;;
esac