# File Upload System

This project is a file upload systtem.

## File Management

### User Upload

**Endpoint:** `/file/upload`  
**Method:** `POST`

Allows the upload files to system. You can upload files by multipart/form-data, application/json etc.

### File List

**Endpoint:** `/file/list`  
**Method:** `GET`

Returns names of all uploaded files.

### File Get

**Endpoint:** `/file/get`  
**Method:** `GET`

Returns informations about given filename.

**Query:**
- `filename` (string): The name of the requested file.

### File Delete

**Endpoint:** `/file/delete`  
**Method:** `DELETE`

Delete a file according to given filename.

**Query:**
- `filename` (string): The name of the requested file.

## Used Technologies

- Native Node.js (Zero Dependency)
- TypeScript
- Https (Self Signed SSL)
- Supertest
- Jest

## Node Version

The system is built using Node version v20.11.1.

## Note

- Normally important information such as `cert/cert.pem` and `cert/key.pem` should not be added to GitHub projects, but I added it so that the application can be run by everyone.
- Additionally, unit tests have been written for APIs.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/kmlcnclk/file-upload-system.git
    ```
2. Install dependencies:
    ```bash
    cd file-upload-system
    npm install
    ```
3. Run the application:
    ```bash
    npm run dev
    ```

## Contributing

Feel free to submit issues or pull requests for improvements and bug fixes.

## License

This project is licensed under the MIT License.

This documentation provides a comprehensive guide to using the APIs within our cryptocurrency trading system. For further details or support, please refer to the project's GitHub repository.
