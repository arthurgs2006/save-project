using FluentValidation;
using SaveApp.Api.Data.Repositories;
using SaveApp.Api.DTOs.User;
using SaveApp.Api.DTOs.Balance;
using SaveApp.Api.DTOs.Goals;
using SaveApp.Api.DTOs.Benefits;
using SaveApp.Api.DTOs.Recurring;
using SaveApp.Api.DTOs.Investments;
using SaveApp.Api.DTOs.Recommendations;
using SaveApp.Api.Services;
using SaveApp.Api.Validators;
using SaveApp.Api.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHttpClient<CurrencyService>();

builder.Services.AddScoped<BenefitsRepository>();
builder.Services.AddScoped<BenefitsService>();
builder.Services.AddScoped<IValidator<BenefitsRequestDto>, BenefitsValidator>();

builder.Services.AddScoped<InvestmentsService>();
builder.Services.AddScoped<IValidator<InvestmentSimulationRequestDto>, InvestmentSimulationValidator>();

builder.Services.AddScoped<RecommendationsService>();
builder.Services.AddScoped<IValidator<RecommendationRequestDto>, RecommendationValidator>();

builder.Services.AddScoped<RecurringTransactionsService>();
builder.Services.AddScoped<IValidator<RecurringTransactionRequestDto>, RecurringTransactionValidator>();

builder.Services.AddScoped<GoalsService>();
builder.Services.AddScoped<IValidator<GoalRequestDto>, GoalRequestValidator>();
builder.Services.AddScoped<IValidator<GoalMovementRequestDto>, GoalMovementRequestValidator>();

builder.Services.AddScoped<BalanceService>();
builder.Services.AddScoped<IValidator<DepositRequestDto>, DepositRequestValidator>();
builder.Services.AddScoped<IValidator<WithdrawRequestDto>, WithdrawRequestValidator>();

builder.Services.AddScoped<EducationService>();

builder.Services.AddScoped<FinancialHealthService>();

builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<IValidator<CreateUserDto>, UserValidator>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173","https://database-save-app.onrender.com/")
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

// app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();