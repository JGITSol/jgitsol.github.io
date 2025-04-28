+++
title = "Portfolio projects- part 1 - Django Fleet Management System"
draft = false
date = "2024-05-23"
description = "Current state of the fleet management django project"
tags = ["django", "fleet management", "portfolio"]
+++

# Current State of the Fleet Management Django Project

## Project Overview

The Car Fleet Management project is a Django-based web application designed to manage vehicle fleets, maintenance schedules, drivers, and emergency incidents. The project uses Django REST Framework for API endpoints and JWT authentication for secure access.

## Project Structure

The project is organized into the following main apps:

```text
1. accounts: User management and authentication
   - CustomUser model with role-based permissions
   - Driver management
   - Emergency contact information

2. vehicles: Vehicle management and tracking
   - Vehicle registration and details
   - Status tracking (available, in use, maintenance, out of service)
   - Assignment to drivers

3. maintenance: Maintenance records and scheduling
   - Maintenance types (routine, repair, inspection)
   - Status tracking (scheduled, in progress, completed, cancelled)
   - Cost tracking and service provider information

4. emergency: Emergency incident reporting and management
   - Incident types (accident, breakdown, medical, theft)
   - Status tracking (reported, responding, resolved, closed)
   - Emergency response coordination

5. api: REST API endpoints for the application
   - JWT authentication
   - Endpoints for all main entities
   - Mobile app integration via Lynx JS client
   - AI-powered screenshot analysis using OpenRouter
```

## Current Test Coverage

The project has improved test coverage from 17% to 56%, with:

```text
- Models have excellent coverage (nearly 100%)
- Views and API functionality have improved significantly but still have gaps
- Some tests are skipped or failing due to authentication and configuration issues
```

## Authentication Issues

The main issues causing test failures are related to authentication:

```text
1. JWT Configuration: Uses djangorestframework-simplejwt but tests use force_authenticate
2. Permission Classes: Restrictive permissions without proper test setup
3. Test Authentication: Clients not configured for JWT tokens
4. Patch System: Inconsistent application of authentication patches
```

## Missing Dependencies

```text
1. djangorestframework-simplejwt
2. drf-spectacular
3. REST framework test utilities
4. django-filter
```

## API Endpoints

The API provides endpoints for:

```text
Authentication:
- /api/auth/register/
- /api/auth/login/
- /api/auth/logout/
- /api/auth/profile/
- /api/auth/validate-token/

Vehicles:
- /api/vehicles/
- /api/vehicles/<id>/

Maintenance:
- /api/maintenance/
- /api/maintenance/<id>/

Drivers:
- /api/drivers/
- /api/drivers/<id>/

AI Analysis:
- /api/screenshots/analyze/
- /api/screenshots/batch-analyze/
- /api/screenshots/generate-report/
```

## Test Patching System

The project uses a complex patching system:

```text
1. JWT Auth Patch: Modifies permission classes for tests
2. Test Setup: Configures environment in test_setup.py
3. Custom Test Runners: Multiple runners with different patches
```

## Known Issues

```text
1. Authentication Inconsistency: Mixed token/JWT usage
2. Missing API Endpoints: Some endpoints not implemented
3. Test Failures: Authentication-related failures persist
4. Date Calculations: Hardcoded dates in tests
5. Missing Test Files: Required images for OpenRouter tests
6. Inconsistent Permissions: Varying permission classes
7. Duplicate Code: Multiple similar patch implementations
```

## Next Steps for Refactoring

```text
1. Standardize Authentication: Consolidate to JWT
2. Clean Up Test Patching: Unify patch implementations
3. Fix API Endpoints: Implement missing endpoints
4. Improve Test Coverage: Focus on views/API endpoints
5. Fix Date Calculations: Use dynamic date handling
6. Documentation: Enhance with drf-spectacular
7. Clean Up Dependencies: Verify requirements.txt
8. Refactor Permissions: Consistent permission strategy
```