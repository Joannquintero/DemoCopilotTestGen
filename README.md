# Employee CRUD - Clean Architecture

Una solución completa de gestión de empleados implementando los principios de Clean Architecture con .NET 9, Angular 19+ y React 19+.

## 🏗️ Arquitectura del Proyecto

```
c:\Projects\DemoCopilotTest\
├── backend/                          # Backend .NET 9 API
│   ├── src/
│   │   ├── EmployeeCRUD.Domain/      # Capa de Dominio
│   │   ├── EmployeeCRUD.Application/ # Capa de Aplicación  
│   │   ├── EmployeeCRUD.Infrastructure/ # Capa de Infraestructura
│   │   └── EmployeeCRUD.API/         # Capa de API
│   └── EmployeeCRUD.sln              # Solución
├── frontend/
│   ├── angular-app/                  # Frontend Angular 19+
│   └── react-app/                    # Frontend React 19+
└── README.md
```

## 🚀 Tecnologías Utilizadas

### Backend (.NET 9 REST API)
- **Framework**: .NET 9 con C# 13
- **Arquitectura**: Clean Architecture (4 capas)
- **ORM**: Entity Framework Core 9.0 con SQL Server
- **Patrones**: CQRS con MediatR, Repository Pattern
- **Validación**: FluentValidation
- **Mapeo**: AutoMapper
- **Documentación**: Swagger/OpenAPI
- **Características**: Manejo global de excepciones, CORS

### Frontend Angular
- **Framework**: Angular 19+
- **Arquitectura**: Standalone Components
- **Estado**: Signals para gestión reactiva
- **HTTP**: HttpClient para comunicación con API
- **UI**: Angular Material
- **TypeScript**: Configuración estricta

### Frontend React  
- **Framework**: React 19+ con TypeScript
- **Estado**: React Query para gestión de estado servidor
- **HTTP**: Axios para llamadas API
- **UI**: Tailwind CSS
- **Formularios**: React Hook Form
- **Routing**: React Router DOM v6

## 📋 Funcionalidades

### Gestión Completa de Empleados (CRUD)
- ✅ **Listar** empleados con búsqueda y filtros
- ✅ **Crear** nuevo empleado con validaciones
- ✅ **Leer** detalles completos del empleado
- ✅ **Actualizar** información del empleado
- ✅ **Eliminar** empleado con confirmación

### Modelo de Datos Employee
```typescript
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;        // Computed property
  email: string;
  position: string;
  salary: number;
  hireDate: Date;
  createdAt: Date;
  updatedAt?: Date;
}
```

## 🛠️ Configuración y Ejecución

### Prerrequisitos
- .NET 9 SDK
- Node.js 18+
- SQL Server (LocalDB o instancia completa)
- Visual Studio Code o Visual Studio 2022

### Backend (.NET API)

1. **Restaurar dependencias**:
```bash
cd backend
dotnet restore
```

2. **Configurar base de datos**:
   - Actualizar connection string en `appsettings.json`
   - Ejecutar migraciones:
```bash
cd src/EmployeeCRUD.API
dotnet ef database update
```

3. **Ejecutar API**:
```bash
dotnet run --project src/EmployeeCRUD.API
```

La API estará disponible en:
- HTTPS: `https://localhost:7000`
- HTTP: `http://localhost:5000`
- Swagger UI: `https://localhost:7000` (en desarrollo)

### Frontend Angular

1. **Instalar dependencias**:
```bash
cd frontend/angular-app
npm install
```

2. **Ejecutar aplicación**:
```bash
npm start
```

Disponible en: `http://localhost:4200`

### Frontend React

1. **Instalar dependencias**:
```bash
cd frontend/react-app
npm install
```

2. **Ejecutar aplicación**:
```bash
npm run dev
```

Disponible en: `http://localhost:3000`

## 🏛️ Arquitectura Clean Architecture

