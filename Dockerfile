FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
# Cloud Run expects the container to listen on port 8080 by default
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
# Copy csproj and restore as distinct layers
COPY ["Back_End/WebDuLich/WebDuLich.csproj", "Back_End/WebDuLich/"]
RUN dotnet restore "Back_End/WebDuLich/WebDuLich.csproj"
# Copy everything else and build
COPY . .
WORKDIR "/src/Back_End/WebDuLich"
RUN dotnet build "WebDuLich.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WebDuLich.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "WebDuLich.dll"]
