# nr-bcws-wfprev
The goal of the BC Wildfire Service (BCWS) Prevention Program is to reduce the negative impacts of wildfire on public safety, property, the environment and the economy using the seven disciplines of the FireSmart program.

## Technologies used

* [Angular](https://angular.io/)
* [Spring Boot](https://spring.io/projects/spring-boot)
* [PostGIS](https://postgis.net/)
* [Terraform](https://www.terraform.io)
* [Terragrunt](https://terragrunt.gruntwork.io)
* [AWS](https://aws.amazon.com/)
* [Docker](https://www.docker.com/)

## Getting Started

## FOR CONVENIENCE

You can bring up the full system including the database, liquibase and the backend service with the following command:

```docker compose up```

That's it!

### Local Deployment

For local development, we recommend starting individual services with Docker

You can create a database instance via

```
docker pull postgis/postgis:16-3.4
docker run --name wfprev-postgres \
    --env-file .env.local \
    -e POSTGRES_USER=wfprev \
    -p 5432:5432 \
    -d postgis/postgis:16-3.4

```

Note: Mac users will get the following error, jsut ignore for now ```WARNING: The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8) and no specific platform was requested
f0de92debad131b48e2d72a9d211bafaa2b8bcb800e5077bb59f3225e5729086```

And build the database model with Liquibase:

```
cd db
docker build -t liquibase -f Dockerfile.liquibase.local .   
docker run --rm \
    --env-file .env.local \
    liquibase \
    /bin/bash -c 'liquibase \
    --url=jdbc:postgresql://host.docker.internal:5432/wfprev \
    --changelog-file=main-changelog.json \
    --username=wfprev \
    --password=$WFPREV_DB_PASSWORD \
    update'
```

The db/.env.local file should have the following content:

```
WFPREV_DB_PASSWORD=***
POSTGRES_PASSWORD=***
```

[![Lifecycle:Experimental](https://img.shields.io/badge/Lifecycle-Experimental-339999)](<Redirect-URL>)

