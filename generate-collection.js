#!/usr/bin/env node

/**
 * Postman Collection Generator
 *
 * This script generates a Postman collection dynamically during the build process.
 * It can be customized to include environment-specific endpoints, authentication,
 * and test cases based on your API requirements.
 */

const fs = require('fs');
const path = require('path');

// Get configuration from environment variables or use defaults
const BASE_URL = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Generated API Collection';
const BUILD_NUMBER = process.env.BUILD_NUMBER || 'dev';

// Collection template
const collection = {
    info: {
        _postman_id: generateUUID(),
        name: `${COLLECTION_NAME} - Build ${BUILD_NUMBER}`,
        description: `Automatically generated Postman collection for API testing. Build: ${BUILD_NUMBER}, Generated: ${new Date().toISOString()}`,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [
        {
            name: "GET Requests",
            item: [
                {
                    name: "Get All Users",
                    event: [
                        {
                            listen: "test",
                            script: {
                                exec: [
                                    "pm.test(\"Status code is 200\", function () {",
                                    "    pm.response.to.have.status(200);",
                                    "});",
                                    "",
                                    "pm.test(\"Response is an array\", function () {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.expect(jsonData).to.be.an('array');",
                                    "});",
                                    "",
                                    "pm.test(\"Response time is less than 2000ms\", function () {",
                                    "    pm.expect(pm.response.responseTime).to.be.below(2000);",
                                    "});"
                                ],
                                type: "text/javascript"
                            }
                        }
                    ],
                    request: {
                        method: "GET",
                        header: [],
                        url: `${BASE_URL}/users`,
                        description: "Retrieve a list of users"
                    },
                    response: []
                },
                {
                    name: "Get Single User",
                    event: [
                        {
                            listen: "test",
                            script: {
                                exec: [
                                    "pm.test(\"Status code is 200\", function () {",
                                    "    pm.response.to.have.status(200);",
                                    "});",
                                    "",
                                    "pm.test(\"User has email\", function () {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.expect(jsonData.email).to.exist;",
                                    "});",
                                    "",
                                    "pm.test(\"User ID matches request\", function () {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.expect(jsonData.id).to.eql(1);",
                                    "});"
                                ],
                                type: "text/javascript"
                            }
                        }
                    ],
                    request: {
                        method: "GET",
                        header: [],
                        url: `${BASE_URL}/users/1`,
                        description: "Retrieve a single user by ID"
                    },
                    response: []
                }
            ]
        },
        {
            name: "POST Requests",
            item: [
                {
                    name: "Create Post",
                    event: [
                        {
                            listen: "test",
                            script: {
                                exec: [
                                    "pm.test(\"Status code is 201\", function () {",
                                    "    pm.response.to.have.status(201);",
                                    "});",
                                    "",
                                    "pm.test(\"Response contains title\", function () {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.expect(jsonData.title).to.exist;",
                                    "});",
                                    "",
                                    "pm.test(\"Response contains ID\", function () {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.expect(jsonData.id).to.exist;",
                                    "});"
                                ],
                                type: "text/javascript"
                            }
                        }
                    ],
                    request: {
                        method: "POST",
                        header: [
                            {
                                key: "Content-Type",
                                value: "application/json"
                            }
                        ],
                        body: {
                            mode: "raw",
                            raw: JSON.stringify({
                                title: "Test Post",
                                body: "This is a test post",
                                userId: 1
                            }, null, 2)
                        },
                        url: `${BASE_URL}/posts`,
                        description: "Create a new post"
                    },
                    response: []
                }
            ]
        },
        {
            name: "PUT Requests",
            item: [
                {
                    name: "Update Post",
                    event: [
                        {
                            listen: "test",
                            script: {
                                exec: [
                                    "pm.test(\"Status code is 200\", function () {",
                                    "    pm.response.to.have.status(200);",
                                    "});",
                                    "",
                                    "pm.test(\"Response contains title\", function () {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.expect(jsonData.title).to.exist;",
                                    "});",
                                    "",
                                    "pm.test(\"Response contains ID\", function () {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.expect(jsonData.id).to.exist;",
                                    "});"
                                ],
                                type: "text/javascript"
                            }
                        }
                    ],
                    request: {
                        method: "PUT",
                        header: [
                            {
                                key: "Content-Type",
                                value: "application/json"
                            }
                        ],
                        body: {
                            mode: "raw",
                            raw: JSON.stringify({
                                id: 1,
                                title: "Updated Post",
                                body: "This is an updated post",
                                userId: 1
                            }, null, 2)
                        },
                        url: `${BASE_URL}/posts/1`,
                        description: "Update an existing post"
                    },
                    response: []
                }
            ]
        },
        {
            name: "DELETE Requests",
            item: [
                {
                    name: "Delete Post",
                    event: [
                        {
                            listen: "test",
                            script: {
                                exec: [
                                    "pm.test(\"Status code is 200\", function () {",
                                    "    pm.response.to.have.status(200);",
                                    "});",
                                    "",
                                    "pm.test(\"Response time is acceptable\", function () {",
                                    "    pm.expect(pm.response.responseTime).to.be.below(2000);",
                                    "});"
                                ],
                                type: "text/javascript"
                            }
                        }
                    ],
                    request: {
                        method: "DELETE",
                        header: [],
                        url: `${BASE_URL}/posts/1`,
                        description: "Delete a post by ID"
                    },
                    response: []
                }
            ]
        }
    ],
    event: [
        {
            listen: "prerequest",
            script: {
                type: "text/javascript",
                exec: [
                    "console.log('Running request: ' + pm.info.requestName);"
                ]
            }
        },
        {
            listen: "test",
            script: {
                type: "text/javascript",
                exec: [
                    "pm.test(\"Response has valid JSON\", function () {",
                    "    pm.response.to.be.json;",
                    "});"
                ]
            }
        }
    ],
    variable: [
        {
            key: "base_url",
            value: BASE_URL,
            type: "string"
        },
        {
            key: "build_number",
            value: BUILD_NUMBER,
            type: "string"
        }
    ]
};

// Helper function to generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Output directory
const outputDir = process.env.OUTPUT_DIR || 'build';
const outputFile = path.join(outputDir, 'api-collection.json');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Write the collection to file
fs.writeFileSync(outputFile, JSON.stringify(collection, null, 2));

console.log('========================================');
console.log('Postman Collection Generated Successfully');
console.log('========================================');
console.log(`Collection Name: ${collection.info.name}`);
console.log(`Build Number: ${BUILD_NUMBER}`);
console.log(`Base URL: ${BASE_URL}`);
console.log(`Output File: ${outputFile}`);
console.log('========================================');

// Also create a metadata file
const metadata = {
    generatedAt: new Date().toISOString(),
    buildNumber: BUILD_NUMBER,
    baseUrl: BASE_URL,
    collectionName: COLLECTION_NAME,
    requestCount: collection.item.reduce((count, folder) => count + folder.item.length, 0),
    fileName: outputFile
};

fs.writeFileSync(
    path.join(outputDir, 'collection-metadata.json'),
    JSON.stringify(metadata, null, 2)
);

console.log('Metadata file created: collection-metadata.json');
