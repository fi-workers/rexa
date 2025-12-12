-include .env
export

.PHONY: all help pre-commit migrate

help: ## 명령어 목록 출력
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS=":.*?## "}; {printf "\033[36m%-24s\033[0m %s\n", $$1, $$2}'

initialize: application certs ## 최초 1회: 의존 툴 설치 + 인증서 생성 + hosts 등록 + 패키지 설치
	@sudo ./infra/local/scripts/hosts.sh
	@touch src/frontend/env/.env
	@yarn install || true

application: ## 로컬 개발 필수 도구 설치(필요 시)
	@brew install --cask docker || true
	@brew install docker-compose mkcert nss traefik node watchman || true
	@npm install -g yarn corepack --force || true
	@corepack enable
	@xcode-select --install || true

certs: ## rexa 도메인용 로컬 인증서 생성 (고정 파일명)
	@mkcert -install
	@rm -rf infra/local/cert && mkdir -p infra/local/cert
	@cd infra/local/cert && mkcert "rexa.work" '*.rexa.work'


clean-node-modules:
	@rm -rf node_modules
	@rm -rf src/frontend/node_modules

clean-dist:
	@rm -rf src/frontend/.next

clean: clean-node-modules clean-dist

docker-up: ## Docker 컨테이너 시작
	@docker-compose up -d

docker-down: ## Docker 컨테이너 중지
	@docker-compose down

docker-logs: ## Docker 컨테이너 로그 확인
	@docker-compose logs -f

docker-restart: ## Docker 컨테이너 재시작
	@docker-compose restart

docker-status: ## Docker 컨테이너 상태 확인
	@docker-compose ps