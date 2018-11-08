import axios from 'axios'
import get from 'lodash/get'
import groupBy from 'lodash/groupBy'
import mapValues from 'lodash/mapValues'

import { downloadBlob } from '~/util'

const transformData = data => mapValues(data, entries => groupBy(entries, 'file'))

/*const body = JSON.parse(proxyResData)
          return _.mapValues(body, (revisions, folder) => {
            return (
              revisions &&
              revisions.map(revision => {
                const rpath = revision.path
                const sfolder = path.sep + folder + path.sep
                const file = rpath.substr(rpath.indexOf(sfolder) + sfolder.length)
                return {
                  ...revision,
                  file
                }
              })
            )
          })*/
export const fetchStatus = () =>
  axios.get(`${window.BOT_API_PATH}/versioning/pending`).then(({ data }) => {
    return transformData(data)
  })

export const getHost = () => {
  const { protocol, host } = document.location
  return `${protocol}//${host}`
}

export const revertPendingFileChanges = data => {
  const reqData = { filePath: data.path, revision: data.revision }
  return axios.post(`${window.BOT_API_PATH}/versioning/revert`, reqData).then()
}

export const exportArchive = async () => {
  const res = await axios.get(`${window.BOT_API_PATH}/versioning/export`, { responseType: 'blob' })
  let name = get(res, 'headers.content-disposition', 'archive.tgz')

  if (name.includes('filename=')) {
    name = name.substr(name.indexOf('filename=') + 'filename='.length)
  }

  downloadBlob(name, res.data)
}
