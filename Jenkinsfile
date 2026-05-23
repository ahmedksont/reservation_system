pipeline {

    agent any

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

                    withSonarQubeEnv('SonarQube') {

                        sh '''
                        /opt/sonar-scanner/bin/sonar-scanner \
                        -Dsonar.projectKey=spring \
                        -Dsonar.projectName=reservation-system \
                        -Dsonar.sources=src \
                        -Dsonar.java.binaries=target/classes
                        '''
                    }
                }
            }
        }

        stage('Quality Gate Backend') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Analyze Frontend with SonarQube') {
            steps {

                dir('frontend') {

                    withSonarQubeEnv('SonarQube') {

                        sh '''
                        /opt/sonar-scanner/bin/sonar-scanner \
                        -Dsonar.projectKey=Front \
                        -Dsonar.projectName=reservation-frontend \
                        -Dsonar.sources=.
                        '''
                    }
                }
            }
        }

        stage('Quality Gate Frontend') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
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
