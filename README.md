# Hmmm is that right?

The start of a project aimed to be a market place for the exchange of information. i.e market place where news sources meet news readers.

A web app for made for quick **fact checking**. 🔎📰

A web-app to help people quickly fact check statements and news claims. The idea is to automate as much of the cross-checking process as possible.

Enter a news statement and the app will scrape related articles from a few different sources and display them in a table for the user.

The steps the app preforms are as follows:

1. The user enters a statement into the UI search bar:
   ![UI image](https://github.com/OrionMat/Hmm-is-that-right/blob/master/client/public/UI_landing.png?raw=true)
2. The UI sends the statement and the active news sources to the back-end server.
   ![UI search image](https://github.com/OrionMat/Hmm-is-that-right/blob/master/client/public/UI_search.png?raw=true) > (News sources can be toggled between active and inactive by clicking on them. Greyed out icons are displayed for de-activated news sources. Here the New York Times and Reuters news are activated, and so only articles from those News agencies will be scrapped).
3. The back-end server performs a google search query with the **statement** and **news sources**.
4. The resulting URLs taken from google are then used to programmatically visit the webpages and scrape the html.
5. The raw html is then parsed into a news piece object which contains the fields **Source, Title, Author, Date** and **Body**.
6. The news piece objects are then sent back the the UI to be displayed in a table for easy fact-checking.
   ![UI results table](https://github.com/OrionMat/Hmm-is-that-right/blob/master/client/public/UI_results.png?raw=true)

## Technical

The project is mainly written in TypeScript (a statically typed superset of Javascript). Babel is used to compile TypeScript down to JavaScript, then Webpack bundles the code for deployment.

- The UI is built with React ⚛️ and leverages TypeScript via `jsx` .
- The backend uses `express` and `axios` to handle the **http** requests sent between the front-end and the back-end.
- [Scale SERP](https://scaleserp.com/) is used as an interface with Google to search for relevant news and get the article links.
  > To run the web app you will need a google API key to get search results. This can be obtained for free [here](https://app.scaleserp.com/signup)

Creating a front-end react app:

- easiest way is to use create-react-app by running `npx create-react-app <my-app-name>`, then run `npm start` to run the application. (vite may be the newer way of doing this)
- core philosophy of React is composing applications from many specialized reusable components. The other key feature is that Javascript can be embedded and evaluated within components

## Run the Project

1. Clone the project [here](https://github.com/OrionMat/Hmm-is-that-right)
2. Install the dependencies:
   Open the terminal and change directory into the `client` folder (`cd client`). Then run the command `npm install` to install all the dependencies for the UI.
   Change directory into the server (`cd ../server` if you're still in the client folder) and run another `npm install`.
3. Create a file in the server folder called `.env` and paste: **SERP_SEARCH_API_KEY=**
   then paste your google API search key (can get a free one from [here](https://app.scaleserp.com/signup))
4. Run an `npm run build` in the server directory
5. Change into the Client directory and run a `npm run start`. This should kick off the UI.

## single-spa

single-apa is a javascript router for front-end microservices.

- Can have multiple frameworks in a single-page application (Angular, React, Vue.js, etc). Great for massive company UIs. Can deploy microfrontends independently
- Can write code using a new framework without rewriting the existing app

single-spa apps consist of the following:

1. A single-spa root config, which renders the HTML page and the JavaScript that registers applications. Each application is registered with three things: a name, a function to load the application's code, and a function that determines when the application is active/inactive
2. Applications, i.e single-page applications packaged up into modules. Each application must know how to bootstrap, mount, and unmount itself from the DOM. The applications must be able to coexist as they do not each have their own HTML page.
   - For example, your React or Angular SPAs are applications. When active, they can listen to url routing events and put content on the DOM.
   - When inactive, they do not listen to url routing events and are totally removed from the DOM.

The orgName should be the same across all applications as it is used as a namespace to enable in-browser module resolution.

### TODO: single-spa

- I've got the example application up and running, `cd Hmm-is-that-right\single-spa` and run `npm run start`. Next steps:

1. go through the example application and build up my understanding of how its working
2. migrate my existing hmmm app frontend into single-spa
3. migrate single spa into my existing frontend and merge to master

## TODO list

1. Deploy app on AWS to ping a live version (on branch deploy-app-aws-cloudFormation)
2. Integrate with ChatGPT API to get better stance detection between different news sources
   - summarise article, retrieve most similar/agreed sentence

## Deploy

aws cloudformation create-stack --stack-name HmmmIsThatRightApp --template-body file://getNewsPiecesBackend.yaml --capabilities CAPABILITY_NAMED_IAM
