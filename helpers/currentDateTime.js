function getNowDateAndTime() {
    let date = new Date()
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
}

module.exports = getNowDateAndTime