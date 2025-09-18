# Development Tools

This directory contains development support tools and utilities for the PICC project.

## Directory Structure

```
tools/
├── scripts/           # Development scripts and utilities
│   ├── api-testing/   # VS Code REST Client files for API testing
│   ├── check_db.sh    # Database inspection script
│   ├── test_api.sh    # Automated API testing script
│   └── db_queries.sql # Common database queries
├── postman/           # Postman collections and environments
│   └── PICC_API.postman_collection.json
└── README.md          # This file
```

## Quick Start

### API Testing with VS Code REST Client
```bash
# Navigate to API testing files
cd tools/scripts/api-testing/
# Open any .http file in VS Code with REST Client extension
```

### API Testing with Scripts
```bash
# Run automated API tests
./tools/scripts/test_api.sh

# Check database status
./tools/scripts/check_db.sh
```

### Postman Collection
Import `tools/postman/PICC_API.postman_collection.json` into Postman for comprehensive API testing.

## Development Workflow

1. **Local API Testing**: Use REST Client files in `api-testing/`
2. **Automated Testing**: Run `test_api.sh` for continuous validation
3. **Database Inspection**: Use `check_db.sh` and `db_queries.sql`
4. **Team Collaboration**: Share Postman collection for standardized testing

## Contributing

When adding new development tools:
- Place scripts in `tools/scripts/`
- Add Postman collections to `tools/postman/`
- Update this README with usage instructions
- Ensure tools are executable and documented