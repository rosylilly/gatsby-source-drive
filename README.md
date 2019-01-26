# gatsby-plugin-drive

Downloads a Google Drive folder and adds graphql nodes for the files.

> This is still a work in progress.

## Installation

```bash
yarn add gatsby-source-drive
```

## How to Use

In order to use this plugin, you'll need to generate a Google Service Account and share your drive folder with its email. [Here's a guide](https://www.twilio.com/blog/2017/03/google-spreadsheets-and-javascriptnode-js.html). The below configuration references values in the JSON keyfile.

```js
// In your gatsby-config.js

plugins: [
  {
    resolve: `gatsby-source-drive`,
    options: {
      folderId: `GOOGLE_DRIVE_FOLDER_ID`,
      key: `value of "private_key" in key file`,
      serviceAccountEmail: `value of "client_email" in key file`
    },
  },
],
```

The `key` is very long (and also not something you'll want in a VCS-checked-in file), so I recommend using a solution like [dotenv](https://www.npmjs.com/package/dotenv) to store the values in an `.env` file, and then referencing them like so:

```js
plugins: [
  {
    resolve: `gatsby-source-drive`,
    options: {
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      key: process.env.GOOGLE_KEY,
      serviceAccountEmail: process.env.GOOGLE_SA_EMAIL
    },
  },
],
```

And then if you deploy to [Netlify](https://www.netlify.com) (or similar), you can use their environment variables UI to store the values.

## How to Query

```graphql
  query {
    allDriveNode {
      edges {
        node {
          id
          fields { slug }
          localFile {
            # e.g., for an image
            childImageSharp {
              fixed(width: 150, height: 150) {
                ...GatsbyImageSharpFixed
              }
            }
          }
        }
      }
    }
  }
```


## Author

* Joe Palmieri https://jpalmieri.com [Lumos Labs](https://www.lumosity.com)
