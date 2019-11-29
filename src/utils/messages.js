

const generateMessage = (text, sender) => {
    return {
        text,
        sender,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (url, sender) => {
    return {
        url,
        sender,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}