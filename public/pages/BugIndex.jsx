const { useState, useEffect } = React
import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'
import { BugSort } from '../cmps/BugSort.jsx'
import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

export function BugIndex() {
  const [bugs, setBugs] = useState([])
  const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
  const [sortBy, setSortBy] = useState({ type: '', desc: 1 })
  const [maxPage, setMaxPage] = useState(null)


  useEffect(() => {
    loadBugs()
  }, [filterBy, sortBy])

  function loadBugs() {
    bugService.query(filterBy, sortBy).then(({ bugs, maxPage }) => {
      console.log('Bugs from DB:', bugs)
      setBugs(bugs)
      setMaxPage(maxPage)
    })
  }

  function onSetFilter(filterBy) {
    setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        console.log('Deleted Succesfully!')
        setBugs(prevBugs => prevBugs.filter(bug => bug._id !== bugId))
        showSuccessMsg('Bug removed')
      })
      .catch(err => {
        console.log('from remove bug', err)
        showErrorMsg('Cannot remove bug')
      })
  }

  function onAddBug() {
    const bug = {
      title: prompt('Bug title?'),
      severity: +prompt('Bug severity?'),
    }
    bugService
      .save(bug)
      .then(savedBug => {
        console.log('Added Bug', savedBug)
        setBugs(prevBugs => [...prevBugs, savedBug])
        showSuccessMsg('Bug added')
      })
      .catch(err => {
        console.log('from add bug', err)
        showErrorMsg('Cannot add bug')
      })
  }

  function onEditBug(bug) {
    const severity = +prompt('New severity?')
    const bugToSave = { ...bug, severity }
    bugService
      .save(bugToSave)
      .then(savedBug => {
        console.log('Updated Bug:', savedBug)
        setBugs(prevBugs =>
          prevBugs.map(currBug =>
            currBug._id === savedBug._id ? savedBug : currBug
          )
        )
        showSuccessMsg('Bug updated')
      })
      .catch(err => {
        console.log('from edit bug', err)
        showErrorMsg('Cannot update bug')
      })
  }

  function onSetSort(sortBy) {
    setSortBy(prevSort => ({ ...prevSort, ...sortBy }))
  }

  function onChangePageIdx(diff) {
    setFilterBy(prevFilter => {
      let newPageIdx = prevFilter.pageIdx + diff
      if (newPageIdx < 0) newPageIdx = 0
      if (newPageIdx > maxPage) newPageIdx = maxPage + 1
      if (newPageIdx === maxPage) newPageIdx = maxPage - 1
      return { ...prevFilter, pageIdx: newPageIdx, }
    })
  }

  function onDownloadBudsPdf() {
    bugService.downloadBudsPdf().then(() => {
      showSuccessMsg(`Bugs PDF download!`)
    })
  }

  return (
    <section className="main-layout">
      <BugFilter onSetFilter={onSetFilter} filterBy={filterBy} />
      <BugSort onSetSort={onSetSort} sortBy={sortBy} />
      <button className="btn" onClick={onAddBug}>
        Add Bug ⛐
      </button>
      <button className="btn-download" onClick={onDownloadBudsPdf}>Download PDF</button>

      <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
      <div className="paging flex">
        <button
          className="btn"
          onClick={() => {
            onChangePageIdx(-1)
          }}
        >
          Previous
        </button>
        <span>{filterBy.pageIdx + 1}</span>
        <button
          className="btn"
          onClick={() => {
            onChangePageIdx(1)
          }}
        >
          Next
        </button>
      </div>
    </section>

  )
}
