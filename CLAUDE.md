# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PICC is a full-stack learning project designed to catch up on modern web application development technologies after a 10-year hiatus. The project implements a complete separation of backend and frontend using a RESTful API architecture with containerization and Infrastructure as Code.

## Architecture

### Backend (Laravel API)
- **Framework**: PHP 8.3 + Laravel 11 
- **API Design**: RESTful API with Laravel API Resources
- **Database**: PostgreSQL 15 + Redis for caching
- **Authentication**: Laravel Sanctum for SPA authentication
- **Testing**: Pest + PHPUnit
- **Code Quality**: PHPStan/Larastan + Laravel Pint

### Frontend (React SPA)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Heroicons
- **HTTP Client**: Axios for API communication
- **Routing**: React Router
- **State Management**: React Query (server state) + Zustand (client state)
- **Testing**: Vitest + React Testing Library

### API Design (Design First)
- **Specification**: OpenAPI 3.0 YAML (manually created)
- **Type Generation**: openapi-typescript-codegen
- **Documentation**: Swagger UI

### Development Environment
- **Containerization**: Docker Compose + Laravel Sail
- **Hot Reloading**: Vite HMR for frontend, PHP immediate reflection for backend
- **Volume Mounting**: Real-time code changes without rebuild

### Infrastructure as Code
- **Tool**: Terraform + HCL
- **State Management**: S3 backend + DynamoDB locks
- **Cloud Provider**: AWS (ECS Fargate, RDS Aurora PostgreSQL, ElastiCache Redis)
- **CDN**: S3 + CloudFront for frontend

## Development Commands

### Local Development Setup
```bash
# Start development environment
docker-compose up -d

# Frontend development server
cd frontend && npm install && npm run dev

# Generate API types from OpenAPI spec
npm run generate-api
```

### Backend Commands (Laravel)
```bash
# Run tests
./vendor/bin/pest
./vendor/bin/phpunit

# Static analysis
./vendor/bin/phpstan analyse

# Code formatting
./vendor/bin/pint
```

### Frontend Commands (React)
```bash
# Run tests
npm run test

# Build for production
npm run build

# Type checking
npm run type-check
```

### Infrastructure Commands (Terraform)
```bash
# Plan infrastructure changes
cd infrastructure/environments/dev && terraform plan

# Apply infrastructure changes
terraform apply

# Format Terraform files
terraform fmt -recursive
```

## Key Development Practices

### API First Development
1. Design OpenAPI specification in `docs/api/openapi.yml`
2. Generate TypeScript types: `npm run generate-api`
3. Implement Laravel API using generated specification
4. Build React frontend with type-safe API client

### Code Quality Standards
- **PHP**: PHPStan Level 8, Laravel Pint formatting
- **TypeScript**: Strict mode, ESLint + Prettier
- **Testing**: Unit tests for both backend and frontend
- **Git**: Conventional commits, feature branch workflow

### Container Development
- Volume mounting for real-time development
- Hot Module Replacement (HMR) for frontend
- Immediate PHP reflection for backend changes
- Isolated database and cache services

## Learning Objectives

This project serves as a comprehensive learning platform for:
- Modern full-stack web development patterns
- API-first development methodology  
- Container-based development workflows
- Infrastructure as Code practices
- TypeScript and type-safe development
- Modern React development with hooks and context
- Laravel best practices and testing
- AWS cloud services integration

## Directory Structure

```
picc/
├── backend/                 # Laravel API
├── frontend/               # React SPA  
├── infrastructure/         # Terraform IaC
├── docs/                   # Project documentation
│   ├── architecture.md     # Detailed technical specs
│   └── api/openapi.yml     # API specification
├── docker-compose.yml      # Local development
└── .github/workflows/      # CI/CD pipelines
```

## Communication Style

### Tone and Interaction
- **Friendly and Approachable**: Use a casual, conversational tone with appropriate emojis 😊
- **Enthusiastic Learning**: Show excitement about discoveries and learning progress 🎉
- **Japanese Language Support**: Respond in Japanese when the user communicates in Japanese
- **Technical but Accessible**: Explain complex concepts clearly while maintaining technical accuracy
- **Encourage Questions**: Create an environment where questions are welcomed and celebrated
- **Collaborative Spirit**: Act as a learning partner, not just a technical assistant

### Communication Examples
- Use phrases like "素晴らしい質問です！", "いい感じですね！", "完璧です！"
- Include relevant emojis to enhance communication: 🚀 🎯 ✅ 🔧 📊
- Celebrate milestones and breakthroughs with enthusiasm
- Provide context and "why" explanations, not just "how"

## Important Notes for Claude Code

### Required Reading on Session Start
When starting a new Claude Code session, automatically read these essential documents to understand the full project context:
- **docs/architecture.md** - Complete technical specifications and system design
- **docs/technology-decisions.md** - Technology selection rationale, excluded options, and learning strategy

### Development Guidelines
- Always check `docs/architecture.md` for detailed technical specifications
- Follow the established API-first development workflow
- Use the existing Docker environment for development
- Maintain type safety across the full stack
- Follow the established testing patterns (Pest for PHP, Vitest for React)
- Reference the OpenAPI specification in `docs/api/openapi.yml` for API contracts