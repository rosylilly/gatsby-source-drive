const googleapi = require(`./googleapis`);
const fetch = require(`node-fetch`)
const crypto = require(`crypto`)
const path = require(`path`)
const createRemoteFileNode = require(`gatsby-source-filesystem`).createRemoteFileNode

const FOLDER = `application/vnd.google-apps.folder`;

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest }, configOptions
) => {
  const { createNode } = actions
  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins
  const { serviceAccountEmail, folderId } = configOptions

  // Needed to add keys to Netlify's environment variable UI
  // https://stackoverflow.com/questions/36636245/error-signing-jwt-using-rsa-private-key-loaded-from-env-file-via-heroku-foreman
  const key = configOptions.key.replace(/\\n/g, '\n');

  // Get token and fetch root folder.
  const token = await googleapi.getToken(key, serviceAccountEmail)
  const cmsFiles = await googleapi.getFolder(folderId, token)

  for (const file of cmsFiles) {
    if (file.mimeType !== FOLDER) {
      const nodeId = createNodeId(`drive-file-${file.id}`)
      const nodeContent = JSON.stringify(file)
      const nodeContentDigest = crypto
        .createHash("md5")
        .update(nodeContent)
        .digest("hex")
      const resp = await googleapi.getFile(file.id, token)
      const {
        webContentLink,
        createdTime
      } = JSON.parse(resp)
      const node = Object.assign({}, file, {
        id: nodeId,
        parent: `__SOURCE__`,
        children: [],
        url: webContentLink.split('&')[0],
        createdTime,
        internal: {
          type: `DriveNode`,
          mediaType: file.mimeType,
          content: nodeContent,
          contentDigest: nodeContentDigest
        },
        name: file.name,
      })
      createNode(node)
    }
  }
}

exports.onCreateNode = async function ({  node, cache, actions, store, createNodeId }) {
  let fileNode
  const { createNode, createNodeField } = actions
  if (node.internal.type === `DriveNode`) {
    const { url, name } = node
    try {
      const fileNode = await createRemoteFileNode({
        url,
        store,
        cache,
        createNode,
        createNodeId,
        ext: path.extname(node.name),
      })
      if (fileNode) {
        node.localFile___NODE = fileNode.id
        const slug = name
          .slice(name.length - 30, name.length)
          .toLowerCase()
          .replace(/\W+/g, '-')
        createNodeField({
          node,
          name: 'slug',
          value: slug
        })
      }
    } catch (e) {
      console.log(`Error creating remote file`, e)
    }
  }
}
