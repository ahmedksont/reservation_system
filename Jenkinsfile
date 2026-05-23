pipeline {

    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')
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
                    /opt/sonar-scanner/bin/sonar-scanner \
                    -Dsonar.projectKey=spring \
                    -Dsonar.projectName=reservation-system \
                    -Dsonar.sources=src \
                    -Dsonar.java.binaries=target/classes \
                    -Dsonar.host.url=http://91.134.240.148:9000 \
                    -Dsonar.token=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('Analyze Frontend with SonarQube') {
            steps {
                dir('frontend') {
                    sh """
                    /opt/sonar-scanner/bin/sonar-scanner \
                    -Dsonar.projectKey=reservation \
                    -Dsonar.projectName=reservation-frontend \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=http://91.134.240.148:9000 \
                    -Dsonar.token=${SONAR_TOKEN}
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
    }
}
