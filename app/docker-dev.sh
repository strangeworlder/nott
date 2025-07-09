#!/bin/bash

# Docker Development Environment Script for NotT
# This script manages the development environment using Docker Compose

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
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! docker-compose --version > /dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to check for environment files
check_env_files() {
    print_status "Checking for environment files..."
    
    local missing_files=()
    
    # Check for environment files
    if [ ! -f "frontend/.env.development" ]; then
        missing_files+=("frontend/.env.development")
    fi
    
    if [ ! -f "frontend/.env.staging" ]; then
        missing_files+=("frontend/.env.staging")
    fi
    
    if [ ! -f "frontend/.env.production" ]; then
        missing_files+=("frontend/.env.production")
    fi
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        print_warning "Missing environment files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        print_warning "Please create these files manually or use environment variables."
        print_warning "See CONFIGURATION.md for template examples."
    else
        print_success "All environment files found"
    fi
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    print_success "Development environment started"
    print_status "Services available at:"
    print_status "  Frontend: http://localhost:3013"
    print_status "  Backend:  http://localhost:4013"
    print_status "  Nginx:    http://localhost:8013"
    print_status "  Database: localhost:5432"
    print_status "  Redis:    localhost:6379"
}

# Function to start staging environment
start_staging() {
    print_status "Starting staging environment..."
    docker-compose -f docker-compose.staging.yml up -d
    print_success "Staging environment started"
    print_status "Services available at:"
    print_status "  Frontend: http://localhost:3013"
    print_status "  Backend:  http://localhost:4013"
    print_status "  Nginx:    http://localhost:8013"
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment..."
    docker-compose -f docker-compose.prod.yml up -d
    print_success "Production environment started"
    print_status "Services available at:"
    print_status "  Frontend: http://localhost:3013"
    print_status "  Backend:  http://localhost:4013"
    print_status "  Nginx:    http://localhost:8013"
}

# Function to stop development environment
stop_dev() {
    print_status "Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
    print_success "Development environment stopped"
}

# Function to stop staging environment
stop_staging() {
    print_status "Stopping staging environment..."
    docker-compose -f docker-compose.staging.yml down
    print_success "Staging environment stopped"
}

# Function to stop production environment
stop_prod() {
    print_status "Stopping production environment..."
    docker-compose -f docker-compose.prod.yml down
    print_success "Production environment stopped"
}

# Function to restart development environment
restart_dev() {
    print_status "Restarting development environment..."
    stop_dev
    start_dev
}

# Function to restart staging environment
restart_staging() {
    print_status "Restarting staging environment..."
    stop_staging
    start_staging
}

# Function to restart production environment
restart_prod() {
    print_status "Restarting production environment..."
    stop_prod
    start_prod
}

# Function to view logs
logs() {
    local service=${1:-""}
    local env=${2:-"dev"}
    
    if [ -z "$service" ]; then
        print_status "Showing logs for all services (${env})..."
        docker-compose -f docker-compose.${env}.yml logs -f
    else
        print_status "Showing logs for service: $service (${env})"
        docker-compose -f docker-compose.${env}.yml logs -f "$service"
    fi
}

# Function to run commands in containers
exec_cmd() {
    local service=$1
    local env=${2:-"dev"}  # FIXED: Changed from ${3:-"dev"} to ${2:-"dev"}
    shift 2  # FIXED: Shift 2 instead of 1 to remove service and env
    local cmd="$*"
    
    if [ -z "$service" ] || [ -z "$cmd" ]; then
        print_error "Usage: $0 exec <service> <command> [env]"
        exit 1
    fi
    
    print_status "Running command in $service (${env}): $cmd"
    docker-compose -f docker-compose.${env}.yml exec "$service" sh -c "$cmd"
}

# Function to run tests
run_tests() {
    local service=${1:-"frontend"}
    local env=${2:-"dev"}
    print_status "Running tests for $service (${env})..."
    docker-compose -f docker-compose.${env}.yml exec "$service" npm run test
}

# Function to build services
build() {
    local service=${1:-""}
    local env=${2:-"dev"}
    if [ -z "$service" ]; then
        print_status "Building all services (${env})..."
        docker-compose -f docker-compose.${env}.yml build
    else
        print_status "Building service: $service (${env})"
        docker-compose -f docker-compose.${env}.yml build "$service"
    fi
}

