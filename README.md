# Real-time Chat Application

This repository contains a real-time chat application built using NestJS, Redis, MongoDB for the backend, and Next.js for the frontend.

## Installation and Setup

### Prerequisites
- Node.js (version >= 12.0.0)
- Docker (for running Redis and MongoDB containers)

### Backend Setup

1. **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2. **Set Up Environment Variables:**
    - Create a `.env` file in the root directory using `.env.example` as a template.
    - Modify the environment variables as needed, including database connection strings and application ports.

3. **Start Docker Containers:**
    - Make sure Docker is installed and running.
    - Start Redis and MongoDB containers using Docker Compose:
        ```bash
        docker-compose up -d
        ```

4. **Install Dependencies and Start the Backend Server:**
    - Navigate to the backend directory:
        ```bash
        cd backend
        ```
    - Install dependencies:
        ```bash
        npm install
        ```
    - Start the backend server:
        ```bash
        npm run start:dev
        ```

### Frontend Setup

1. **Navigate to the Frontend Directory:**
    ```bash
    cd frontend
    ```

2. **Install Dependencies and Start the Frontend Server:**
    - Install dependencies:
        ```bash
        npm install
        ```
    - Start the frontend server:
        ```bash
        npm run dev
        ```

### Accessing the Application

- Open your web browser and go to `http://localhost:3000` to access the chat application.
- Sign up or log in to start chatting and using video conferencing.


### Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your proposed changes.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Authors

- [Oxygen](https://github.com/system01no2l)

### Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc.

### Contact

For questions or feedback, please contact [Your Email](mailto:duybatran2110@example.com).


