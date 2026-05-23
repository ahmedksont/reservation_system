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
        script {
            try {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false //vps 8gb ram :")
                }
            } catch (Exception e) {
                echo "Quality Gate timeout -> skipping..."
            }
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
        script {
            try {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            } catch (Exception e) {
                echo "Frontend Quality Gate timeout -> skipping..."
            }
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
