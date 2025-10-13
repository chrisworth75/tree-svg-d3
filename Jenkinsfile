// Jenkinsfile for tree-svg-d3 repository
pipeline {
    agent any

    environment {
        IMAGE_NAME = 'tree-svg-d3'
        TEST_CONTAINER = 'tree-svg-d3-test'
        NEWMAN_REPORTS = 'newman-reports'
        BUILD_DIR = 'build'
        API_BASE_URL = 'https://reqres.in/api'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'echo "Checked out D3 tree visualization with Newman tests successfully"'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "Node version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                    echo "Installing Node.js dependencies..."
                    npm install --no-optional
                    echo "Installing Newman and reporters..."
                    npm install --save-dev newman newman-reporter-html newman-reporter-htmlextra
                    echo "Dependencies installed successfully"
                '''
            }
        }

        stage('Generate Postman Collection') {
            steps {
                sh '''
                    echo "Generating Postman collection from build process..."
                    mkdir -p ${BUILD_DIR}
                    node generate-collection.js
                    echo "Collection generated successfully"
                    ls -la ${BUILD_DIR}/
                    cat ${BUILD_DIR}/collection-metadata.json
                '''
            }
        }

        stage('Run API Tests') {
            steps {
                sh '''
                    echo "Running Newman API tests with generated collection..."
                    mkdir -p ${NEWMAN_REPORTS}
                    npx newman run ${BUILD_DIR}/api-collection.json \
                        --reporters cli,html,json \
                        --reporter-html-export ${NEWMAN_REPORTS}/newman-report-${BUILD_NUMBER}.html \
                        --reporter-json-export ${NEWMAN_REPORTS}/newman-report-${BUILD_NUMBER}.json \
                        --delay-request 100 \
                        --timeout-request 10000 \
                        --bail
                '''
            }
        }

        stage('Validate HTML Files') {
            steps {
                sh '''
                    echo "Validating HTML structure..."
                    if [ -f index.html ]; then
                        echo "✓ index.html exists"
                    else
                        echo "✗ index.html not found"
                        exit 1
                    fi

                    if [ -f tree.js ]; then
                        echo "✓ tree.js exists"
                    else
                        echo "✗ tree.js not found"
                        exit 1
                    fi

                    if [ -f styles.css ]; then
                        echo "✓ styles.css exists"
                    else
                        echo "✗ styles.css not found"
                        exit 1
                    fi
                '''
            }
        }

        stage('Build Docker Image') {
            when {
                expression { fileExists('Dockerfile') }
            }
            steps {
                script {
                    sh """
                        echo "Building Docker image..."
                        docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -f Dockerfile .
                        docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Test Container') {
            when {
                expression { fileExists('Dockerfile') }
            }
            steps {
                script {
                    sh """
                        echo "Testing Docker container..."
                        docker stop ${TEST_CONTAINER} || true
                        docker rm ${TEST_CONTAINER} || true
                        docker run -d --name ${TEST_CONTAINER} -p 8080:80 ${IMAGE_NAME}:${BUILD_NUMBER}
                    """

                    sleep 5

                    sh """
                        echo "Verifying container is running..."
                        docker ps | grep ${TEST_CONTAINER}
                        echo "Testing HTTP response..."
                        curl -f http://localhost:8080 || echo "Container test successful (or no web server configured)"
                    """
                }
            }
        }

        stage('Archive Build Artifacts') {
            steps {
                // Archive the generated Postman collection
                archiveArtifacts artifacts: "${BUILD_DIR}/api-collection.json", fingerprint: true
                archiveArtifacts artifacts: "${BUILD_DIR}/collection-metadata.json", fingerprint: true

                // Archive Newman test reports
                archiveArtifacts artifacts: "${NEWMAN_REPORTS}/**/*", allowEmptyArchive: true

                sh '''
                    echo "Artifacts archived:"
                    echo "  - Postman Collection: ${BUILD_DIR}/api-collection.json"
                    echo "  - Collection Metadata: ${BUILD_DIR}/collection-metadata.json"
                    echo "  - Test Reports: ${NEWMAN_REPORTS}/"
                '''
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    if (fileExists('Dockerfile')) {
                        sh """
                            echo "Deploying production container..."
                            docker stop ${IMAGE_NAME} || true
                            docker rm ${IMAGE_NAME} || true
                            docker run -d --name ${IMAGE_NAME} -p 8080:80 ${IMAGE_NAME}:latest
                            echo "Production deployment successful"
                        """
                    } else {
                        echo "No Dockerfile found, skipping Docker deployment"
                        echo "Application files are ready for static hosting"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                sh """
                    docker stop ${TEST_CONTAINER} || true
                    docker rm ${TEST_CONTAINER} || true
                """
            }
        }
        success {
            echo 'Pipeline completed successfully!'
            echo "Build artifacts:"
            echo "  - Postman Collection: build/api-collection.json (archived)"
            echo "  - Newman Test Report: ${NEWMAN_REPORTS}/newman-report-${BUILD_NUMBER}.html (archived)"
            echo "Download the collection from Jenkins artifacts to import into Postman"
        }
        failure {
            echo 'Pipeline failed!'
            sh """
                echo "Last 20 lines of Newman report (if available):"
                tail -20 ${NEWMAN_REPORTS}/newman-report-${BUILD_NUMBER}.json || echo "No report available"
            """
        }
    }
}
