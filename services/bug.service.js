import fs from 'fs'
import { utilService } from './util.service.js'
import { pdfService } from './pdf.service.js'
let gBugs = utilService.readJsonFile('data/bug.json')

export const bugService = {
  query,
  getById,
  remove,
  save,
  hasBugs,
  getPdf,
}

const PAGE_SIZE = 3

function query(filterBy = { txt: '', severity: 0, userId: '' }, sortBy = { type: '', desc: 1 }) {
  var bugs = gBugs
  // SS - Filter~
  if (filterBy.txt) {
    const regex = new RegExp(filterBy.txt, 'i')
    bugs = gBugs.filter((bug) => regex.test(bug.title))
  }
  if (filterBy.severity) {
    bugs = bugs.filter((bug) => bug.severity > filterBy.severity)
  }
  console.log('filterBy.userId:', filterBy.userId)

  if (filterBy.userId) {
    bugs = bugs.filter((bug) => bug.creator._id === filterBy.userId)
  }
  if (filterBy.labels) {
    const labelsToFilter = filterBy.labels
    bugs = bugs.filter((bug) => labelsToFilter.some((label) => bug.labels.includes(label)))
  }
  const maxPage = Math.ceil(bugs.length / PAGE_SIZE)

  // sort
  if (sortBy.type === 'createdAt') {
    bugs.sort((b1, b2) => +sortBy.desc * (b2.createdAt - b1.createdAt))
  } else if (sortBy.type === 'severity') {
    bugs.sort((b1, b2) => +sortBy.desc * (b1.severity - b2.severity))
  } else if (sortBy.type === 'title') {
    bugs.sort((b1, b2) => +sortBy.desc * b1.title.localeCompare(b2.title))
  }

  // SS - Pagination~
  if (filterBy.pageIdx !== undefined) {
    const startIdx = filterBy.pageIdx * PAGE_SIZE
    bugs = bugs.slice(startIdx, startIdx + PAGE_SIZE)
  }
  return Promise.resolve({ bugs, maxPage })
}

function save(bug, loggedinUser) {
  if (bug._id) {
    const idx = gBugs.findIndex((currBug) => currBug._id === bug._id)
    if (idx === -1) return Promise.reject('No such bug')

    if (gBugs[idx].creator._id !== loggedinUser._id && !loggedinUser.isAdmin) {
      return Promise.reject('Not authorized update this bug')
    }
    gBugs[idx] = bug
  } else {
    bug.createdAt = Date.now()
    bug.labels = ['critical', 'need-CR']
    bug._id = _makeId()
    bug.description =
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel, earum sed corrupti voluptatum voluptatem at.'
    gBugs.push(bug)
  }
  return _saveBugsToFile().then(() => bug)
}

function remove(bugId, loggedinUser) {
  const idx = gBugs.findIndex((bug) => bug._id === bugId)
  if (idx === -1) return Promise.reject('No bug found')

  if (gBugs[idx].creator._id !== loggedinUser._id && !loggedinUser.isAdmin) {
    return Promise.reject('Not authorized delete this bug')
  }

  gBugs.splice(idx, 1)
  return _saveBugsToFile()
}

function getById(bugId) {
  const bug = gBugs.find((bug) => bug._id === bugId)
  if (!bug) return Promise.reject('No bug found')
  else return Promise.resolve(bug)
}

function hasBugs(userId) {
  const hasBugs = gBugs.some((bug) => bug.creator._id === userId)

  if (hasBugs) return Promise.reject('Cannot remove user with bugs')

  return Promise.resolve()
}

function getPdf() {
  pdfService.buildBugsPDF(gBugs) //pdf bonus
  return Promise.resolve()
}

function _makeId(length = 5) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var txt = ''
  for (let i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return txt
}

function _saveBugsToFile() {
  console.log('gBugs:', gBugs)
  return new Promise((resolve, reject) => {
    fs.writeFile('data/bug.json', JSON.stringify(gBugs, null, 2), (err) => {
      if (err) {
        console.log(err)
        reject('Cannot write to file')
      } else {
        console.log('Wrote Successfully!')
        resolve()
      }
    })
  })
}
