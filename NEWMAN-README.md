# Newman API Testing Guide

This project generates Postman collections dynamically as part of the build process for automated API testing with Newman.

## What's Included

- **generate-collection.js** - Script to generate Postman collections dynamically
- **Jenkinsfile** - Jenkins pipeline that builds collections and runs tests
- **package.json** - npm scripts for build and test automation

## Build Process

The Postman collection is **generated during the build process**, not stored in the repository. This allows for:
- Environment-specific collections (dev, staging, production)
- Dynamic endpoint configuration
- Build-time variable injection
- Version-controlled test logic

## Collection Contents

The collection includes example requests for:

### GET Requests
- Get All Users (with pagination)
- Get Single User

### POST Requests
- Create User
- Login (with authentication token)

### PUT Requests
- Update User

### DELETE Requests
- Delete User

Each request includes:
- Pre-configured endpoints using ReqRes API
- Response validation tests
- Response time assertions
- Data structure validations

## Installation

```bash
npm install
```

## Building the Collection

The collection must be generated before running tests:

```bash
# Generate collection with default settings
npm run build

# Generate collection for development environment
npm run build:dev

# Generate collection for production environment
npm run build:prod

# Generate with custom base URL
API_BASE_URL=https://api.example.com node generate-collection.js
```

The generated collection will be in `build/api-collection.json`.

## Running Tests Locally

### Using npm Scripts

```bash
# Build and run tests
npm run test:api

# Build and run with verbose output
npm run test:api:verbose

# Clean build artifacts
npm run clean
```

### Direct Newman Command

```bash
# First generate the collection
npm run build

# Then run with Newman
newman run build/api-collection.json

# With HTML report
newman run build/api-collection.json --reporters cli,html --reporter-html-export newman-reports/newman-report.html

# With environment variables
newman run build/api-collection.json -e environment.json

# With iterations
newman run build/api-collection.json -n 3

# With delay between requests
newman run build/api-collection.json --delay-request 500
```

## Jenkins Pipeline

The Jenkinsfile automates the entire process:

1. **Checkout** - Clone repository
2. **Install Dependencies** - Install npm packages and Newman
3. **Generate Collection** - Run `generate-collection.js` to create the collection
4. **Run API Tests** - Execute Newman with the generated collection
5. **Archive Artifacts** - Save the collection and test reports

### Pipeline Environment Variables

Configure these in Jenkins:
- `API_BASE_URL` - Base URL for API endpoints (default: https://reqres.in/api)
- `BUILD_NUMBER` - Automatically set by Jenkins
- `BUILD_DIR` - Output directory for collection (default: build)
- `NEWMAN_REPORTS` - Output directory for test reports (default: newman-reports)

### Downloading the Collection

After a successful build:
1. Go to the Jenkins build page
2. Click "Build Artifacts"
3. Download `build/api-collection.json`
4. Import into Postman for manual testing or modification

## Newman CLI Options

Common Newman options:

```bash
newman run <collection> [options]

Options:
  -e, --environment <file>     Environment file
  -g, --globals <file>         Globals file
  -d, --iteration-data <file>  CSV or JSON data file
  -n, --iteration-count <n>    Number of iterations
  --delay-request <ms>         Delay between requests
  --timeout-request <ms>       Request timeout
  --bail                       Stop on first error
  --reporters <reporters>      Output reporters (cli, json, html)
  --reporter-html-export       HTML report file path
  --reporter-json-export       JSON report file path
  --verbose                    Verbose output
```

## Test Assertions

The collection includes various test types:

### Status Code Tests
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

### Response Body Tests
```javascript
pm.test("Response has data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.exist;
});
```

### Response Time Tests
```javascript
pm.test("Response time < 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

## Customizing the Collection

### Adding New Requests

Edit `generate-collection.js` to add new requests:

```javascript
{
    name: "My New Request",
    event: [
        {
            listen: "test",
            script: {
                exec: [
                    "pm.test(\"Status code is 200\", function () {",
                    "    pm.response.to.have.status(200);",
                    "});"
                ],
                type: "text/javascript"
            }
        }
    ],
    request: {
        method: "GET",
        header: [],
        url: `${BASE_URL}/my-endpoint`,
        description: "My new API endpoint"
    },
    response: []
}
```

### Using Variables

The generator script supports environment variables:

- `API_BASE_URL` - Base URL for API endpoints
- `COLLECTION_NAME` - Name of the collection
- `BUILD_NUMBER` - Build number (set by Jenkins)
- `OUTPUT_DIR` - Output directory for generated files

Variables are automatically injected into the collection at build time.

### Environment Variables

Create an environment file (e.g., `environment.json`):

```json
{
  "name": "Development",
  "values": [
    {
      "key": "api_url",
      "value": "https://dev.api.example.com",
      "enabled": true
    },
    {
      "key": "api_key",
      "value": "your-api-key",
      "enabled": true
    }
  ]
}
```

Run with environment:
```bash
newman run api-collection.json -e environment.json
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install Newman
        run: npm install -g newman
      - name: Run API Tests
        run: newman run api-collection.json --reporters cli,json
```

### GitLab CI Example

```yaml
api-tests:
  image: node:18
  script:
    - npm install -g newman
    - newman run api-collection.json --reporters cli,json
  artifacts:
    reports:
      junit: newman-report.xml
```

## Viewing Reports

After running tests, open the generated HTML report:

```bash
open newman-report.html
```

The report includes:
- Test summary statistics
- Individual request results
- Response times and sizes
- Failed test details
- Complete request/response data

## Troubleshooting

### Collection Not Found
Make sure to build the collection first:
```bash
npm run build
```

### Newman Not Found
```bash
# Install globally
npm install -g newman

# Or use npx
npx newman run build/api-collection.json
```

### SSL Certificate Errors
```bash
newman run build/api-collection.json --insecure
```

### Timeout Errors
```bash
newman run build/api-collection.json --timeout-request 30000
```

### Build Directory Missing
The build directory is created automatically. If you see errors:
```bash
npm run clean
npm run build
```

## Best Practices

1. **Group Related Requests** - Use folders to organize tests
2. **Write Descriptive Tests** - Clear test names help debugging
3. **Use Variables** - Makes collections reusable across environments
4. **Check Response Times** - Monitor API performance
5. **Validate Data Structure** - Ensure API contract compliance
6. **Use Pre-request Scripts** - Setup data before requests
7. **Chain Requests** - Save data from responses for later use
8. **Version Control** - Keep collection.json in git

## Resources

- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
- [Postman Learning Center](https://learning.postman.com/)
- [ReqRes Test API](https://reqres.in/)
- [Chai Assertion Library](https://www.chaijs.com/api/bdd/)

## Example Output

```
→ Get All Users
  GET https://reqres.in/api/users?page=1 [200 OK, 1.2KB, 234ms]
  ✓ Status code is 200
  ✓ Response has data array
  ✓ Response time is less than 500ms

→ Create User
  POST https://reqres.in/api/users [201 Created, 389B, 312ms]
  ✓ Status code is 201
  ✓ Response contains user name
  ✓ Response contains ID

┌─────────────────────────┬───────────────────┬──────────────────┐
│                         │          executed │           failed │
├─────────────────────────┼───────────────────┼──────────────────┤
│              iterations │                 1 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│                requests │                 6 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│            test-scripts │                12 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│      prerequest-scripts │                 6 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│              assertions │                18 │                0 │
└─────────────────────────┴───────────────────┴──────────────────┘
```
