using FluentValidation;
using SaveApp.Api.Data.Repositories;
using SaveApp.Api.DTOs.User;
using SaveApp.Api.DTOs.Benefits;
using SaveApp.Api.Services;
using SaveApp.Api.Validators;
using SaveApp.Api.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<BenefitsRepository>();
builder.Services.AddScoped<BenefitsService>();
builder.Services.AddScoped<IValidator<BenefitsRequestDto>, BenefitsValidator>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<IValidator<CreateUserDto>, UserValidator>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Pode comentar essa linha se estiver usando só HTTP local e der warning de HTTPS
// app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();