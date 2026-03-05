using AutoMapper;
using EmployeeCRUD.Application.DTOs;
using EmployeeCRUD.Domain.Entities;

namespace EmployeeCRUD.Application.Mappings;

public class EmployeeMappingProfile : Profile
{
    public EmployeeMappingProfile()
    {
        // Employee to DTO mappings
        CreateMap<Employee, EmployeeDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName));

        CreateMap<Employee, EmployeeSummaryDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName));

        // DTO to Employee mappings
        CreateMap<CreateEmployeeDto, Employee>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

        CreateMap<UpdateEmployeeDto, Employee>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));
    }
}