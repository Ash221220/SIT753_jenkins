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
                bat 'npm run audit'
            }
        }

        stage('Test') {
            steps {
                echo 'Running test command...'
                bat 'npm test'
            }
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