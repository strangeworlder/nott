#!/bin/bash

# Night of the Thirteenth - Server Startup Script
# This script starts a local HTTP server to run the simulation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
PORT=8000
HOST="0.0.0.0"
PYTHON_CMD="python3"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Night of the Thirteenth${NC}"
    echo -e "${BLUE}  Server Startup Script${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
check_port() {
    if command_exists netstat; then
        netstat -tuln | grep -q ":$1 "
    elif command_exists ss; then
        ss -tuln | grep -q ":$1 "
    else
        # Fallback: try to bind to the port
        python3 -c "import socket; s=socket.socket(); s.bind(('', $1)); s.close()" 2>/dev/null
    fi
}

# Function to find available Python command
find_python() {
    if command_exists python3; then
        PYTHON_CMD="python3"
    elif command_exists python; then
        PYTHON_CMD="python"
    else
        print_error "Python not found. Please install Python 3.x"
        exit 1
    fi
}

# Function to check Python version
check_python_version() {
    local version=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2)
    local major=$(echo $version | cut -d'.' -f1)
    
    if [ "$major" -lt 3 ]; then
        print_error "Python 3.x is required. Found Python $version"
        exit 1
    fi
    
    print_status "Using Python $version"
}

# Function to start server
start_server() {
    print_status "Starting HTTP server on $HOST:$PORT"
    print_status "Press Ctrl+C to stop the server"
    echo ""
    
    # Start the server
    $PYTHON_CMD -m http.server $PORT --bind $HOST
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --port PORT     Port to run server on (default: 8000)"
    echo "  -h, --host HOST     Host to bind to (default: 0.0.0.0)"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                  # Start server on default port 8000"
    echo "  $0 -p 8080         # Start server on port 8080"
    echo "  $0 -h 127.0.0.1    # Start server on localhost only"
    echo ""
    echo "After starting the server, open your browser to:"
    echo "  http://localhost:$PORT"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -h|--host)
            HOST="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_header
    
    # Check if we're in the right directory
    if [ ! -f "index.html" ]; then
        print_error "index.html not found. Please run this script from the project directory."
        exit 1
    fi
    
    # Check if required files exist
    if [ ! -d "js" ]; then
        print_error "js/ directory not found. Please run this script from the project directory."
        exit 1
    fi
    
    # Find and check Python
    find_python
    check_python_version
    
    # Check if port is available
    if check_port $PORT; then
        print_warning "Port $PORT is already in use. The server may fail to start."
        print_warning "You can specify a different port with: $0 -p <port>"
        echo ""
    fi
    
    # Show server info
    print_status "Server will be available at: http://localhost:$PORT"
    print_status "Project directory: $(pwd)"
    echo ""
    
    # Start the server
    start_server
}

# Run main function
main "$@" 