### Domain Layer (EmployeeCRUD.Domain)
- **Entities**: Employee
- **Interfaces**: IEmployeeRepository
- **Sin dependencias externas**

### Application Layer (EmployeeCRUD.Application)
- **DTOs**: CreateEmployeeDto, UpdateEmployeeDto, EmployeeDto
- **Commands & Queries**: CQRS implementation with MediatR
- **Handlers**: Command and Query handlers
- **Mappings**: AutoMapper profiles
- **Validators**: FluentValidation rules

### Infrastructure Layer (EmployeeCRUD.Infrastructure)
- **DbContext**: Entity Framework Core configuration
- **Repositories**: IEmployeeRepository implementation
- **Migrations**: Database schema management

### API Layer (EmployeeCRUD.API)
- **Controllers**: RESTful endpoints
- **Middleware**: Global exception handling
- **Configuration**: Dependency injection, CORS, Swagger

## 📡 API Endpoints

### Employee Management
```http
GET    /api/employees              # Obtener todos los empleados
GET    /api/employees/{id}         # Obtener empleado por ID
GET    /api/employees/by-position/{position} # Filtrar por posición
GET    /api/employees/paginated    # Paginación
GET    /api/employees/count        # Contar empleados
POST   /api/employees              # Crear empleado
PUT    /api/employees/{id}         # Actualizar empleado
DELETE /api/employees/{id}         # Eliminar empleado
```

### Health Check
```http
GET /health                        # Estado de la aplicación
```

## 🔧 Características Técnicas

### Principios SOLID
- **Single Responsibility**: Cada clase tiene una responsabilidad clara
- **Open/Closed**: Extensible sin modificar código existente
- **Liskov Substitution**: Las interfaces son sustituibles
- **Interface Segregation**: Interfaces específicas y focalizadas
- **Dependency Inversion**: Dependencias hacia abstracciones

### Patrones Implementados
- **Repository Pattern**: Abstracción de acceso a datos
- **CQRS**: Separación de Commands y Queries
- **Mediator Pattern**: Desacoplamiento con MediatR
- **Clean Architecture**: Separación clara de responsabilidades

### Validaciones
- **Backend**: FluentValidation con reglas de negocio
- **Frontend**: Validación en tiempo real en formularios
- **Consistencia**: Mismas reglas en cliente y servidor

## 🎨 Características de UI/UX

### Angular Frontend
- **Material Design**: Componentes consistentes y accesibles
- **Responsive**: Diseño adaptativo para móviles
- **Signals**: Estado reactivo con performance optimizada
- **Standalone Components**: Arquitectura moderna de Angular

### React Frontend  
- **Tailwind CSS**: Utility-first styling approach
- **React Query**: Optimized data fetching y caching
- **TypeScript**: Type safety completo
- **Modern Hooks**: useState, useEffect, custom hooks

## 📈 Performance y Optimizaciones

- **Entity Framework**: Query optimization y tracking disabled donde sea apropiado
- **Caching**: React Query cache para datos del servidor
- **Lazy Loading**: Componentes cargados bajo demanda
- **Bundle Optimization**: Tree shaking y code splitting

## 🔒 Seguridad

- **CORS**: Configuración apropiada para desarrollo
- **Validation**: Validación en múltiples capas
- **Error Handling**: Manejo seguro sin exposición de detalles internos

## 📚 Próximas Mejoras

- [ ] Autenticación y autorización (JWT)
- [ ] Unit Testing (xUnit, Jest)
- [ ] Integration Testing
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Logging estructurado (Serilog)
- [ ] Rate limiting
- [ ] API versioning

## 🤝 Contribución

Este proyecto sigue las mejores prácticas de desarrollo y está diseñado para ser mantenible y escalable. Las contribuciones son bienvenidas siguiendo los patrones establecidos.

## 📄 Licencia

Este proyecto es una demostración de arquitectura y está disponible para fines educativos y de referencia.

---
**Desarrollado con ❤️ usando .NET 9, Angular 19+ y React 19+**