# Function to clean up
clean() {
    local env=${1:-"dev"}
    print_status "Cleaning up Docker resources (${env})..."
    docker-compose -f docker-compose.${env}.yml down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Function to show status
status() {
    local env=${1:-"dev"}
    print_status "Environment status (${env}):"
    docker-compose -f docker-compose.${env}.yml ps
}

# Function to show environment variables
env_info() {
    print_status "Environment variables:"
    echo "  POSTGRES_DB: ${POSTGRES_DB:-nott_dev}"
    echo "  POSTGRES_USER: ${POSTGRES_USER:-nott_user}"
    echo "  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-nott_password}"
    echo "  JWT_SECRET: ${JWT_SECRET:-your-jwt-secret-dev}"
    echo "  TURN_USERNAME: ${TURN_USERNAME:-nott_user}"
    echo "  TURN_PASSWORD: ${TURN_PASSWORD:-nott_password}"
    echo "  TURN_REALM: ${TURN_REALM:-nott.local}"
    echo "  VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:4013}"
    echo "  VITE_SOCKET_URL: ${VITE_SOCKET_URL:-http://localhost:4013}"
}

# Function to show help
show_help() {
    echo "Docker Development Environment Script for NotT"
    echo ""
    echo "Usage: $0 <command> [options] [environment]"
    echo ""
    echo "Commands:"
    echo "  start [env]     Start the environment (dev|staging|prod)"
    echo "  stop [env]      Stop the environment (dev|staging|prod)"
    echo "  restart [env]   Restart the environment (dev|staging|prod)"
    echo "  logs [service] [env] Show logs (all services or specific service)"
    echo "  exec <service> <command> [env] Execute command in container"
    echo "  test [service] [env] Run tests (default: frontend)"
    echo "  build [service] [env] Build services (all or specific service)"
    echo "  clean [env]     Clean up Docker resources"
    echo "  status [env]    Show environment status"
    echo "  env-info        Show current environment variables"
    echo "  help            Show this help message"
    echo ""
    echo "Environments:"
    echo "  dev (default)   Development environment"
    echo "  staging         Staging environment"
    echo "  prod            Production environment"
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start development"
    echo "  $0 start staging            # Start staging"
    echo "  $0 logs frontend            # Frontend logs (dev)"
    echo "  $0 logs backend staging     # Backend logs (staging)"
    echo "  $0 exec frontend npm run lint # Run lint in frontend (dev)"
    echo "  $0 test backend prod        # Run backend tests (prod)"
}

# Add this function for dependency management
install_dependencies() {
  local service=$1
  local package_manager=${2:-npm}
  
  echo "Installing dependencies for $service using $package_manager..."
  
  case $package_manager in
    "yarn")
      docker-compose exec $service yarn install --frozen-lockfile
      ;;
    "npm")
      docker-compose exec $service npm install --legacy-peer-deps
      ;;
    *)
      echo "Unknown package manager: $package_manager"
      exit 1
      ;;
  esac
}

# Main script logic
main() {
    local command=${1:-"help"}
    local env=${2:-"dev"}
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Check environment files
    check_env_files
    
    case "$command" in
        start)
            case "$env" in
                dev|development)
                    start_dev
                    ;;
                staging)
                    start_staging
                    ;;
                prod|production)
                    start_prod
                    ;;
                *)
                    print_error "Unknown environment: $env"
                    show_help
                    exit 1
                    ;;
            esac
            ;;
        stop)
            case "$env" in
                dev|development)
                    stop_dev
                    ;;
                staging)
                    stop_staging
                    ;;
                prod|production)
                    stop_prod
                    ;;
                *)
                    print_error "Unknown environment: $env"
                    show_help
                    exit 1
                    ;;
            esac
            ;;
        restart)
            case "$env" in
                dev|development)
                    restart_dev
                    ;;
                staging)
                    restart_staging
                    ;;
                prod|production)
                    restart_prod
                    ;;
                *)
                    print_error "Unknown environment: $env"
                    show_help
                    exit 1
                    ;;
            esac
            ;;
        logs)
            logs "$2" "$3"
            ;;
        exec)
            # FIXED: Pass the correct parameters to exec_cmd
            # $2 = service, $3 = env, $4+ = command
            local service=$2
            local env=${3:-"dev"}
            shift 3  # Remove command, service, and env
            local cmd="$*"
            
            if [ -z "$service" ] || [ -z "$cmd" ]; then
                print_error "Usage: $0 exec <service> <command> [env]"
                exit 1
            fi
            
            print_status "Running command in $service (${env}): $cmd"
            docker-compose -f docker-compose.${env}.yml exec "$service" sh -c "$cmd"
            ;;
        test)
            run_tests "$2" "$3"
            ;;
        build)
            build "$2" "$3"
            ;;
        clean)
            clean "$2"
            ;;
        status)
            status "$2"
            ;;
        env-info)
            env_info
            ;;
        install)
            install_dependencies ${2:-frontend} ${3:-npm}
            ;;
        install:yarn)
            install_dependencies ${2:-frontend} yarn
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 