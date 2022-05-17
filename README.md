Project requirements specification document: See `Project Specs.pdf`

The project is deployed at https://node-assessment.herokuapp.com/ if you want to test the api remotely.
### Necessary steps
- Run `npm install` to install necessary packages
- Install npm packages `mocha` and `nodemon` globally.
  ```
  > npm install -g nodemon
  > npm install -g mocha
  ```
- Open up a local/remote MongoDB database and replace the connection address (`MONGODB`) in the `.env` file
- To start the development server:
  ```
  npm run dev
  ```
  The server will be available on port `5000`.
- All the endpoints are available at `/api`. See `DOCUMENTATION.pdf` for the full documentation of the API.
- Use a REST client like Postman or cURL to make calls to the API
- A barebones react frontend is provided for graphical interaction with the API.
- Install necessary packages for the frontend:
  ```
  cd client && npm install
  ```
- To start the frontend, open up another terminal and run at project root
  ```
  npm run client
  ```
  The client should be available at port `3000`
- Mentor and student calls can be performed with the client. Use Postman or cURL for performing admin calls.

### Unit Testing
Make sure you have installed necessary packages with `npm install` , installed `mocha` and `nodemon` globally, and replaced `MONGODB` in the `.env` with your database URI. Start the development server by running `npm run dev`. For running the tests, run either

```
mocha
```
or
```
npm run server-test
```

A total of `45` tests should pass.