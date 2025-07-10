#!/bin/bash

# Lighthouse DB API Docker 빌드 스크립트

set -e

echo "🚀 Lighthouse DB API Docker 빌드 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_info() {
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

# 기존 컨테이너 정리
cleanup() {
    print_info "기존 컨테이너 정리 중..."
    docker-compose down --remove-orphans 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
}

# Docker 이미지 빌드
build_image() {
    print_info "Docker 이미지 빌드 중..."
    docker build -t lighthouse-db-api:latest .
    print_success "Docker 이미지 빌드 완료"
}

# 개발 환경 실행
run_dev() {
    print_info "개발 환경 실행 중..."
    docker-compose up -d
    print_success "개발 환경 실행 완료"
    print_info "서비스 접속 정보:"
    echo "  - API 서버: http://localhost:3000"
    echo "  - API 문서: http://localhost:3000/api-docs"
    echo "  - MongoDB Express: http://localhost:8081 (admin/password123)"
    echo "  - MongoDB: localhost:27017"
}

# 프로덕션 환경 실행
run_prod() {
    print_info "프로덕션 환경 실행 중..."
    docker-compose -f docker-compose.prod.yml up -d
    print_success "프로덕션 환경 실행 완료"
    print_info "서비스 접속 정보:"
    echo "  - API 서버: http://localhost:3000"
    echo "  - API 문서: http://localhost:3000/api-docs"
    echo "  - MongoDB: localhost:27017"
}

# 로그 확인
show_logs() {
    print_info "로그 확인 중..."
    if [ "$1" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml logs -f
    else
        docker-compose logs -f
    fi
}

# 상태 확인
check_status() {
    print_info "컨테이너 상태 확인 중..."
    if [ "$1" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml ps
    else
        docker-compose ps
    fi
}

# 헬스 체크
health_check() {
    print_info "API 헬스 체크 중..."
    sleep 10  # 서버 시작 대기
    
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "API 서버가 정상적으로 실행 중입니다!"
        curl -s http://localhost:3000/api/health | jq . 2>/dev/null || curl -s http://localhost:3000/api/health
    else
        print_error "API 서버에 연결할 수 없습니다."
        exit 1
    fi
}

# 메인 스크립트
main() {
    case "$1" in
        "dev")
            cleanup
            build_image
            run_dev
            health_check
            ;;
        "prod")
            cleanup
            build_image
            run_prod
            health_check
            ;;
        "logs")
            show_logs "$2"
            ;;
        "status")
            check_status "$2"
            ;;
        "cleanup")
            cleanup
            print_success "정리 완료"
            ;;
        "build")
            build_image
            ;;
        *)
            echo "사용법: $0 {dev|prod|logs|status|cleanup|build}"
            echo ""
            echo "명령어:"
            echo "  dev     - 개발 환경 실행"
            echo "  prod    - 프로덕션 환경 실행"
            echo "  logs    - 로그 확인 (dev 또는 prod)"
            echo "  status  - 컨테이너 상태 확인"
            echo "  cleanup - 기존 컨테이너 정리"
            echo "  build   - Docker 이미지만 빌드"
            echo ""
            echo "예시:"
            echo "  $0 dev"
            echo "  $0 prod"
            echo "  $0 logs dev"
            echo "  $0 status prod"
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@" 