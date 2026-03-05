<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [x] Launch the Project
- [x] Ensure Documentation is Complete

## Employee CRUD Project - Clean Architecture

### Project Overview
Complete Employee CRUD solution implementing Clean Architecture principles with:

**Backend (.NET 9 REST API)**:
- Domain Layer: Employee entity and repository interfaces
- Application Layer: DTOs, Mappings (AutoMapper), Validation (FluentValidation), CQRS with MediatR
- Infrastructure Layer: Entity Framework Core with SQL Server, Repository pattern
- API Layer: Controllers with Swagger, Global exception handling, CORS

**Frontends**:
cd frontend/angular-app
npm install && npm startcd frontend/angular-app
npm install && npm startcd frontend/angular-app
npm install && npm start
- Angular 19+: Standalone Components, Signals, HttpClient, Angular Material
- React 19+: Hooks, React Query/Axios, Tailwind CSS

**Additional Requirements**:
- C# 13 and .NET 9 features
- Clean, modular code following SOLID principles
- Complete Employee management (Create, Read, Update, Delete)

### Project Status: ✅ COMPLETED

The project has been successfully created and is ready for development. The backend API is running on http://localhost:5000 and the project structure follows Clean Architecture principles.

### Next Steps for Developers:
1. **Angular Frontend**: Navigate to `frontend/angular-app` and run `npm install && npm start` to launch on port 4200
2. **React Frontend**: Navigate to `frontend/react-app` and run `npm install && npm run dev` to launch on port 3000
3. **Database**: Update connection string in `backend/src/EmployeeCRUD.API/appsettings.json` for your SQL Server instance
4. **Migrations**: Run `dotnet ef database update` from the API project directory to create the database

The solution demonstrates modern development practices with .NET 9, TypeScript, and responsive UI frameworks.