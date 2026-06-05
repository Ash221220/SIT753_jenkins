pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from Git repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing project dependencies...'
                bat 'npm install'
            }
        }

        stage('Lint Check') {
            steps {
                echo 'Running Expo ESLint checks...'
                bat 'npm run lint'
            }
        }

        stage('Security Audit') {
            steps {
                echo 'Running npm dependency vulnerability scan...'

                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    bat 'npm run audit'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo 'Running SonarQube static code analysis...'

                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {
                        withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                            bat """
                            "${scannerHome}\\bin\\sonar-scanner.bat" ^
                            -Dsonar.projectKey=snaprition ^
                            -Dsonar.projectName=Snaprition ^
                            -Dsonar.sources=. ^
                            -Dsonar.exclusions=node_modules/**,.expo/**,dist/**,build/**,coverage/** ^
                            -Dsonar.host.url=http://localhost:9000 ^
                            -Dsonar.token=%SONAR_TOKEN%
                            """
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo 'Checking SonarQube Quality Gate status...'

                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running test command...'
                bat 'npm test'
            }
        }
        stage('Docker Build') {
            steps {
                echo 'Building Docker image for Snaprition...'
                bat 'docker build -t snaprition-frontend:latest .'
            }
        }

        stage('Docker Staging Validation') {
            steps {
                echo 'Running Snaprition frontend container for staging validation...'

                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    bat '''
                    docker rm -f snaprition-frontend-staging || exit /b 0
                    docker run -d --name snaprition-frontend-staging -p 8081:8081 snaprition-frontend:latest
                    docker ps
                    '''
                }
            }
        }

    }
    stage('Release to Production') {
        steps {
            echo 'Releasing Snaprition frontend to production container...'

            bat '''
            docker tag snaprition-frontend:latest snaprition-frontend:production
            docker rm -f snaprition-frontend-production || exit /b 0
            docker run -d --name snaprition-frontend-production -p 8082:8081 snaprition-frontend:production
            docker ps
            '''
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }

        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the failed stage logs.'
        }
    }
}