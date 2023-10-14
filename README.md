### 📚 Library Management System

A library management system built with Node.js, Express, GraphQL, and MongoDB, designed to manage books and users of a library efficiently.

#### 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

##### Prerequisites

Ensure you have the following installed on your local machine:

- [Node.js & NPM](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community)

##### Installation & Setup

1. **Clone the repository:**

```sh
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

2. **Install dependencies:**

```sh
npm install
```

3. **Environment Variables:**

Create a `.env` file in the root directory and add the following with your credentials:

```env
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_JWT_SECRET
PORT=YOUR_PREFERRED_PORT_NUMBER
API_URL=http://localhost:4000
```

Note: Replace the placeholders (`YOUR_MONGODB_URI`, `YOUR_JWT_SECRET`, etc.) with your actual credentials without the angled brackets.

4. **Running the Application:**

To run the application:

```sh
npm start
```

For development, you can use:

```sh
npm run dev
```

#### 🔧 Usage & API Endpoints

##### User Authentication:

- **Sign Up:**

Endpoint: `/api/auth/signup`
Method: `POST`

Request Body:

```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "name": {
    "first": "John",
    "last": "Doe"
  }
  //...otherFields
}
```

- **Login:**

Endpoint: `/api/auth/login`
Method: `POST`

Request Body:

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

##### Books Management (GraphQL):

- **Add Book:**

Mutation:

```graphql
mutation {
  addBook(
    input: {
      title: "Book Title"
      author: "Author Name"
      department: "Department Name"
      publishedDate: "YYYY-MM-DD"
      isbn: "123-456-789"
    }
  ) {
    success
    message
    book {
      title
      author
    }
  }
}
```

#### Query Books:

**Using GraphQL:**

```graphql
query {
  books {
    title
    author
    department
  }
}
```

**With Filtering:**

To filter books based on certain criteria like author, title, or department, you can introduce arguments to your GraphQL query:

```graphql
query ($author: String, $title: String, $department: String) {
  books(author: $author, title: $title, department: $department) {
    title
    author
    department
  }
}
```

**Variables:**

When making the above query, you'll need to also send `variables` with your GraphQL request, e.g., using a tool like Apollo Client or GraphQL Playground:

```json
{
  "author": "Author Name",
  "title": "Partial Book Title",
  "department": "cse"
}
```

#### 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

#### 🙌 Acknowledgements

- [Express](https://expressjs.com/)
- [GraphQL](https://graphql.org/)
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/)
