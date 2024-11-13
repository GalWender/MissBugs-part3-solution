
import { storageService } from './async-storage.service.js'

const BASE_URL = `/api/bug/`
const STORAGE_KEY = 'bugDB'
let gPageIdx = 0

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    downloadBudsPdf
}
// AFTER REST!!
function query(filterBy, sortBy) {
    // let url = BASE_URL + `?pageIdx=${gPageIdx}`
    // if (gFilterBy.txt) url += `&txt=${gFilterBy.txt}`
    // if (gFilterBy.severity) url += `&severity=${gFilterBy.severity}`
    // if (gFilterBy.labels) url += `&labels=${gFilterBy.labels}`
    // if (gSortBy.type) url += `&sortBy=${gSortBy.type}&desc=${gSortBy.desc}`
    // return axios.get(url).then(res => res.data)
    const filterSortBy = { ...filterBy, ...sortBy }
    return axios.get(BASE_URL, { params: filterSortBy }).then(res => res.data)
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId).then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
}

function save(bug) {
    const method = bug._id ? 'put' : 'post'
    return axios[method](BASE_URL, bug).then(res => res.data)
}


function getDefaultFilter() {
    return { title: '', minSeverity: '', labels: '', pageIdx: 0 }
}


function downloadBudsPdf() {
    return axios.get(BASE_URL + 'pdf').then(res => res.data)
}

// function _updateBug(bug) {
//     console.log('bug', bug);
//     return axios.put(BASE_URL, { bug }).then(res => res.data)
// }

// function _addBug(bug) {
//     console.log('bug:', bug)
//     return axios.post(BASE_URL, { bug }).then(res => res.data)
// }

// BEFORE REST!!
// function query(filterBy = null) {
//     return axios.get(BASE_URL).then(res => res.data)
//         .then((bugs) => {
//             console.log('bugs', bugs);
//             if (!filterBy) return bugs
//             let { txt, severity } = filterBy
//             if (!severity) severity = 0;
//             return bugs.filter(bug => (
//                 bug.title.includes(txt) && bug.severity >= severity
//             ))
//         })
//     // return storageService.query(STORAGE_KEY)
// }
// function getById(bugId) {
//     return axios.get(BASE_URL + bugId).then(res => res.data)
//     // return storageService.get(STORAGE_KEY, bugId)
// }
// function remove(bugId) {
//     return axios.delete(BASE_URL + bugId).then(res => res.data)
//     // return storageService.remove(STORAGE_KEY, bugId)
// }
// function save(bug) {
//     const url = BASE_URL + `save?title=${bug.title}&severity=${bug.severity}&_id=${bug._id || ''}`
//     return axios.get(url).then(res => res.data)
//     // if (bug._id) {
//     //     return storageService.put(STORAGE_KEY, bug)
//     // } else {
//     //     return storageService.post(STORAGE_KEY, bug)
//     // }
// }