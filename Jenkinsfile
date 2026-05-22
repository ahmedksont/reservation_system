pipeline {

    agent any

    tools {
        maven 'Maven-3.9'
        jdk 'JDK-21'
    }

    environment {
        SONAR_TOKEN = credentials('sqp_0204e713580a96d2c79f332336cb11fd05888c48')
    }

    stages {

        stage('Checkout Source Code') {
            steps {
                git branch: 'main',
                url: 'https://github.com/ahmedksont/reservation_system.git'
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean verify'
                }
            }
        }

        stage('Analyze Backend with SonarQube') {
            steps {
                dir('backend') {
                    sh """
                    sonar-scanner \
                    -Dsonar.projectKey=reservation-system \
                    -Dsonar.projectName=reservation-system \
                    -Dsonar.sources=src \
                    -Dsonar.host.url=http://91.134.240.148:9000 \
                    -Dsonar.login=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('Analyze Frontend with SonarQube') {
            steps {
                dir('frontend') {
                    sh """
                    sonar-scanner \
                    -Dsonar.projectKey=reservation-frontend \
                    -Dsonar.projectName=reservation-frontend \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=http://91.134.240.148:9000 \
                    -Dsonar.login=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('Deploy Artifact to Nexus') {
            steps {
                dir('backend') {
                    sh 'mvn deploy -DskipTests'
                }
            }
        }
    }

    post {

        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }

        always {
            archiveArtifacts artifacts: 'backend/target/*.jar', fingerprint: true
        }
    }
}
